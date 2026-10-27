import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harvest Market — Good food, grown nearby",
  description: "Shop fresh seasonal produce directly from local farmers.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" }, { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}