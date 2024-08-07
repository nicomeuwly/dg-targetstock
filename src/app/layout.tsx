import type { Metadata } from "next";
import "./globals.css";

/**
 * Metadata for the DG-TargetStock application.
 * Includes the title and description for the application.
 */
export const metadata: Metadata = {
  title: "DG-TargetStock",
  description: "Web-based solution to automate target stock in Digitec shops",
};

/**
 * RootLayout component that serves as the main layout for the application.
 * It wraps around all the pages and components of the application.
 * @param {Readonly<{ children: React.ReactNode }>} props - The children elements to be rendered within the layout.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
