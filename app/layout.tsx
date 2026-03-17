import type { Metadata } from "next";
import { Playfair_Display, Nunito, Noto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import MusicPlayerClient from "@/components/ui/MusicPlayerClient";

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  // Gunakan berat/gaya yang berbeda sesuai kebutuhan, misal 400 dan 700 (bold)
  weight: ['400', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
});


const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport = {
  themeColor: '#f3e8ff',
};

export const metadata: Metadata = {
  title: "Life Quest — Your Personal RPG Life System",
  description: "Turn your life into an epic RPG adventure",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LifeQuest",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${notoSerif.variable} ${nunito.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <MusicPlayerClient />
        </AuthProvider>
      </body>
    </html>
  );
}
