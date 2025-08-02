import { writeTradeToSupabase } from "../infra/database/trades.supabase";
import { getPortfolio } from "./portafolio.usecase";
import { getStockPrice, getCryptoPrice } from "./stock.usercase";
import { randomUUID } from "crypto";
import { writeFile } from "node:fs/promises";
import { marketTypeConfig } from "../config";
import { MARKET_TYPE } from "../config";
import { writeBalanceToSupabase } from "../infra/database/balance.supabase";
import { MarketType } from "../domain/enum/market-type.enum";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

export const buyStock = async (ticker: string, shares: number) => {
    const price = (MARKET_TYPE === MarketType.STOCK ? await getStockPrice(ticker) : await getCryptoPrice(ticker));
    const portfolio = await getPortfolio();
    const code = randomUUID();
      
    if (portfolio.cash < shares * price) {
        return `You don't have enough cash to buy ${shares} shares of ${ticker}. Your cash balance is $${portfolio.cash} and the price is $${price} per share.`;
    }
  
    portfolio.holdings[ticker] = (portfolio.holdings[ticker] ?? 0) + shares;
  
    // Escribir trade a Supabase
    try {
        await writeTradeToSupabase({
          code: code,
          type: "buy",
          ticker,
          shares,
          price,
          total: shares * price,
        });
      } catch (error) {
        log(`⚠️ Failed to write trade to Supabase from buy stock: ${error}`);
      }
      
      portfolio.cash = Math.round((portfolio.cash - shares * price) * 100) / 100;
      portfolio.history = [];
      
      // Escribir balance a Supabase
      try {
        await writeBalanceToSupabase(code, portfolio.cash);
      } catch (error) {
        log(`⚠️ Failed to write balance to Supabase: ${error}`);
      }
      
      await writeFile(marketTypeConfig[MARKET_TYPE].portforlio, JSON.stringify(portfolio, null, 2));
  
      log(`💰 Purchased ${shares} shares of ${ticker} at $${price} per share`);
      return `Purchased ${shares} shares of ${ticker} at $${price} per share, for a total of $${
        shares * price
      }. Your cash balance is now $${portfolio.cash}.`;
};

export const sellStock = async (ticker: string, shares: number) => {
    const portfolio = await getPortfolio();
    const code = randomUUID();
    
    if (portfolio.holdings[ticker] < shares) {
      return `You don't have enough shares of ${ticker} to sell. You have ${portfolio.holdings[ticker]} shares.`;
    }

    const price = (MARKET_TYPE === MarketType.STOCK ? await getStockPrice(ticker) : await getCryptoPrice(ticker));
    portfolio.holdings[ticker] = (portfolio.holdings[ticker] ?? 0) - shares;
    portfolio.history = [];

    // Escribir trade a Supabase
    try {
      await writeTradeToSupabase({
        code: code,
        type: "sell",
        ticker,
        shares,
        price,
        total: shares * price,
      });
    } catch (error) {
      log(`⚠️ Failed to write trade to Supabase from sell stock: ${error}`);
    }

    portfolio.cash = Math.round((portfolio.cash + shares * price) * 100) / 100;

    try {
      await writeBalanceToSupabase(code, portfolio.cash);
    } catch (error) {
      log(`⚠️ Failed to write balance to Supabase: ${error}`);
    }

    await writeFile(marketTypeConfig[MARKET_TYPE].portforlio, JSON.stringify(portfolio, null, 2));

    log(`💸 Sold ${shares} shares of ${ticker} at $${price} per share`);
    return `Sold ${shares} shares of ${ticker} at $${price} per share, for a total of $${
      shares * price
    }. Your cash balance is now $${portfolio.cash}.`;
};


