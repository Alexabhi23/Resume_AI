import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

// Dedicated Layout component — kept in its own file so fast-refresh works correctly.
// router.tsx only exports the `router` constant, not a component.
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
