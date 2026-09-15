import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'University Hub — Verified Student Learning & Collaboration Network',
  description:
    'A verified collegiate network where university students discover academic intelligence, teach and learn skills, share study notes, and build reputation through Karma.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0C0E] text-textPrimary antialiased selection:bg-accentLime selection:text-black">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
