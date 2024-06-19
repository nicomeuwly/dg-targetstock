import * as cheerio from "cheerio";

let productRequestCounter = 0;
let categoryRequestCounter = 0;
let requestCounter = 0;

const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const scrapeProducts = async (page: any) => {
  const selector = "div.sc-5d2f6f43-1.jwLEDS article";
  let list: {
    id: string | undefined;
    product: string;
    details: string;
    price: string;
    url: string | undefined;
    imageURL: string | undefined;
  }[] = [];
  const $ = cheerio.load(await page.content());
  if (!(await page.$(selector))) {
    productRequestCounter++;
    console.log("No article found, retrying... " + productRequestCounter);
    if (productRequestCounter < 3) {
      await delay(2000);
      await scrapeProducts(page);
    } else {
      console.log("No article found, aborting...");
      productRequestCounter = 0;
    }
    return;
  }
  const articleTags = $(selector);
  articleTags.each((i, el) => {
    const imageURL = $(el).find("img").attr("src");
    const product = $(el).find("p.sc-2e9036-0.cNsIaf").text();
    const details = $(el).find("p.sc-b3dc936d-9.BunLw").text();
    const priceString = $(el).find("span.sc-3ffcdfc9-1.cHHHJV").text();
    const url = $(el).find("a.sc-d9c28d7f-0.btOvGx").attr("href");
    const id = url?.match(/[^-]*$/)?.pop()?.slice(0, 8);
    const price = priceString.replace("CHF", "");
    list.push({ id, product, details, price, url, imageURL });
  });
  return list;
};

const openProductsPage = async (browser: any, url: string) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await delay(500);
  const list = await scrapeProducts(page);
  await page.close();
  return list;
};

const scrapeCategories = async (page: any, selector: string) => {
  let list: { category: string; url: string | undefined }[] = [];
  const $ = cheerio.load(await page.content());
  if (!(await page.$(selector))) {
    categoryRequestCounter++;
    console.log("No category found, retrying... " + categoryRequestCounter);
    if (categoryRequestCounter < 3) {
      await delay(2000);
      await scrapeCategories(page, selector);
    } else {
      console.log("No category found, aborting...");
      categoryRequestCounter = 0;
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

const openCategoriesPage = async (browser: any, url: string) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  let selector = "div.sc-e8cbc69d-0.dKMQVj a";
  if (requestCounter > 0) selector = "ul.sc-1656bbdd-0.gQqszz a";
  const list = await scrapeCategories(page, selector);
  if (requestCounter < 1) list?.splice(-2, 2);
  requestCounter++;
  await page.close();
  return list;
};

const openCategoryLinks = async (browser: any, list: any) => {
  const results: { category: string; url: string | undefined }[] = [];
  for (const item of list) {
    const tempList = await openCategoriesPage(
      browser,
      "https://www.galaxus.ch" + item.url
    );
    tempList?.forEach((element) => {
      results.push(element);
    });
  }
  return results;
};

export { delay, openProductsPage, openCategoriesPage, openCategoryLinks };
