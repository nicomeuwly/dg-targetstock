"use client";
import { useEffect, useState } from "react";

/**
 * Home component for displaying and managing product and category data.
 * Fetches data from the server and displays it, with options to fetch products, fetch categories, and clear data.
 * @returns {JSX.Element} The rendered Home component.
 */
export default function Home() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  /**
   * Fetches the list of products from the server.
   * Updates the state with the fetched data and handles loading state.
   */
  const getProducts = async () => {
    setData([]);
    setLoading(true);
    setTime(0);
    setRunning(true);
    try {
      const res = await fetch("/api/data/products");
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  /**
   * Fetches the list of categories from the server.
   * Updates the state with the fetched data and handles loading state.
   */
  const getCategories = async () => {
    setCategories([]);
    setTime(0);
    setRunning(true);
    try {
      const res = await fetch("/api/data/categories");
      const data = await res.json();
      setCategories(data);
      setRunning(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  /**
   * Effect hook to handle the timer functionality.
   * Increments the timer every second while `running` is true.
   */
  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [running]);
  return (
    <main className="w-screen h-screen">
      <header className="flex justify-between items-center bg-white shadow-md w-full p-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="DG-Logo" className="h-12" />
          <h1 className="text-xl h-fit">Target Stock</h1>
        </div>
        <div className="flex gap-4">
          <p>
            {categories.length} categories | {data.length} products
          </p>
          <p>(Time : {time} sec)</p>
        </div>
        <div className="flex gap-8">
          <button
            onClick={getProducts}
            disabled={running}
            className="rounded-md p-2 bg-gray-700 hover:bg-gray-900 text-white disabled:opacity-50"
          >
            Get products
          </button>
          <button
            onClick={getCategories}
            disabled={running}
            className="rounded-md p-2 bg-gray-700 hover:bg-gray-900 text-white disabled:opacity-50"
          >
            Get categories
          </button>
          <button
            onClick={() => {
              setData([]);
              setCategories([]);
              setTime(0);
            }}
            disabled={running}
            className="rounded-md p-2 bg-gray-700 hover:bg-gray-900 text-white disabled:opacity-50"
          >
            Delete data
          </button>
        </div>
      </header>
      <div className="p-4 w-full h-5/6">
        {loading && (
          <p className="h-full w-full flex items-center justify-center">
            Loading...
          </p>
        )}
        {data.length > 0 && !loading && (
          <ul className="flex flex-wrap gap-8">
            {(
              data as {
                imageURL: string;
                brand: string;
                product: string;
                details: string;
                price: string;
                url: string;
              }[]
            ).map((item, index) => (
              <li
                key={index}
                className="flex w-1/5 gap-2 m-4 p-4 hover:bg-gray-100 relative"
              >
                <a
                  href={"https://www.galaxus.ch" + item.url}
                  className="w-full h-full absolute z-10"
                ></a>
                <img
                  src={item.imageURL.includes("static.galax.us") ? item.imageURL : "https://www.galaxus.ch" + item.imageURL}
                  alt={item.product}
                  className="h-32"
                />
                <div className="flex flex-col">
                  <p className="text-xl font-bold text-red-600">{item.price}</p>
                  <p><strong>{item.brand}</strong> {item.product}</p>
                  <p className="text-xs">{item.details}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
