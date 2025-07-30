/**
 * Sistema de Trading Autónomo con IA
 * 
 * Este módulo implementa un agente de trading que utiliza OpenAI para tomar decisiones
 * de inversión automáticas. El agente puede comprar/vender acciones, analizar mercados
 * y gestionar un portfolio de manera autónoma.
 * 
 * @author Sistema de Trading IA
 * @version 1.0.0
 */

import { Agent, AgentInputItem, run, tool } from "@openai/agents";
import { existsSync } from "fs";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import invariant from "tiny-invariant";
import { z } from "zod";

// Verificar que la API key de OpenAI esté configurada
invariant(process.env.OPENAI_API_KEY, "OPENAI_API_KEY is not set");
const client = new OpenAI();

/**
 * Función de logging con timestamp que registra tanto en consola como en archivo
 * @param message - Mensaje a registrar
 */
const log = (message: string) => {
  message = `[${new Date().toISOString()}] ${message}`;
  console.log(message);
  appendFile("agent.log", message + "\n");
};

/**
 * Schema de validación para la estructura del portfolio
 * Define la estructura de datos del portfolio del agente de trading
 */
const portfolioSchema = z.object({
  /** Efectivo disponible para trading */
  cash: z.number(),
  /** Holdings actuales: ticker -> cantidad de acciones */
  holdings: z.record(z.string(), z.number()),
  /** Historial completo de transacciones */
  history: z.array(
    z.object({
      /** Fecha y hora de la transacción en formato ISO */
      date: z.string().datetime(),
      /** Tipo de operación: compra o venta */
      type: z.enum(["buy", "sell"]),
      /** Símbolo de la acción (ej: AAPL, TSLA) */
      ticker: z.string(),
      /** Número de acciones en la transacción */
      shares: z.number(),
      /** Precio por acción al momento de la transacción */
      price: z.number(),
      /** Valor total de la transacción */
      total: z.number(),
    })
  ),
});

/** Tipo inferido del schema del portfolio */
type Portfolio = z.infer<typeof portfolioSchema>;

/**
 * Realiza búsquedas web utilizando OpenAI con herramientas de búsqueda
 * @param query - Consulta de búsqueda
 * @returns Resumen en markdown de los resultados encontrados
 */
const webSearch = async (query: string): Promise<string> => {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `Please use web search to answer this query from the user and respond with a short summary in markdown of what you found:\n\n${query}`,
    tools: [{ type: "web_search_preview" }],
  });
  return response.output_text;
};

/**
 * Obtiene el precio actual de una acción específica usando búsqueda web
 * @param ticker - Símbolo de la acción (ej: AAPL, TSLA)
 * @returns Precio actual de la acción
 * @throws Error si no se puede obtener el precio
 */
const getStockPrice = async (ticker: string): Promise<number> => {
  const response = await client.responses.parse({
    model: "gpt-4.1-mini",
    input: `What is the current price of the stock ticker $${ticker}? Please use web search to get the latest price and then answer in short.`,
    tools: [{ type: "web_search_preview" }],
    text: { format: zodTextFormat(z.object({ price: z.number() }), "price") },
  });
  if (!response.output_parsed) throw new Error("Failed to get stock price");
  return response.output_parsed.price;
};

/**
 * Lee y valida el portfolio desde el archivo JSON
 * @returns Portfolio validado con estructura correcta
 * @throws Error si el arquivo no existe o tiene formato inválido
 */
const getPortfolio = async (): Promise<Portfolio> => {
  const portfolioData = await readFile("portfolio.json", "utf-8");
  const portfolio = portfolioSchema.parse(JSON.parse(portfolioData));
  return portfolio;
};

const getPortfolioTool = tool({
  name: "get_portfolio",
  description: "Get your portfolio",
  parameters: z.object({}),
  async execute() {
    const portfolio = await getPortfolio();
    log(`💹 Fetched portfolio: $${portfolio.cash}`);
    return `Your cash balance is $${portfolio.cash}.
Current holdings:
${Object.entries(portfolio.holdings)
  .map(([ticker, shares]) => `  - ${ticker}: ${shares} shares`)
  .join("\n")}\n\nTrade history:
${portfolio.history
  .map(
    (trade) =>
      `  - ${trade.date} ${trade.type} ${trade.ticker} ${trade.shares} shares at $${trade.price} per share, for a total of $${trade.total}`
  )
  .join("\n")}`;
  },
});

