import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

let counter = 0;
puppeteer.use(StealthPlugin());

export async function GET() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const endpoint =
      "https://www.digitec.ch/fr/s1/producttype/telephone-portable-24?filter=t_off%3DInStock&so=15";
    await page.goto(endpoint, { waitUntil: "domcontentloaded" });
    console.log("Scraping...");
    await delay(1000);
    const list = await scrapeProducts(page);
    await browser.close();
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

const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const scrapeProducts = async (page: any) => {
  let list: { product: string; price: string; imageURL: string | undefined }[] =
    [];
  const $ = cheerio.load(await page.content());
  if (!(await page.$("div.sc-cf3a75ab-0.gVYcPP article"))) {
    counter++;
    console.log("No article found, retrying... " + counter);
    if (counter < 3) {
      await delay(2000);
      await scrapeProducts(page);
    } else {
      console.log("No article found, aborting...");
      counter = 0;
    }
    return;
  }
  const articleTags = $("div.sc-cf3a75ab-0.gVYcPP article");
  articleTags.each((i, el) => {
    const imageURL = $(el).find("img").attr("src");
    const product = $(el).find("p.sc-2e9036-0.cNsIaf").text();
    const priceString = $(el).find("span.sc-3ffcdfc9-1.cHHHJV").text();
    const price = priceString.replace("CHF", "");
    list.push({ product, price, imageURL });
  });
  return list;
};
