import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DG-TargetStock",
  description: "Web-based solution to automate target stock in Digitec shops",
};

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
