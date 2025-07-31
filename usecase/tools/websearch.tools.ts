import { tool } from "@openai/agents";
import { z } from "zod";
import { webSearch } from "../websearch.usecase";
/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
    log = fn;
};

/**
 * Herramienta del agente para realizar búsquedas web
 * Permite investigar noticias, análisis de mercado e información financiera
 */
export const webSearchTool = tool({
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