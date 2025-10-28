import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG vs Full Context Demo",
  description: "Compare RAG-based and full-context AI query responses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
