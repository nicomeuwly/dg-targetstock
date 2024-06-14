import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as fs from "fs";
import { openProductsPage } from "../../../../lib/scraping";

puppeteer.use(StealthPlugin());

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const list = await openProductsPage(
      browser,
      "https://www.digitec.ch/fr/s1/producttype/telephone-portable-24?filter=t_off%3DInStock&so=15"
    );
    await browser.close();
    const data = JSON.stringify(list);
    fs.writeFileSync("./data/products.json", data);
    return new Response(JSON.stringify(list), {
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