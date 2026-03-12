import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Recetas FQ',
  description: 'Gestor de recetas de productos Full Queso',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <SessionProvider>
          <Header />
          <main className="max-w-3xl mx-auto px-4 py-8">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
