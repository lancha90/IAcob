import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

/*
* OpenAI client (debe ser inyectada)
 */
let client: OpenAI;

export const setOpenAIClient = (clientInstance: OpenAI) => {
  client = clientInstance;
};

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

/**
 * Obtiene el precio actual de una acción específica usando búsqueda web
 * @param ticker - Símbolo de la acción (ej: AAPL, TSLA)
 * @returns Precio actual de la acción
 * @throws Error si no se puede obtener el precio
 */
export const getStockPrice = async (ticker: string): Promise<number> => {

  log(`🔍 Searching price for stock: ${ticker}`);

  try {

    // Fallback to Alpha Vantage demo endpoint (if available)
    try {
      const price = await getStockPriceFromIBKR(ticker);
      if (price) {
        log(`✅ Found price for ${ticker}: $${price} via IBKR`);
        return price;
      }
    } catch (ibkrError) {
      log(`⚠️ IBKR API failed for ${ticker}: ${ibkrError}`);
    }

    return getStockPriceFromIA(ticker);

  } catch (error: Error) {
    log(`❌ Error getting stock price for ${ticker}: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    throw error;
  }
};

const getStockPriceFromIA = async (ticker: string): Promise<number> => {

  const response = await client!.responses.parse({
    model: "gpt-5-mini",
    input: `What is the current price of the stock ticker $${ticker}? Please use web search to get the latest price and then answer in short.`,
    tools: [{ type: "web_search_preview" }],
    text: { format: zodTextFormat(z.object({ price: z.number() }), "price") },
  });

  if (!response.output_parsed) {
    throw new Error(`Failed to get stock price. ${response.error}`);
  }

  return response.output_parsed.price;

};

const getStockPriceFromIBKR = async (ticker: string): Promise<number> => {

    const response = await fetch(`https://broker-simulator.onrender.com/api/v1/price/${ticker}`);
    if (response.ok) {
      const data = await response.json();
      const price = data?.price;
      
      if (price && typeof price === 'number' && price > 0) {
        log(`✅ Found price for ${ticker}: $${price} via IBKR`);
        return price;
      } else {
        throw new Error(`Stock price not found for ${ticker}. [Status=${response.status}, Data=${data}]`);
      }
    }
 
    throw new Error(`Failed to get stock price for ${ticker}. [Status=${response.status}, Data=${response.json()}]`);
};

/**
 * Obtiene el precio actual de una acción específica usando búsqueda web
 * @param ticker - Símbolo de la acción (ej: AAPL, TSLA)
 * @returns Precio actual de la acción
 * @throws Error si no se puede obtener el precio
 */
export const getCryptoPrice = async (ticker: string): Promise<number> => {

  log(`🔍 Searching price for stock: ${ticker}`);

  try {

    // Fallback to Alpha Vantage demo endpoint (if available)
    try {
      const price = await getStockPriceFromIBKR(ticker);
      if (price) {
        log(`✅ Found crypto price for ${ticker}: $${price} via IBKR`);
        return price;
      }
    } catch (ibkrError) {
      log(`⚠️ IBKR API failed for ${ticker}: ${ibkrError}`);
    }

    return getCryptoPriceFromIA(ticker);

  } catch (error: Error) {
    log(`❌ Error getting stock price for ${ticker}: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    throw error;
  }
};

export const getCryptoPriceFromIA = async (ticker: string): Promise<number> => {

  log(`🔍 Searching price for crypto: ${ticker}`);

  try {
    const response = await client!.responses.parse({
      model: "gpt-5-mini",
      input: `What is the current price of the crypto "${ticker}"? Please use web search to get the latest price and then answer in short.`,
      tools: [{ type: "web_search_preview" }],
      text: { format: zodTextFormat(z.object({ price: z.number() }), "price") },
    });

    if (!response.output_parsed) {
      throw new Error(`Failed to get crypto price. ${response.error}`);
    }

    return response.output_parsed.price;
  } catch (error: Error) {
    log(`❌ Error getting crypto price for ${ticker}: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    throw error;
  }
};
