/**
 * Funciones de integración con Supabase
 * 
 * Este módulo proporciona funciones para leer y escribir datos
 * del portfolio de trading en Supabase como base de datos remota.
 * 
 * @author Sistema de Trading IA
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import invariant from 'tiny-invariant';
import { createTradeSchema, type Trade, type CreateTrade } from '../../domain/dto/trade.dto.js';
import { MARKET_TYPE } from '../../config.js';
import { UUID } from 'crypto';


// Verificar que las variables de entorno de Supabase estén configuradas
invariant(process.env.SUPABASE_URL, "SUPABASE_URL is not set");
invariant(process.env.SUPABASE_KEY, "SUPABASE_KEY is not set");

// Crear cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Lee el último balance desde la tabla gh-iacob-balance en Supabase
 * @returns Valor total del último balance para el mercado MARKET_TYPE
 * @throws Error si no se puede leer el balance
 */
export const readBalanceFromSupabase = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('gh-iacob-balance')
      .select('balance')
      .eq('market', MARKET_TYPE)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Error leyendo balance desde Supabase: ${error.message}`);
    }

    if (!data || data.balance === null || data.balance === undefined) {
      throw new Error('No se encontró balance válido en Supabase');
    }

    console.log(`💰 Balance leído desde Supabase: $${data.balance}`);
    return data.balance;

  } catch (error) {
    console.error('❌ Error leyendo balance desde Supabase:', error);
    throw error;
  }
};


/**
 * Escribe un trade a la tabla gh-iacob-trades en Supabase
 * @param tradeData - Datos del trade a guardar
 * @returns UUID del registro guardado
 * @throws Error si no se puede escribir el trade
 */
export const writeBalanceToSupabase = async (
  code: UUID,
  balance: number,
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('gh-iacob-balance')
      .insert({
        trade_code: code,
        balance: balance,
        market: MARKET_TYPE,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Error escribiendo trade a Supabase: ${error.message}`);
    }

    if (!data?.id) {
      throw new Error('No UUID retornado de la operación en Supabase');
    }

    console.log(`💾 Trade guardado en Supabase: ${data.id}`);
    return data.id;

  } catch (error) {
    console.error('❌ Error escribiendo trade a Supabase:', error);
    throw error;
  }
};