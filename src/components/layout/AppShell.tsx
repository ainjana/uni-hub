'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import GlobalSearchModal from './GlobalSearchModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0C0E] text-textPrimary">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
