import { get } from "http";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const getProducts = async (categories: any[]) => {
    try {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        const tempCategories = categories.slice(0, 4);

        const products = await getProductsList(page, tempCategories);
        const stocks = await getProductsAvailability(page, products);

        await browser.close();
        if (stocks.length === 0) {
            await getProducts(categories);
        } else {
            return stocks;
        }
    } catch (error: any) {
        console.error(error.message);
    }
}

const getProductsDetails = async (page: any, url: string) => {
    const filters = url.includes("?") ? "&filter=t_off%3DInStock&so=15" : "?filter=t_off%3DInStock&so=15";
    await page.goto(`https://www.galaxus.ch${url + filters}`, { waitUntil: "domcontentloaded" });

    const articles = await page.$$("div.sc-5d2f6f43-1.jwLEDS > article");
    if (articles.length === 0 || !articles) return [];

    const products: any[] = [];

    for (const article of articles) {
        const product = await article.$eval("span.sc-6923aaa7-0.fkBRnq", (el: any) => el.textContent);
        const brand = await article.$eval("strong", (el: any) => el.textContent);
        const priceSpan = await article.$eval("span.sc-812f8453-1.fMoCQC", (el: any) => el.textContent);
        const price = parseFloat(priceSpan.replace("CHF", "").replace(",", "."));
        const detailsTemp = await article.$("p.sc-ce74e31a-9.gcbXXJ");
        const details = detailsTemp ? await detailsTemp.evaluate((el: any) => el.textContent) : "";
        const imageURL = await article.$eval("img", (el: any) => el.getAttribute("src"));
        const productUrl = await article.$eval("a.sc-a1453065-0.iqBVXt", (el: any) => el.getAttribute("href"));
        const category = await article.$eval("a.sc-ccd25b80-0.beNCEW.sc-ce74e31a-6.fJUqGN", (el: any) => el.textContent);
        const categoryUrl = await article.$eval("a.sc-ccd25b80-0.beNCEW.sc-ce74e31a-6.fJUqGN", (el: any) => el.getAttribute("href"));
        const id = url
            ?.match(/[^-]*$/)
            ?.pop()
            ?.slice(0, 8);
        products.push({ id, product, brand, details, price, imageURL, url: productUrl, category, categoryUrl, scrapedCategory: url });
    }

    return products;
}

const getProductsList = async (page: any, categories: any[]) => {
    if (categories.length === 0) return [];
    const products: any[] = [];
    for (const category of categories) {
        const tempList = await getProductsDetails(page, category.url);
        products.push(...tempList);
    }
    return products;
}

const getProductsAvailability = async (page: any, products: any[]) => {
    const stocks: any[] = [];
    console.log(products.length);
    for (const product of products) {
        try {
            await page.goto("https://www.galaxus.ch" + product.url, { waitUntil: "domcontentloaded" });

            const availabilityTag = await page.$("button.sc-58bde996-0.bQTVcy");
            if (availabilityTag) {
                await availabilityTag.click();
                const availability = await page.waitForSelector("div.sc-d0d34be1-2.dMCIvG");
                if (availability) {
                    const closeTag = await availability.$("button.sc-2f97377a-0.iDwhgK.sc-d0d34be1-3.fgYBWv");
                    const locations = await availability.$$("strong");
                    const stockLevelDiv = await availability.$eval("div.sc-dbd9c505-1.fwiPKQ", (el: any) => el.textContent);
                    const stockLevel = parseInt(stockLevelDiv.match(/\d+/)[0]);
                    const isPickupAvailable = locations.length > 0;
                    if (stockLevel >= 10 && isPickupAvailable) {
                        stocks.push({ ...product, pickup: isPickupAvailable, stockLevel });

                    }

                    await closeTag?.click();
                }
            }
        } catch (err) {
            console.error(`Error retrieving availability for product no ${products.indexOf(product)} (https://www.galaxus.ch${product.url})`);
        }
    }
    return stocks;
}

export default getProducts;