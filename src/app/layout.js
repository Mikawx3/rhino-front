import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import ErrorNotifications from "@/components/ErrorNotifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LeRhino - Plateforme d'apprentissage intelligente",
  description: "Abonnez-vous à des cours et recevez des questions générées par IA pour améliorer votre apprentissage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ErrorProvider>
          <AuthProvider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <ErrorNotifications />
          </AuthProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
