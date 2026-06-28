import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Finder Pro - Müşteri Keşif Platformu",
  description: "Google Maps üzerinden potansiyel müşterileri bulun ve filtreleyin.",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            var theme = localStorage.getItem('theme');
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}

