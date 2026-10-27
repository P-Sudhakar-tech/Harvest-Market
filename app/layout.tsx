import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harvest Market — Good food, grown nearby",
  description: "Shop fresh seasonal produce directly from local farmers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}