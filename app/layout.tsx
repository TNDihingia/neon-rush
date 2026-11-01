import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEON RUSH — High-Velocity Cyber Arcade Game',
  description: 'An addictive endless neon arcade game. Dodge hazards, collect energy cores, and enter hyper overdrive in a pulsing synthwave cyberpunk world.',
  keywords: ['game', 'arcade', 'neon', 'cyberpunk', 'synthwave', 'runner', 'indie game', 'html5 canvas'],
  authors: [{ name: 'Neon Rush Studio' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'NEON RUSH — Addictive Mini Arcade Game',
    description: 'Dodge laser hazards, trigger near-miss combos, and survive the endless neon speedway.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#05050f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="w-screen h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-neon-cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}
