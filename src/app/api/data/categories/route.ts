import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as fs from "fs";
import {
  openCategoriesPage,
  openCategoryLinks,
} from "../../../../lib/scraping";

puppeteer.use(StealthPlugin());

export async function GET() {
  try {
    console.log("Scraping categories...");
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const firstList = await openCategoriesPage(
      browser,
      "https://www.galaxus.ch/"
    );
    if (!firstList) {
      throw new Error("Failed to retrieve first list");
    }
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
    const uniqueList = fourthList.filter((obj, index) => {
      return index === fourthList.findIndex((o) => obj.url === o.url);
    });
    await browser.close();
    const data = JSON.stringify(uniqueList);
    fs.writeFileSync("./data/categories.json", data);
    console.log("Scraping completed");
    return new Response(JSON.stringify(uniqueList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
