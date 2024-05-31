"use client";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setData([]);
    setLoading(true);
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="m-10">
      <h1 className="text-xl mb-8">DG-StockFlow</h1>
      <button
        onClick={getData}
        className="border-2 border-black rounded-md p-2 hover:bg-gray-200 mb-8"
      >
        Get products
      </button>
      {loading && <p>Loading...</p>}
      {data.length > 0 && !loading && (
        <ul className="flex flex-wrap gap-8 w-full">
          {(data as { imageURL: string; product: string; price: string }[]).map(
            (item, index) => (
              <li key={index} className="flex w-1/4 gap-2">
                <img
                  src={"https://www.galaxus.ch" + item.imageURL}
                  alt={item.product}
                  className="h-32"
                />
                <div className="flex flex-col">
                  <p>{item.product}</p>
                  <p>{item.price}</p>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </main>
  );
}
