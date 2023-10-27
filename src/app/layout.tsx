import "~/styles/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "PII Remover",
  description: "Remove PII from documents",
  icons: [
    {
      rel: "icon",
      url: "https://framerusercontent.com/images/2qXilXhOJds4fus7YdWHafpSGM.png",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>{children}</body>
    </html>
  );
}
