import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import SkyCanvas from '@/components/SkyCanvas';

export const metadata: Metadata = {
  title: 'Profe Núñez · Mi Semana & Campus Virtual',
  description: 'Horarios, bitácora docente y campus virtual con roadmap de estudio para alumnos de Educación Tecnológica.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-tema="noche">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-nunito antialiased relative min-h-screen selection:bg-[#ffd166] selection:text-[#241a00]">
        <SkyCanvas />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
