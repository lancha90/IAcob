import { calculatePortfolioValue } from "./portafolio.usecase.js";
import { readFile, writeFile } from "node:fs/promises";
import { MARKET_TYPE } from "../config";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};


/**
 * Genera la sección del portfolio para el README
 * @param totalValue - Valor total del portfolio
 * @param holdings - Holdings del portfolio
 * @returns String con la sección formateada del portfolio
 */
export const generatePortfolioSection = (totalValue: number, holdings: Record<string, any>): string => {
  console.log(`Generating portfolio section for <!-- auto ${MARKET_TYPE} start -->`);
  return `<!-- auto ${MARKET_TYPE} start -->
  
  ## 💰 Portfolio ${MARKET_TYPE} value: $${totalValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}**
  
  ### 📊 Holdings
  
  | Asset | Shares | Value |
  |-------|--------|-------|
  ${Object.entries(holdings)
    .map(
      ([ticker, data]) =>
        `| ${ticker} | ${data.shares} | $${data.value.toFixed(2)} |`
    )
    .join("\n")}
  
  <!-- auto ${MARKET_TYPE} end -->`;
};

/**
 * Actualiza el archivo README.md con información actual del portfolio
 * Genera una sección con valor total, holdings y trades recientes
 */
export const updateReadme = async () => {
    try {
      const { totalValue, holdings } = await calculatePortfolioValue();
      const readmeContent = await readFile("README.md", "utf-8");

      // Actualizar README con información del portfolio
      const portfolioSection = generatePortfolioSection(totalValue, holdings);
  
      const updatedReadme = readmeContent.replace(
        /<!-- auto ${MARKET_TYPE} start -->[\s\S]*<!-- auto ${MARKET_TYPE} end -->/,
        portfolioSection
      );

      await writeFile("README.md", updatedReadme);
      log(`📝 Updated README with portfolio value: $${totalValue}`);
    } catch (error) {
      log(`❌ Failed to update README: ${error}`);
      if (error instanceof Error && error.stack) {
        log(`Stack trace: ${error.stack}`);
      }
    }
  };