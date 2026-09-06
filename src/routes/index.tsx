import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ShoppingCart,
  PackagePlus,
  Receipt,
  Wallet,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Page } from "@/components/Page";
import { Card, EmptyState, Section, StatCard, StatusBadge } from "@/components/ui-kit";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import { calculateStockStatus } from "@/lib/calculations";
import { endOfDay, formatTanggal, startOfDay } from "@/lib/date";
import { getPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sahabat UMKM — Stok rapi, jualan lancar." },
      {
        name: "description",
        content:
          "Aplikasi kasir dan stok offline untuk UMKM Indonesia. Catat penjualan, stok, pembelian, dan laba tanpa internet.",
      },
      { property: "og:title", content: "Sahabat UMKM — Stok rapi, jualan lancar." },
      {
        property: "og:description",
        content: "Kelola stok, penjualan, dan laba usaha Anda langsung dari HP, tanpa internet.",
      },
    ],
  }),
  component: () => (
    <Page>
      <Beranda />
    </Page>
  ),
});

function Beranda() {
  const [nama, setNama] = useState("Usaha Saya");
  useEffect(() => setNama(getPrefs().namaUsaha), []);

  const today = Date.now();
  const sales = useLiveQuery(
    () => db.sales.where("tanggal").between(startOfDay(today), endOfDay(today)).toArray(),
    [],
    [],
  );
  const products = useLiveQuery(() => db.products.toArray(), [], []);
  const materials = useLiveQuery(() => db.rawMaterials.toArray(), [], []);

  const omzet = sales.reduce((s, x) => s + x.total, 0);
  const laba = sales.reduce((s, x) => s + x.laba, 0);

  const perluPerhatian = [
    ...products.map((p) => ({
      id: p.id,
      nama: p.nama,
      sisa: `${p.stok} ${p.satuan}`,
      status: calculateStockStatus(p.stok, p.minStok),
      jenis: "Produk",
    })),
    ...materials.map((m) => ({
      id: m.id,
      nama: m.nama,
      sisa: `${m.stok} ${m.satuan}`,
      status: calculateStockStatus(m.stok, m.minStok),
      jenis: "Bahan",
    })),
  ].filter((x) => x.status !== "Aman");

  return (
    <div className="space-y-5 pb-4">
      <header className="bg-primary px-4 pb-8 pt-6 text-primary-foreground">
        <p className="text-xs font-medium opacity-80">{formatTanggal(today)}</p>
        <h1 className="mt-0.5 text-xl font-extrabold">{nama}</h1>
        <p className="text-xs opacity-85">Stok rapi, jualan lancar.</p>
      </header>

      <div className="-mt-12 px-4">
        <div className="card-soft p-4">
          <p className="text-xs font-medium text-muted-foreground">Omzet hari ini</p>
          <p className="num-big text-3xl font-extrabold text-foreground">
            {formatCurrency(omzet)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <p className="text-xs text-muted-foreground">Transaksi</p>
              <p className="num-big text-lg font-bold">{sales.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Laba kotor</p>
              <p className="num-big text-lg font-bold text-success">{formatCurrency(laba)}</p>
            </div>
          </div>
        </div>
      </div>

      <Section title="Aksi cepat">
        <div className="grid grid-cols-2 gap-3">
          <Pintasan to="/penjualan" icon={ShoppingCart} label="Jualan" />
          <Pintasan to="/pembelian" icon={PackagePlus} label="Beli bahan" />
          <Pintasan to="/pengeluaran" icon={Wallet} label="Pengeluaran" />
          <Pintasan to="/riwayat" icon={Receipt} label="Riwayat" />
        </div>
      </Section>

      <Section
        title="Perlu perhatian"
        action={
          <Link to="/stok" className="text-xs font-bold text-primary">
            Lihat stok
          </Link>
        }
      >
        {perluPerhatian.length === 0 ? (
          <EmptyState title="Semua stok aman" description="Tidak ada barang yang menipis." />
        ) : (
          <div className="space-y-2">
            {perluPerhatian.slice(0, 5).map((x) => (
              <Card key={x.id} className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{x.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {x.jenis} · sisa {x.sisa}
                  </p>
                </div>
                <StatusBadge status={x.status} />
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Ringkasan">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Jenis produk" value={String(products.length)} />
          <StatCard label="Jenis bahan" value={String(materials.length)} />
        </div>
        <Link
          to="/laporan"
          className="card-soft mt-3 flex items-center gap-3 p-4 text-sm font-semibold"
        >
          <TrendingUp className="h-5 w-5 text-primary" />
          Lihat laporan lengkap
        </Link>
      </Section>
    </div>
  );
}

function Pintasan({
  to,
  icon: Icon,
  label,
}: {
  to: "/penjualan" | "/pembelian" | "/pengeluaran" | "/riwayat";
  icon: typeof ShoppingCart;
  label: string;
}) {
  return (
    <Link to={to} className="card-soft flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-bold">{label}</span>
    </Link>
  );
}
