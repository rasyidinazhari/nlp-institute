import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pola Bicaramu — Practice Companion",
  description: "Cermin pola bahasa untuk alumni training NLP. Bukan kuis, ini cermin cara kamu bicara.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pola Bicaramu",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
