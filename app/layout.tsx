import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TasteMem — Living Archive",
  description: "A tactile whiteboard for the things you want to remember.",
  applicationName: "TasteMem",
  appleWebApp: {
    capable: true,
    title: "TasteMem",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  viewportFit: "cover",
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
