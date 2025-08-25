/**
 * Funciones de integración con Supabase
 * 
 * Este módulo proporciona funciones para leer y escribir datos
 * del portfolio de trading en Supabase como base de datos remota.
 * 
 * @author Sistema de Trading IA
 * @version 1.0.0
 */

import invariant from 'tiny-invariant';

// Verificar que las variables de entorno de Supabase estén configuradas
invariant(process.env.IBKR_API_KEY, "IBKR_API_KEY is not set");

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

/**
 * Lee el balance actual desde el broker simulator
 * @returns Valor del cash_balance del broker
 * @throws Error si no se puede leer el balance
 */
export const readBalanceFromBroker = async (): Promise<number> => {
  try {
    const response = await fetch('https://broker-simulator.onrender.com/api/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.IBKR_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.cash_balance && data.cash_balance !== 0) {
      throw new Error('No se encontró cash_balance válido en la respuesta del broker');
    }

    log(`💰 Balance leído desde broker simulator: $${data.cash_balance}`);
    return data.cash_balance;

  } catch (error) {
    log(`❌ Error leyendo balance desde broker simulator: ${error}`);
    throw error;
  }
};