const getNetWorthTool = tool({
  name: "get_net_worth",
  description: "Get your current net worth (total portfolio value)",
  parameters: z.object({}),
  async execute() {
    const netWorth = await calculateNetWorth();
    const portfolio = await getPortfolio();
    const annualizedReturn = await calculateAnnualizedReturn(portfolio);

    log(
      `💰 Current net worth: $${netWorth} (${annualizedReturn}% annualized return)`
    );

    return `Your current net worth is $${netWorth}
- Cash: $${portfolio.cash}
- Holdings value: $${(netWorth - portfolio.cash).toFixed(2)}
- Annualized return: ${annualizedReturn}% (started with $1,000)
- ${netWorth >= 1000 ? "📈 Up" : "📉 Down"} $${Math.abs(
      netWorth - 1000
    ).toFixed(2)} from initial investment`;
  },
});

/**
 * Herramienta del agente para comprar acciones
 * Verifica fondos disponibles, actualiza holdings y registra la transacción
 */
const buyTool = tool({
  name: "buy",
  description: "Buy a given stock at the current market price",
  parameters: z.object({
    ticker: z.string(),
    shares: z.number().positive(),
  }),
  async execute({ ticker, shares }) {
    const price = await getStockPrice(ticker);
    const portfolio = await getPortfolio();
    if (portfolio.cash < shares * price)
      return `You don't have enough cash to buy ${shares} shares of ${ticker}. Your cash balance is $${portfolio.cash} and the price is $${price} per share.`;

    portfolio.holdings[ticker] = (portfolio.holdings[ticker] ?? 0) + shares;
    portfolio.history.push({
      date: new Date().toISOString(),
      type: "buy",
      ticker,
      shares,
      price,
      total: shares * price,
    });
    portfolio.cash = Math.round((portfolio.cash - shares * price) * 100) / 100;
    await writeFile("portfolio.json", JSON.stringify(portfolio, null, 2));

    log(`💰 Purchased ${shares} shares of ${ticker} at $${price} per share`);
    return `Purchased ${shares} shares of ${ticker} at $${price} per share, for a total of $${
      shares * price
    }. Your cash balance is now $${portfolio.cash}.`;
  },
});

/**
 * Herramienta del agente para vender acciones
 * Verifica acciones disponibles, actualiza efectivo y registra la transacción
 */
const sellTool = tool({
  name: "sell",
  description: "Sell a given stock at the current market price",
  parameters: z.object({
    ticker: z.string(),
    shares: z.number().positive(),
  }),
  async execute({ ticker, shares }) {
    const portfolio = await getPortfolio();
    if (portfolio.holdings[ticker] < shares)
      return `You don't have enough shares of ${ticker} to sell. You have ${portfolio.holdings[ticker]} shares.`;

    const price = await getStockPrice(ticker);
    portfolio.holdings[ticker] = (portfolio.holdings[ticker] ?? 0) - shares;
    portfolio.history.push({
      date: new Date().toISOString(),
      type: "sell",
      ticker,
      shares,
      price,
      total: shares * price,
    });
    portfolio.cash = Math.round((portfolio.cash + shares * price) * 100) / 100;
    await writeFile("portfolio.json", JSON.stringify(portfolio, null, 2));

    log(`💸 Sold ${shares} shares of ${ticker} at $${price} per share`);
    return `Sold ${shares} shares of ${ticker} at $${price} per share, for a total of $${
      shares * price
    }. Your cash balance is now $${portfolio.cash}.`;
  },
});

/**
 * Herramienta del agente para consultar precios de acciones
 * Utiliza búsqueda web para obtener precios actualizados
 */
const getStockPriceTool = tool({
  name: "get_stock_price",
  description: "Get the current price of a given stock ticker",
  parameters: z.object({
    ticker: z.string(),
  }),
  async execute({ ticker }) {
    const price = await getStockPrice(ticker);
    log(`🔖 Searched for stock price for ${ticker}: $${price}`);
    return price;
  },
});

