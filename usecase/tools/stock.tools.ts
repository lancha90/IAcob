import { tool } from "@openai/agents";
import { z } from "zod";
import { getCryptoPrice, getStockPrice } from "../stock.usercase";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

/**
 * Herramienta del agente para consultar precios de acciones
 * Utiliza búsqueda web para obtener precios actualizados
 */
 export const getStockPriceTool = tool({
  name: "get_stock_price",
  description: "Get the current price of a given stock ticker",
  parameters: z.object({
    ticker: z.string(),
  }),
  async execute({ ticker }) {
    const price = await getStockPrice(ticker);
    log(`🔖 Searched for stock price for ${ticker}: $${price}`);
    return price;
  },
});


/**
 * Herramienta del agente para consultar precios de crypto
 * Utiliza búsqueda web para obtener precios actualizados
 */
export const getCryptoPriceTool = tool({
  name: "get_crypto_price",
  description: "Get the current price of a given crypto ticker",
  parameters: z.object({
    ticker: z.string(),
  }),
  async execute({ ticker }) {
    const price = await getCryptoPrice(ticker);
    log(`🔖 Searched for crypto price for ${ticker}: $${price}`);
    return price;
  },
});