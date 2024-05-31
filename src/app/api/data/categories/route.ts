import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

let counter = 0;
let requestCounter = 0;
puppeteer.use(StealthPlugin());

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const firstList = await openPage(browser, "https://www.galaxus.ch/");
    if (!firstList) {
      throw new Error("Failed to retrieve first list");
    }
    const secondList = await openLinks(firstList, browser);
    if (!secondList) {
      throw new Error("Failed to retrieve second list");
    }
    await browser.close();
    return new Response(JSON.stringify(secondList), {
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

const scrapeCategories = async (page: any, selector: string) => {
  let list: { category: string; url: string | undefined }[] = [];
  const $ = cheerio.load(await page.content());
  console.log("Je passe par là", requestCounter);
  if (!(await page.$(selector))) {
    counter++;
    console.log("No category found, retrying... " + counter);
    if (counter < 3) {
      await delay(2000);
      await scrapeCategories(page, selector);
    } else {
      console.log("No category found, aborting...");
      counter = 0;
    }
    return;
  }
  const categoriesTag = $(selector);
  categoriesTag.each((i, el) => {
    const category = $(el).text();
    const url = $(el).attr("href");
    list.push({ category, url });
  });
  return list;
};

const openPage = async (browser: any, url: string) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await delay(500);
  let selector = "div.sc-e8cbc69d-0.dKMQVj a";
  if (requestCounter > 2)
    selector = "ul.sc-1656bbdd-0.gQqszz a";
  const list = await scrapeCategories(page, selector);
  if (requestCounter < 2) list?.splice(-2, 2);
  requestCounter++;
  await page.close();
  return list;
};

const openLinks = async (
  list: { category: string; url: string | undefined }[],
  browser: any
) => {
  let newList: { category: string; url: string | undefined }[] = [];
  list.forEach(async (item) => {
    if (item.url) {
      const completeUrl = "https://www.galaxus.ch" + item.url;
      const tempList = await openPage(browser, completeUrl);
      tempList?.forEach((newItem) => {
        newList.push({ category: newItem.category, url: newItem.url });
      });
    }
    await delay(2000);
  });
  return newList;
};