/**
 * Herramienta del agente para realizar búsquedas web
 * Permite investigar noticias, análisis de mercado e información financiera
 */
const webSearchTool = tool({
  name: "web_search",
  description: "Search the web for information",
  parameters: z.object({
    query: z.string(),
  }),
  async execute({ query }) {
    log(`🔍 Searching the web for: ${query}`);
    const result = await webSearch(query);
    return result;
  },
});

/**
 * Herramienta obligatoria del agente para procesos de razonamiento
 * Registra cada paso del proceso de toma de decisiones del agente
 */
const thinkTool = tool({
  name: "think",
  description: "Think about a given topic",
  parameters: z.object({
    thought_process: z.array(z.string()),
  }),
  async execute({ thought_process }) {
    thought_process.forEach((thought) => log(`🧠 ${thought}`));
    return `Completed thinking with ${thought_process.length} steps of reasoning.`;
  },
});

const calculateNetWorth = async (): Promise<number> => {
  const portfolio = await getPortfolio();
  let totalHoldingsValue = 0;
  for (const [ticker, shares] of Object.entries(portfolio.holdings))
    if (shares > 0) {
      try {
        const price = await getStockPrice(ticker);
        totalHoldingsValue += shares * price;
      } catch (error) {
        log(`⚠️ Failed to get price for ${ticker}: ${error}`);
      }
    }

  const netWorth =
    Math.round((portfolio.cash + totalHoldingsValue) * 100) / 100;
  return netWorth;
};

const calculateCAGR = (days: number, currentValue: number): number => {
  const startValue = 1000;
  const years = days / 365;
  const cagr = Math.pow(currentValue / startValue, 1 / years) - 1;
  return cagr;
};

/**
 * Calcula el retorno anualizado del portfolio desde la primera transacción
 * @param portfolio - Datos del portfolio incluyendo historial
 * @returns String formateado del CAGR como porcentaje (ej: "15.25%")
 */
