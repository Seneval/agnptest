import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AGNP Tennis AI - Transforma tu Foto en Campeón',
  description: 'Descubre tu versión tenista profesional con IA. Abierto GNP Seguros 2025.',
  openGraph: {
    title: 'AGNP Tennis AI - Transforma tu Foto en Campeón',
    description: 'Descubre tu versión tenista profesional con IA. Abierto GNP Seguros 2025.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}