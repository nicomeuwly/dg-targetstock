import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as fs from "fs";
import {
  openCategoriesPage,
  openCategoryLinks,
} from "../../../../lib/scraping";

// Use Puppeteer stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

/**
 * API route handler for GET requests to scrape category data.
 * Opens category pages recursively to gather categories and their URLs.
 * Writes the resulting category data to a JSON file.
 * @returns {Response} The HTTP response containing the category data or an error message.
 */
export async function GET() {
  try {
    console.log("Scraping categories...");

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Open initial categories page
    const firstList = await openCategoriesPage(
      browser,
      "https://www.galaxus.ch/"
    );
    if (!firstList) {
      throw new Error("Failed to retrieve first list");
    }

    // Open category links recursively to get deeper category data
    const secondList = await openCategoryLinks(browser, firstList);
    if (!secondList) {
      throw new Error("Failed to retrieve second list");
    }
    const thirdList = await openCategoryLinks(browser, secondList);
    if (!thirdList) {
      throw new Error("Failed to retrieve third list");
    }
    const fourthList = await openCategoryLinks(browser, thirdList);
    if (!fourthList) {
      throw new Error("Failed to retrieve fourth list");
    }

    // Filter out duplicate categories based on their URLs
    const uniqueList = fourthList.filter((obj, index) => {
      return index === fourthList.findIndex((o) => obj.url === o.url);
    });

    // Close Puppeteer browser
    await browser.close();

    // Convert the category data to JSON string and write it to a file
    const data = JSON.stringify(uniqueList);
    fs.writeFileSync("./data/categories.json", data);
    console.log("Scraping completed");

    // Return the unique category list as a successful response
    return new Response(JSON.stringify(uniqueList), {
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
