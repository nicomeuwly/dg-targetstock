import * as fs from "fs";
import getProducts from "../../../../lib/scraping/products";

/**
 * API route handler for GET requests to fetch product data.
 * Reads categories from a JSON file, scrapes products based on those categories,
 * and writes the resulting product data to another JSON file.
 * @returns {Response} The HTTP response containing the product data or an error message.
 */
export async function GET() {
  try {
    // Read categories from the local JSON file
    const categories = JSON.parse(fs.readFileSync("./data/categories.json", "utf8"));

    // Scrape products based on the categories
    const products = await getProducts(categories);

    // Convert the product data to a JSON string
    const data = JSON.stringify(products);

    // Write the product data to a local JSON file
    fs.writeFileSync("./data/products.json", data);

    // Return the product data as a successful response
    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Return an error response in case of failure
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}