import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as fs from "fs";
import { openProductsPage } from "../../../../lib/scraping";

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

/**
 * GET endpoint to scrape products from Galaxus and save the data to a JSON file.
 * @returns {Response} The response containing the list of scraped products or an error message.
 */
export async function GET() {
  try {
    // Launch the Puppeteer browser with necessary arguments
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    
    // Open the products page and scrape the products
    const list = await openProductsPage(
      browser,
      "https://www.galaxus.ch/fr/s7/producttype/nutrition-sportive-2800"
    );
    
    // Close the browser after scraping
    await browser.close();

    // Convert the scraped data to JSON format and save it to a file
    const data = JSON.stringify(list);
    fs.writeFileSync("./data/products.json", data);

    // Return the scraped data in the response
    return new Response(JSON.stringify(list), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Handle any errors that occur during the scraping process
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
