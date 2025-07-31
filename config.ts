import { MarketType } from "./domain/enum/market-type.enum";

export const MARKET_TYPE = process.env.IACOB_MARKET_TYPE as MarketType;

export const marketTypeConfig = {
  [MarketType.STOCK]: {
    name: "Stock Assistant",
    portforlio: "portfolio_stock.json",
    prompt: "resource/prompt/system-prompt-stock.md", 
    thread: "resource/output/thread/thread.json",
    
  },
  [MarketType.CRYPTO]: {
    name: "Crypto Assistant",
    portforlio: "portfolio_crypto.json",
    prompt: "resource/prompt/system-prompt-crypto.md", 
    thread: "resource/output/thread/thread_crypto.json",
  },
};