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
import { tradeSchema, createTradeSchema, type Trade, type CreateTrade } from '../../domain/dto/trade.dto.js';

// Verificar que las variables de entorno de Supabase estén configuradas
invariant(process.env.SUPABASE_URL, "SUPABASE_URL is not set");
invariant(process.env.SUPABASE_KEY, "SUPABASE_KEY is not set");

// Crear cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


/**
 * Lee trades desde la tabla gh-iacob-trades en Supabase
 * @param limit - Número máximo de trades a retornar (default: 100)
 * @returns Array de trades ordenados por fecha de creación
 * @throws Error si no se puede leer los trades
 */
export const readTradesFromSupabase = async (
  limit: number = 100
): Promise<Trade[]> => {
  try {
    const { data, error } = await supabase
      .from('gh-iacob-trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error leyendo trades desde Supabase: ${error.message}`);
    }

    // Transformar datos de Supabase para que sean compatibles con portfolio
    const transformedData = data?.map(trade => ({
      code: trade.code,
      type: trade.type,
      ticker: trade.ticker,
      shares: trade.shares,
      price: trade.price,
      total: trade.total,
      created_at: trade.created_at, // Mantener created_at como date para portfolio
    })) || [];

    console.log(`📖 ${transformedData.length} trades leídos desde Supabase`);
    return transformedData;

  } catch (error) {
    console.error('❌ Error leyendo trades desde Supabase:', error);
    throw error;
  }
};

/**
 * Escribe un trade a la tabla gh-iacob-trades en Supabase
 * @param tradeData - Datos del trade a guardar
 * @returns UUID del registro guardado
 * @throws Error si no se puede escribir el trade
 */
export const writeTradeToSupabase = async (
  tradeData: CreateTrade
): Promise<string> => {
  try {
    // Validar datos antes de enviar
    const validatedTrade = createTradeSchema.parse(tradeData);

    const { data, error } = await supabase
      .from('gh-iacob-trades')
      .insert({
        code: validatedTrade.code,
        type: validatedTrade.type,
        ticker: validatedTrade.ticker,
        shares: validatedTrade.shares,
        price: validatedTrade.price,
        total: validatedTrade.total,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
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