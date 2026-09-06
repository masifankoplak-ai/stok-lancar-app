import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { ClientOnly } from "./ClientOnly";

/** Semua halaman hanya dirender di perangkat (data ada di IndexedDB). */
export function Page({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <AppShell>{children}</AppShell>
    </ClientOnly>
  );
}
