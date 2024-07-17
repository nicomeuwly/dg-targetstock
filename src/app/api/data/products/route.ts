import * as fs from "fs";
import getProducts from "../../../../lib/products";

export async function GET() {
  try {
    const categories = JSON.parse(fs.readFileSync("./data/categories.json", "utf8"));
    const products = await getProducts(categories);
    const data = JSON.stringify(products);
    fs.writeFileSync("./data/products.json", data);
    return new Response(data, {
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