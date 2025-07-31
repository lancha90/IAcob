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