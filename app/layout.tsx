import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { AuthProvider } from '@/contexts/AuthContext';

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
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </ViewModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}