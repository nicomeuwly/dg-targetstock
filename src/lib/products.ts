import { get } from "http";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

interface Product {
    id: number;
    product: string;
    brand: string;
    details: string;
    price: number;
    imageURL: string;
    url: string;
    category: string;
    categoryUrl: string;
    scrapedCategory: string;
}

const getProducts = async (categories: any[]) => {
    try {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        const tempCategories = categories.slice(0, 1);

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
        const id = productUrl
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
    console.log("Total products : " + products.length);

    for (const product of products) {
        await openProductPage(page, product, stocks);

        // Delay between each product to avoid overloading the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        retryCounter = 0;
    }

    return stocks;
}

let retryCounter = 0;

const openProductPage = async (page: any, product: Product, stocks: Product[]) => {
    try {
        await page.goto("https://www.galaxus.ch" + product.url, { waitUntil: "domcontentloaded" });

        await page.$eval("button.sc-58bde996-0.bQTVcy", (el: HTMLElement) => el.click())

        await page.waitForSelector("div.sc-d0d34be1-2.dMCIvG", { visible: true, timeout: 5000 });
        const availability = await page.$("div.sc-d0d34be1-2.dMCIvG");

        if (availability) {
            const locations = await availability.$$("strong");
            const stockLevel = await availability.$eval("div.sc-dbd9c505-1.fwiPKQ", (el: any) => el.textContent);

            if (stockLevel.includes("10 items") && locations.length > 0) {
                stocks.push(product);
            }

            const closeButton = await page.waitForSelector("button.sc-2f97377a-0.iDwhgK.sc-d0d34be1-3.fgYBWv", { visible: true, timeout: 5000 });
            await closeButton.click();
        } else {
            console.error(`Availability div not found for product ${product.id}`);
        }

    } catch (error: any) {
        console.error(`Error processing product ${product.id}:`, error);

        // Retrying mechanism for network errors
        if ((error.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR') || error.message.includes('Node is detached from document')) && retryCounter < 3) {
            retryCounter++;
            console.log(`Retrying product https://www.galaxus.ch${product.url}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await openProductPage(page, product, stocks);
        }

    }
}

export default getProducts;