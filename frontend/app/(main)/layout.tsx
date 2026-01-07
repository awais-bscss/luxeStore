'use client';

import { Footer } from '../../components/layout/Footer';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';
import { CustomCursor } from '../../components/ui/CustomCursor';

export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
      <WhatsAppButton />
      <CustomCursor />
    </>
  );
}

