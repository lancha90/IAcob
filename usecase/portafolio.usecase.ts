import { Portfolio } from "../domain/dto/portfolio.dto";
import { readFile, writeFile } from "node:fs/promises";
import { portfolioSchema } from "../domain/dto/portfolio.dto";
import { readTradesFromSupabase } from "../infra/database/trades.supabase";
import { getCryptoPrice, getStockPrice } from "./stock.usercase";
import { marketTypeConfig } from "../config";
import { MARKET_TYPE } from "../config";
import { MarketType } from "../domain/enum/market-type.enum";
import { readBalanceFromBroker } from "./balance.usecase";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

/**
 * Lee y valida el portfolio desde el archivo JSON
 * @returns Portfolio validado con estructura correcta
 * @throws Error si el arquivo no existe o tiene formato inválido
 */
export const getPortfolio = async (): Promise<Portfolio> => {
    const portfolioData = await readFile(marketTypeConfig[MARKET_TYPE].portforlio, "utf-8");
    const portfolio = portfolioSchema.parse(JSON.parse(portfolioData));
    
    portfolio.cash = await readBalanceFromBroker();
    portfolio.history = await readTradesFromSupabase();
    return portfolio;
  };

/**
 * Calcula el valor neto total del portfolio (efectivo + valor de holdings)
 * @returns Valor total del portfolio redondeado a 2 decimales
 */
export const calculateNetWorth = async (): Promise<number> => {
    const portfolio = await getPortfolio();
    let totalHoldingsValue = 0;
    
    for (const [ticker, shares] of Object.entries(portfolio.holdings)) {
      if (shares > 0) {
        try {
          const price = await getStockPrice(ticker);
          totalHoldingsValue += shares * price;
        } catch (error) {
          log(`⚠️ Failed to get price for ${ticker}: ${error}`);
        }
      }
    }
  
    const netWorth = Math.round((portfolio.cash + totalHoldingsValue) * 100) / 100;
    return netWorth;
  };
  
  /**
   * Calcula la tasa de crecimiento anual compuesta (CAGR)
   * @param days - Número de días desde la inversión inicial
   * @param currentValue - Valor actual del portfolio
   * @returns CAGR como decimal (ej: 0.15 = 15%)
   */
  export const calculateCAGR = (days: number, currentValue: number): number => {
    const startValue = 1000;
    const years = days / 365;
    const cagr = Math.pow(currentValue / startValue, 1 / years) - 1;
    return cagr;
  };
  
  /**
   * Calcula el retorno anualizado del portfolio desde la primera transacción
   * @param portfolio - Datos del portfolio incluyendo historial
   * @returns String formateado del CAGR como porcentaje (ej: "15.25%")
   */
  export const calculateAnnualizedReturn = async (
    portfolio: Portfolio
  ): Promise<string> => {
    if (!portfolio.history || portfolio.history.length === 0) return "0.00";
  
    const firstTradeDate = new Date(portfolio.history[0].created_at);
    const currentDate = new Date();
  
    let totalHoldingsValue = 0;
    for (const [ticker, shares] of Object.entries(portfolio.holdings)) {
      if (shares > 0) {
        try {
          const price = await getStockPrice(ticker);
          totalHoldingsValue += shares * price;
        } catch (error) {
          log(`⚠️ Failed to get price for ${ticker}: ${error}`);
        }
      }
    }
  
    const currentTotalValue = portfolio.cash + totalHoldingsValue;
    log(`💰 Current total value: $${currentTotalValue}`);
  
    const days = (currentDate.getTime() - firstTradeDate.getTime()) / (1000 * 60 * 60 * 24);
    log(`🗓 Days since first trade: ${days.toFixed(2)}`);
  
    if (days < 1) {
      log("⏳ Not enough time has passed to compute CAGR accurately.");
      return "N/A";
    }
  
    const cagr = calculateCAGR(days, currentTotalValue);
    log(`💰 CAGR: ${cagr * 100}%`);
  
    return (cagr * 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  /**
   * Calcula el valor detallado del portfolio incluyendo cada holding
   * @returns Objeto con valor total y desglose de cada holding
   */
  export const calculatePortfolioValue = async (): Promise<{
    totalValue: number;
    holdings: Record<string, { shares: number; value: number }>;
  }> => {
    const portfolio = await getPortfolio();
    const holdingsWithValues: Record<string, { shares: number; value: number }> = {};
    let totalHoldingsValue = 0;
  
    for (const [ticker, shares] of Object.entries(portfolio.holdings)) {
      if (shares > 0) {
        try {
          const price = MARKET_TYPE === MarketType.STOCK ? await getStockPrice(ticker) : await getCryptoPrice(ticker);
          const value = Math.round(shares * price * 100) / 100;
          holdingsWithValues[ticker] = { shares, value };
          totalHoldingsValue += value;
        } catch (error) {
          log(`⚠️ Failed to get price for ${ticker}: ${error}`);
          holdingsWithValues[ticker] = { shares, value: 0 };
        }
      }
    }
  
    const totalValue = Math.round((portfolio.cash + totalHoldingsValue) * 100) / 100;
    return { totalValue, holdings: holdingsWithValues };
  };