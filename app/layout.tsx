import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IM • Recursos Humanos",
  description: "Sistema completo de avaliação de desempenho com metodologia CHA",
  icons: {
    icon: "/logo-brasão-branco.png",
    shortcut: "/logo-brasão-branco.png",
    apple: "/logo-brasão-branco.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${roboto.variable} font-roboto antialiased`} style={{ backgroundColor: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}