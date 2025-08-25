import { BrokerTradeRequest } from "../../../domain/request/broker-trade.request";
import { BrokerTradeResponse } from "../../../domain/response/broker-trade.response";

const BROKER_API_URL = "https://broker-simulator.onrender.com/api/v1/trade";
const BROKER_API_KEY = "test-api-key-123";

export const execTrade = async (request: BrokerTradeRequest): Promise<BrokerTradeResponse> => {
  const response = await fetch(BROKER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BROKER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Broker API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};