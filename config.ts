import { MarketType } from "./domain/enum/market-type.enum";

export const MARKET_TYPE = process.env.IACOB_MARKET_TYPE as MarketType;

const timestamp = new Date().toISOString().split('T')[0];

export const marketTypeConfig = {
  [MarketType.STOCK]: {
    name: "Stock Assistant",
    portforlio: "portfolio_stock.json",
    prompt: "resource/prompt/system-prompt-stock.md", 
    thread: "resource/output/thread/thread.json",
    thread_file: `resource/output/thread/stock/${timestamp}.json`,
    thread_folder: "resource/output/thread/stock/",    
  },
  [MarketType.CRYPTO]: {
    name: "Crypto Assistant",
    portforlio: "portfolio_crypto.json",
    prompt: "resource/prompt/system-prompt-crypto.md", 
    thread: "resource/output/thread/thread_crypto.json",
    thread_file: `resource/output/thread/crypto/${timestamp}.json`,
    thread_folder: "resource/output/thread/crypto/",
  },
};