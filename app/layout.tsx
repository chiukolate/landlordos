import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "LandlordOS",
  description: "Property management made simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900 antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}