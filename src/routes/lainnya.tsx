import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Boxes,
  ClipboardList,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Page } from "@/components/Page";
import { PageHeader, Section } from "@/components/ui-kit";

export const Route = createFileRoute("/lainnya")({
  head: () => ({
    meta: [
      { title: "Menu Lainnya — Sahabat UMKM" },
      { name: "description", content: "Kelola produk, bahan baku, pembelian, pengeluaran, dan pengaturan aplikasi." },
      { property: "og:title", content: "Menu Lainnya — Sahabat UMKM" },
      { property: "og:description", content: "Kelola produk, bahan, pembelian, dan pengaturan." },
    ],
  }),
  component: () => (
    <Page>
      <Lainnya />
    </Page>
  ),
});

const MENU = [
  { to: "/produk", label: "Produk", desc: "Daftar produk & resep", icon: Package },
  { to: "/bahan", label: "Bahan baku", desc: "Stok bahan mentah", icon: Boxes },
  { to: "/pembelian", label: "Pembelian", desc: "Belanja bahan ke supplier", icon: ShoppingBag },
  { to: "/pengeluaran", label: "Pengeluaran", desc: "Biaya operasional", icon: Wallet },
  { to: "/riwayat", label: "Riwayat penjualan", desc: "Semua transaksi", icon: Receipt },
  { to: "/mutasi", label: "Mutasi stok", desc: "Riwayat keluar masuk", icon: ClipboardList },
  { to: "/pengaturan", label: "Pengaturan", desc: "Cadangan & data", icon: Settings },
] as const;

function Lainnya() {
  return (
    <div className="pb-6">
      <PageHeader title="Lainnya" subtitle="Semua menu aplikasi" />
      <Section className="pt-3">
        <div className="space-y-2">
          {MENU.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.to} to={m.to} className="card-soft flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">{m.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
