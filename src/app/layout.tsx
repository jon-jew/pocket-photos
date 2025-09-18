import type { Metadata } from "next";
import localFont from 'next/font/local';
import Head from "next/head";
import { ToastContainer } from 'react-toastify';

import { Manrope, Monomaniac_One } from 'next/font/google';

import "./globals.css";

const comicoRegular = localFont({
  src: '../../public/fonts/Comico-Regular.ttf',
  variable: '--font-comico',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const monomaniac = Monomaniac_One({
  variable: '--font-monomaniac',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: "pluur - create a photo album together, instantly",
  description: "Create a photo album together, instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Create a photo album together, instantly" />
      </Head>
      <body
        className={`${comicoRegular.variable} ${manrope.variable} ${monomaniac.variable} antialiased`}
      >
        <ToastContainer theme="dark" />
        {children}
      </body>
    </html>
  );
}
