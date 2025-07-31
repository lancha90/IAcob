/**
 * Herramientas del Portfolio
 * 
 * Tools relacionadas con la gestión y consulta del portfolio del agente
 * 
 * @author Sistema de Trading IA
 * @version 1.0.0
 */

import { tool } from "@openai/agents";
import { z } from "zod";
import { calculateAnnualizedReturn, calculateNetWorth, getPortfolio } from "../portafolio.usecase.js";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

/**
 * Herramienta del agente para consultar el estado actual del portfolio
 * Muestra efectivo, holdings y historial completo de transacciones
 */
export const getPortfolioTool = tool({
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
  .join("\\n")}\\n\\nTrade history:
${portfolio.history?.map(
    (trade) =>
      `  - ${trade.created_at} ${trade.type} ${trade.ticker} ${trade.shares} shares at $${trade.price} per share, for a total of $${trade.total}`
  )
  .join("\\n")}`;
  },
});

/**
 * Herramienta del agente para calcular el valor neto total del portfolio
 * Incluye efectivo, valor de holdings, y retorno anualizado (CAGR)
 */
export const getNetWorthTool = tool({
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