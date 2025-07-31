/**
 * Enum para definir los tipos de mercado soportados por el sistema de trading
 */
export enum MarketType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO'
}

/**
 * Type guard para verificar si un valor es un MarketType válido
 * @param value - Valor a verificar
 * @returns true si el valor es un MarketType válido
 */
export const isMarketType = (value: string): value is MarketType => {
  return Object.values(MarketType).includes(value as MarketType);
};

/**
 * Array con todos los valores de MarketType
 */
export const MARKET_TYPES = Object.values(MarketType);