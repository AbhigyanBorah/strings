import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "../globals.css";

export const metadata = {
  title: "Strings",
  description: "A Next.js 13 Meta Strings Application",
};

const inter = Inter({ subsets: ["latin"] });

type props = {
  children: React.ReactNode;
  propTwo: React.JSX.Element;
};

export default function RootLayout({ children, propTwo }: props) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
