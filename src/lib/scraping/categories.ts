import * as cheerio from "cheerio";

let categoryRequestCounter = 0;
let requestCounter = 0;

const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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

export { openCategoriesPage, openCategoryLinks };
