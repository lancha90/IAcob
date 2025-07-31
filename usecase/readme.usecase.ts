import { calculatePortfolioValue } from "./portafolio.usecase.js";
import { readFile, writeFile } from "node:fs/promises";

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
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
      const portfolioSection = `<!-- auto start -->
  
  ## 💰 Portfolio value: $${totalValue.toLocaleString("en-US", {
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
  
  <!-- auto end -->`;
  
      const updatedReadme = readmeContent.replace(
        /<!-- auto start -->[\s\S]*<!-- auto end -->/,
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