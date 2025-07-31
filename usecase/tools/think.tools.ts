import { tool } from "@openai/agents";
import { z } from "zod";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
    log = fn;
};

/**
 * Herramienta obligatoria del agente para procesos de razonamiento
 * Registra cada paso del proceso de toma de decisiones del agente
 */
export const thinkTool = tool({
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