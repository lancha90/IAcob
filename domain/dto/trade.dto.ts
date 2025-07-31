/**
 * DTOs para Trades
 * 
 * Define los esquemas de validación y tipos para los trades en Supabase
 * 
 * @author Sistema de Trading IA
 * @version 1.0.0
 */

import { z } from "zod";

/**
 * Schema para validar datos de trades en Supabase
 */
export const tradeSchema = z.object({
  code: z.string(),
  type: z.string(),
  ticker: z.string(),
  shares: z.number().int(),
  price: z.number(),
  total: z.number(),
  created_at: z.string(),
});

export const holdingSchema = z.object({
  code: z.string(),
  type: z.string(),
  ticker: z.string(),
  shares: z.number().int(),
  price: z.number(),
  total: z.number(),
  created_at: z.string(),
});

/** Tipo inferido del schema de trade */
export type Trade = z.infer<typeof tradeSchema>;

/**
 * Schema para trade completo con metadatos de Supabase
 */
export const fullTradeSchema = tradeSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  modified_at: z.string().datetime(),
});

/** Tipo inferido del schema de trade completo */
export type FullTrade = z.infer<typeof fullTradeSchema>;

/**
 * Schema para datos de entrada al crear un trade
 */
export const createTradeSchema = z.object({
  code: z.string(),
  type: z.enum(["buy", "sell"]),
  ticker: z.string(),
  shares: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
});

/** Tipo inferido del schema para crear trade */
export type CreateTrade = z.infer<typeof createTradeSchema>;