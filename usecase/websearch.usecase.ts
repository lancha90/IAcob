import OpenAI from "openai";

/*
* OpenAI client (debe ser inyectada)
 */
let client: OpenAI;

export const setOpenAIClient = (clientInstance: OpenAI) => {
  client = clientInstance;
};

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};


/**
 * Realiza búsquedas web utilizando OpenAI con herramientas de búsqueda
 * @param query - Consulta de búsqueda
 * @returns Resumen en markdown de los resultados encontrados
 */
export const webSearch = async (query: string): Promise<string> => {

  log(`🔍 Searching the web for: ${query}`);

  const response = await client!.responses.create({
    model: "gpt-5-nano",
    input: `Please use web search to answer this query from the user and respond with a short summary in markdown of what you found:\\n\\n${query}`,
    tools: [{ type: "web_search_preview" }],
  });

  if (!response.output_text) {
    throw new Error(`❌ Failed to get web search results. ${response.error}`);
  }

  return response.output_text;
};
