
import { getStockPrice, getCryptoPrice } from "./stock.usercase";
import { MARKET_TYPE } from "../config";
import { MarketType } from "../domain/enum/market-type.enum";
import { execTrade } from "../infra/output/http/broker-simulator.client";
import { readBalanceFromBroker } from "./balance.usecase";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

export const buyStock = async (ticker: string, shares: number) => {
    const price = (MARKET_TYPE === MarketType.STOCK ? await getStockPrice(ticker) : await getCryptoPrice(ticker));
    const balance = await readBalanceFromBroker();
      
    if (balance < shares * price) {
        return `You don't have enough cash to buy ${shares} shares of ${ticker}. Your cash balance is $${portfolio.cash} and the price is $${price} per share.`;
    }

    try {
        const brokerResponse = await execTrade({
            ticker:ticker,
            action: "buy",
            quantity: shares,
            price: price
        });

        log(`💰 Purchased ${shares} shares of ${ticker} at $${price} per share via broker API (ID: ${brokerResponse.id})`);
        return `Purchased ${shares} shares of ${ticker} at $${price} per share, for a total of $${shares * price}. Your cash balance is now $${portfolio.cash}.`;

    } catch (error) {
        log(`⚠️ Failed to execute buy trade via broker API: ${error}`);
        return `Failed to execute buy trade for ${ticker}. Error: ${error}`;
    }
};

export const sellStock = async (ticker: string, shares: number) => {
    
    const price = (MARKET_TYPE === MarketType.STOCK ? await getStockPrice(ticker) : await getCryptoPrice(ticker));

    try {
        const brokerResponse = await execTrade({
            ticker,
            action: "sell",
            quantity: shares,
            price: price
        });

        log(`💸 Sold ${shares} shares of ${ticker} at $${price} per share via broker API (ID: ${brokerResponse.id})`);
        return `Sold ${shares} shares of ${ticker} at $${price} per share, for a total of $${shares * price}. Your cash balance is now $${portfolio.cash}.`;

    } catch (error) {
        log(`⚠️ Failed to execute sell trade via broker API: ${error}`);
        return `Failed to execute sell trade for ${ticker}. Error: ${error}`;
    }
};


