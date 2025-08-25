export interface BrokerTradeRequest {
  ticker: string;
  action: "buy" | "sell";
  quantity: number;
  price: number;
}