'use client';

import LayoutWithSidebar from '@/components/LayoutWithSidebar';

export default function Template({ children }: { children: React.ReactNode }) {
  return <LayoutWithSidebar>{children}</LayoutWithSidebar>;
}