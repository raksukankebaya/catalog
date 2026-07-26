import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://raksukankabaya.github.io/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Raksukan Kebaya | Katalog Kebaya Elegan",
  description: "Katalog Raksukan Kebaya — koleksi kebaya feminin, bersih, dan elegan untuk setiap momen istimewa.",
  icons: { icon: "logo.png", shortcut: "logo.png", apple: "logo.png" },
  openGraph: { title: "Raksukan Kebaya", description: "Elegansi yang tumbuh dari tradisi", images: ["og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><head><script src="config.js" /></head><body>{children}</body></html>;
}
