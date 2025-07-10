import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Changelog Generator",
  description: "AI-powered changelog generator for developer tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex justify-between h-14 items-center">
              <div className="flex items-center">
                <h1 className="text-base font-medium">Changelog</h1>
              </div>
              <div className="flex items-center space-x-6">
                <a href="/" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  View
                </a>
                <a href="/generate" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Generate
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}