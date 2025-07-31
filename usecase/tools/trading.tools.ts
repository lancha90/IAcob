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
import { writeTradeToSupabase } from "../../infra/database/supabase.js";
import { getPortfolio } from "../portafolio.usecase.js";
import { getStockPrice } from "../stock.usercase.js";

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
    const price = await getStockPrice(ticker);
    const portfolio = await getPortfolio();
    
    if (portfolio.cash < shares * price) {
      return `You don't have enough cash to buy ${shares} shares of ${ticker}. Your cash balance is $${portfolio.cash} and the price is $${price} per share.`;
    }

    portfolio.holdings[ticker] = (portfolio.holdings[ticker] ?? 0) + shares;

    // Escribir trade a Supabase
    try {
      await writeTradeToSupabase({
        code: randomUUID(), // Generar código único UUID
        type: "buy",
        ticker,
        shares,
        price,
        total: shares * price,
      });
    } catch (error) {
      logFunction(`⚠️ Failed to write trade to Supabase: ${error}`);
    }
    
    portfolio.cash = Math.round((portfolio.cash - shares * price) * 100) / 100;
    portfolio.history = [];
    await writeFile("portfolio.json", JSON.stringify(portfolio, null, 2));

    logFunction(`💰 Purchased ${shares} shares of ${ticker} at $${price} per share`);
    return `Purchased ${shares} shares of ${ticker} at $${price} per share, for a total of $${
      shares * price
    }. Your cash balance is now $${portfolio.cash}.`;
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
    const portfolio = await getPortfolio();
    
    if (portfolio.holdings[ticker] < shares) {
      return `You don't have enough shares of ${ticker} to sell. You have ${portfolio.holdings[ticker]} shares.`;
    }

    const price = await getStockPrice(ticker);
    portfolio.holdings[ticker] = (portfolio.holdings[ticker] ?? 0) - shares;

    // Escribir trade a Supabase
    try {
      await writeTradeToSupabase({
        code: randomUUID(), // Generar código único UUID
        type: "sell",
        ticker,
        shares,
        price,
        total: shares * price,
      });
    } catch (error) {
      logFunction(`⚠️ Failed to write trade to Supabase: ${error}`);
    }

    portfolio.cash = Math.round((portfolio.cash + shares * price) * 100) / 100;
    portfolio.history = [];
    await writeFile("portfolio.json", JSON.stringify(portfolio, null, 2));

    logFunction(`💸 Sold ${shares} shares of ${ticker} at $${price} per share`);
    return `Sold ${shares} shares of ${ticker} at $${price} per share, for a total of $${
      shares * price
    }. Your cash balance is now $${portfolio.cash}.`;
  },
});