const calculateAnnualizedReturn = async (
  portfolio: z.infer<typeof portfolioSchema>
): Promise<string> => {
  if (portfolio.history.length === 0) return "0.00";

  const firstTradeDate = new Date(portfolio.history[0].date);
  const currentDate = new Date();

  let totalHoldingsValue = 0;
  for (const [ticker, shares] of Object.entries(portfolio.holdings))
    if (shares > 0) {
      try {
        const price = await getStockPrice(ticker);
        totalHoldingsValue += shares * price;
      } catch (error) {
        log(`⚠️ Failed to get price for ${ticker}: ${error}`);
      }
    }

  const currentTotalValue = portfolio.cash + totalHoldingsValue;
  log(`💰 Current total value: $${currentTotalValue}`);

  const days =
    (currentDate.getTime() - firstTradeDate.getTime()) / (1000 * 60 * 60 * 24);
  log(`🗓 Days since first trade: ${days.toFixed(2)}`);

  if (days < 1) {
    log("⏳ Not enough time has passed to compute CAGR accurately.");
    return "N/A";
  }

  const cagr = calculateCAGR(days, currentTotalValue);
  log(`💰 CAGR: ${cagr * 100}%`);

  return (cagr * 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Calcula el valor detallado del portfolio incluyendo cada holding
 * @returns Objeto con valor total y desglose de cada holding
 */
const calculatePortfolioValue = async (): Promise<{
  totalValue: number;
  holdings: Record<string, { shares: number; value: number }>;
}> => {
  const portfolio = await getPortfolio();
  const holdingsWithValues: Record<string, { shares: number; value: number }> =
    {};
  let totalHoldingsValue = 0;

  for (const [ticker, shares] of Object.entries(portfolio.holdings)) {
    if (shares > 0) {
      try {
        const price = await getStockPrice(ticker);
        const value = Math.round(shares * price * 100) / 100;
        holdingsWithValues[ticker] = { shares, value };
        totalHoldingsValue += value;
      } catch (error) {
        log(`⚠️ Failed to get price for ${ticker}: ${error}`);
        holdingsWithValues[ticker] = { shares, value: 0 };
      }
    }
  }

  const totalValue =
    Math.round((portfolio.cash + totalHoldingsValue) * 100) / 100;
  return { totalValue, holdings: holdingsWithValues };
};

/**
 * Carga el historial de conversación desde archivo JSON
 * @returns Array de elementos del hilo de conversación o array vacío si no existe
 */
const loadThread = async (): Promise<AgentInputItem[]> => {
  try {
    if (existsSync("thread.json")) {
      const threadData = await readFile("thread.json", "utf-8");
      return JSON.parse(threadData);
    }
  } catch (error) {
    log(`⚠️ Failed to load thread history: ${error}`);
  }
  return [];
};

/**
 * Guarda el historial de conversación en archivo JSON
 * @param thread - Array de elementos del hilo de conversación a guardar
 */
const saveThread = async (thread: AgentInputItem[]) => {
  try {
    await writeFile("thread.json", JSON.stringify(thread, null, 2));
    log(`💾 Saved thread history (${thread.length} items)`);
  } catch (error) {
    log(`❌ Failed to save thread history: ${error}`);
  }
};

/**
 * Actualiza el archivo README.md con información actual del portfolio
 * Genera una sección con valor total, holdings y trades recientes
 */
const updateReadme = async () => {
  try {
    const portfolio = await getPortfolio();
    const { totalValue, holdings } = await calculatePortfolioValue();
    const readmeContent = await readFile("README.md", "utf-8");
    const recentTrades = portfolio.history.slice(-20).reverse();
    const annualizedReturn = await calculateAnnualizedReturn(portfolio);
    const portfolioSection = `<!-- auto start -->

## 💰 Portfolio value: $${totalValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}** (${annualizedReturn}% CAGR)

### 📊 Holdings

| Asset | Shares | Value |
|-------|--------|-------|
| Cash | - | $${portfolio.cash.toFixed(2)} |
${Object.entries(holdings)
  .map(
    ([ticker, data]) =>
      `| ${ticker} | ${data.shares} | $${data.value.toFixed(2)} |`
  )
  .join("\n")}

### 📈 Recent trades

${
  recentTrades.length > 0
    ? recentTrades
        .map(
          (trade) =>
            `- **${new Date(trade.date).toLocaleString("en-US", {
              timeZone: "UTC",
              dateStyle: "long",
              timeStyle: "medium",
            })}**: ${trade.type.toUpperCase()} ${trade.shares} ${
              trade.ticker
            } @ $${trade.price}/share ($${trade.total.toFixed(2)})`
        )
        .slice(0, 10)
        .join("\n")
    : "- No trades yet"
}

<!-- auto end -->`;

    const updatedReadme = readmeContent.replace(
      /<!-- auto start -->[\s\S]*<!-- auto end -->/,
      portfolioSection
    );

    await writeFile("README.md", updatedReadme);
    log(`📝 Updated README with portfolio value: $${totalValue}`);
  } catch (error) {
    log(`❌ Failed to update README: ${error}`);
  }
};

/**
 * Configuración e inicialización del agente de trading
 */
const agent = new Agent({
  name: "Assistant",
  instructions: await readFile("system-prompt.md", "utf-8"),
  tools: [
    thinkTool,
    webSearchTool,
    buyTool,
    sellTool,
    getStockPriceTool,
    getPortfolioTool,
    getNetWorthTool,
  ],
});

// Inicio de la ejecución del agente
log("Starting agent");

// Cargar historial previo y ejecutar el agente con mensaje de trading
const thread = await loadThread();
const result = await run(
  agent,
  thread.concat({
    role: "user",
    content: `It's ${new Date().toLocaleString(
      "en-US"
    )}. Time for your trading analysis! Review your portfolio, scan the markets for opportunities, and make strategic trades to grow your initial $1,000 investment. Good luck! 📈`,
  }),
  { maxTurns: 100 }
);
log(`🎉 Agent finished: ${result.finalOutput}`);

// Guardar resultados y actualizar documentación
await saveThread(result.history);
await updateReadme();
