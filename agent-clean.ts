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

import 'dotenv/config';
import { Agent, AgentInputItem, run } from "@openai/agents";
import { appendFile, readFile } from "node:fs/promises";
import OpenAI from "openai";
import invariant from "tiny-invariant";
import { setLogFunction as setPortfolioLogFunction } from "./usecase/tools/portfolio.tools.js";
import { setLogFunction as setTradingLogFunction } from "./usecase/tools/trading.tools.js";
import { getStockPriceTool, getCryptoPriceTool, setLogFunction as setStockLogFunction } from "./usecase/tools/stock.tools.js";
import { setOpenAIClient as setStockOpenAIClient } from './usecase/stock.usercase.js';
import { setOpenAIClient as setWebSearchOpenAIClient } from './usecase/websearch.usecase.js';
import { updateReadme, setLogFunction as setReadmeLogFunction } from './usecase/readme.usecase.js';
import { loadLastThreadFiles, loadThread, loadThreadLimited, saveThread } from './usecase/thread.usecase.js';
import { webSearchTool, setLogFunction as setWebSearchLogFunction } from './usecase/tools/websearch.tools.js';
import { thinkTool, setLogFunction as setThinkLogFunction } from './usecase/tools/think.tools.js';
import { setOpenAIClient as setNotificationOpenAIClient, setLogFunction as setNotificationLogFunction, sendWhatsAppMessage } from './usecase/notification.usecase.js';
import { MarketType } from './domain/enum/market-type.enum.js';
import { MARKET_TYPE, marketTypeConfig } from './config.js';
import { buyTool, sellTool } from "./usecase/tools/trading.tools";
import { getPortfolioTool, getNetWorthTool } from "./usecase/tools/portfolio.tools";
import { setLogFunction as setBalanceLogFunction } from './infra/database/balance.supabase.js';
import { setLogFunction as setTradeLogFunction } from './infra/database/trades.supabase.js';


// Verificar que la API key de OpenAI esté configurada
invariant(process.env.OPENAI_API_KEY, "OPENAI_API_KEY is not set");
invariant(process.env.IACOB_MARKET_TYPE, MarketType.STOCK);

const client = new OpenAI();
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = `resource/output/traces/${MARKET_TYPE}-${timestamp}.log`;

/**
 * Función de logging con timestamp que registra tanto en consola como en archivo
 * @param message - Mensaje a registrar
 */
const log = (message: string) => {
  message = `[${new Date().toISOString()}] ${message}`;
  console.log(message);
  appendFile(LOG_FILE, message + "\n");
};

// Configurar las funciones de logging en las herramientas
setPortfolioLogFunction(log);
setTradingLogFunction(log);
setStockLogFunction(log);
setReadmeLogFunction(log);
setWebSearchLogFunction(log);
setThinkLogFunction(log);
setPortfolioLogFunction(log);
setNotificationLogFunction(log);
setBalanceLogFunction(log);
setTradeLogFunction(log);

setStockOpenAIClient(client);
setWebSearchOpenAIClient(client);
setNotificationOpenAIClient(client);


const marketTools = {
  [MarketType.STOCK]: {
    tools: [
      buyTool,
      sellTool,
      getStockPriceTool,
      getPortfolioTool,
      getNetWorthTool,
    ]
  },
  [MarketType.CRYPTO]: {
    tools: [
      buyTool,
      sellTool,
      getCryptoPriceTool,
      getPortfolioTool,
      getNetWorthTool,
    ]
  },
};


/**
 * Configuración e inicialización del agente de trading
 */
const agent = new Agent({
  name: marketTypeConfig[MARKET_TYPE].name,
  instructions: await readFile(marketTypeConfig[MARKET_TYPE].prompt, "utf-8"),
  tools: [thinkTool, webSearchTool, ...marketTools[MARKET_TYPE].tools],
});

// Inicio de la ejecución del agente
log("Starting agent");

// Cargar historial previo y ejecutar el agente con mensaje de trading
const thread = await loadLastThreadFiles();

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

await sendWhatsAppMessage(`IAcob is online`, process.env.WHATSAPP_RECIPIENT_NUMBER);

// Guardar resultados y actualizar documentación
await saveThread(result.history, thread);
await updateReadme();