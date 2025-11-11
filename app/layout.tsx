import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClariMed - Simple Medication Tracker',
  description: 'Keep track of your medications simply and clearly',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ViewModeProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ViewModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}