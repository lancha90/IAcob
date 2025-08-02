/**
 * Herramientas de Trading
 * 
 * Tools relacionadas con la compra y venta de acciones
 * 
 * @author Sistema de Trading IA
 * @version 1.0.0
 */

import { tool } from "@openai/agents";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "crypto";
import { z } from "zod";
import { writeTradeToSupabase } from "../../infra/database/trades.supabase.js";
import { getPortfolio } from "../portafolio.usecase.js";
import { getStockPrice } from "../stock.usercase.js";
import { marketTypeConfig } from "../../config.js";
import { MARKET_TYPE } from "../../config.js";
import { buyStock, sellStock } from "../trading.usecase.js";

/**
 * Función de logging externa (debe ser inyectada)
 */
let logFunction: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  logFunction = fn;
};

/**
 * Herramienta del agente para comprar acciones
 * Verifica fondos disponibles, actualiza holdings y registra la transacción
 */
export const buyTool = tool({
  name: "buy",
  description: "Buy a given stock at the current market price",
  parameters: z.object({
    ticker: z.string(),
    shares: z.number().positive(),
  }),
  async execute({ ticker, shares }) {
    return buyStock(ticker, shares);
  },
});

/**
 * Herramienta del agente para vender acciones
 * Verifica acciones disponibles, actualiza efectivo y registra la transacción
 */
export const sellTool = tool({
  name: "sell",
  description: "Sell a given stock at the current market price",
  parameters: z.object({
    ticker: z.string(),
    shares: z.number().positive(),
  }),
  async execute({ ticker, shares }) {
    return sellStock(ticker, shares);
  },
});