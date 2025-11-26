import { algoliasearch } from "algoliasearch"; // Importamos algolia

const appID = process.env.ALGOLIA_APP_ID; // Defiimos el appId
// Le pasamos el admin api key
const apiKey = process.env.ALGOLIA_API_KEY;
const indexName = "pets"; // Y establecemos el indexName

const client = algoliasearch(appID, apiKey); // Inicializamos algolia con el appId y el apiKey

export { client, indexName}; // Exportamos la inicializacion de algolia y el indexName