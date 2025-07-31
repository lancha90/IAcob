/**
 * DTOs para Portfolio
 * 
 * Define los esquemas de validación y tipos para el portfolio del agente de trading
 * 
 * @author Sistema de Trading IA
 * @version 1.0.0
 */

import { z } from "zod";
import { tradeSchema } from "./trade.dto.js";

/**
 * Schema de validación para la estructura del portfolio
 * Define la estructura de datos del portfolio del agente de trading
 */
export const portfolioSchema = z.object({
  /** Efectivo disponible para trading */
  cash: z.number(),
  /** Holdings actuales: ticker -> cantidad de acciones */
  holdings: z.record(z.string(), z.number()),
  /** Historial completo de transacciones */
  history: z.array(tradeSchema).optional(),
});

/** Tipo inferido del schema del portfolio */
export type Portfolio = z.infer<typeof portfolioSchema>;