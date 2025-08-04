import { AgentInputItem } from "@openai/agents";
import { existsSync } from "fs";
import { readFile, writeFile } from "node:fs/promises";
import { MARKET_TYPE } from "../config";
import { marketTypeConfig } from "../config";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

/**
 * Guarda el historial de conversación en archivo JSON
 * @param thread - Array de elementos del hilo de conversación a guardar
 */
export const saveThread = async (thread: AgentInputItem[]) => {
  try {
    await writeFile(marketTypeConfig[MARKET_TYPE].thread, JSON.stringify(thread, null, 2));
    log(`💾 Saved thread history (${thread.length} items)`);
  } catch (error) {
    log(`❌ Failed to save thread history: ${error}`);
  }
};

/**
 * Carga el historial de conversación desde archivo JSON
 * @returns Array de elementos del hilo de conversación o array vacío si no existe
 */
export const loadThread = async (): Promise<AgentInputItem[]> => {
  try {
    if (existsSync(marketTypeConfig[MARKET_TYPE].thread)) {
      const threadData = await readFile(marketTypeConfig[MARKET_TYPE].thread, "utf-8");
      log(`💹 Loaded thread history (${marketTypeConfig[MARKET_TYPE].thread})`);
      return JSON.parse(threadData);
    } else {
      log(`⚠️ Thread history file not found: ${marketTypeConfig[MARKET_TYPE].thread}`);
    }
  } catch (error) {
    log(`⚠️ Failed to load thread history: ${error}`);
  }
  return [];
};

/**
 * Carga el historial de conversación limitando los tokens para reducir rate limits
 * @param maxItems - Número máximo de elementos del thread a cargar (default: 30)
 * @returns Array limitado de elementos del hilo de conversación
 */
export const loadThreadLimited = async (
  maxItems: number = 30
): Promise<AgentInputItem[]> => {
  try {
    if (existsSync(marketTypeConfig[MARKET_TYPE].thread)) {
      const threadData = await readFile(marketTypeConfig[MARKET_TYPE].thread, "utf-8");
      const fullThread = JSON.parse(threadData);
      
      // Tomar solo los últimos elementos del thread
      const recentThread = fullThread
      .filter(item => item.name !== "get_crypto_price")
      .filter(item => item.name !== "get_stock_price")
      .filter(item => item.name !== "get_portfolio")
      .filter(item => item.name !== "buy")
      .filter(item => item.name !== "sell")
      // .slice(-maxItems);
       
      log(`🔢 Loaded limited thread history: ${recentThread.length} items (max ${maxItems})`);

      return recentThread;
    } else {
      log(`⚠️ Thread history file not found: ${marketTypeConfig[MARKET_TYPE].thread}`);
    }
  } catch (error) {
    log(`⚠️ Failed to load limited thread history: ${error}`);
  }
  return [];
};