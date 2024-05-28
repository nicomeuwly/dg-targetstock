import { JSDOM } from "jsdom";

export default async function Home() {
  const response = await fetch("https://www.digitec.ch/fr/s1/producttype/telephone-portable-24?filter=t_off%3DInStock&so=15");
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const container = document.querySelectorAll(".sc-b3dc936d-1");
  container.forEach((element) => {
    console.log(element.innerHTML);
  });
  return (
    <main>
      <h1>DG-StockFlow</h1>
      <p></p>
    </main>
  );
}
