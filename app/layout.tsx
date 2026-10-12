import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TasteMem — Personal Cultural Shelf",
  description: "Organize your taste visually in liquid monochrome. Powered by Qloo Cultural AI.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className="bg-white text-black min-h-screen selection:bg-black selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
