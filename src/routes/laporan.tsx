import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/Page";
import { Card, EmptyState, PageHeader, Section, StatCard } from "@/components/ui-kit";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import {
  calculateGrossProfit,
  calculateNetProfit,
} from "@/lib/calculations";
import { daysAgo, endOfDay, namaHari, startOfDay, startOfMonth } from "@/lib/date";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan — Sahabat UMKM" },
      { name: "description", content: "Laporan omzet, HPP, pengeluaran, dan laba bersih usaha Anda." },
      { property: "og:title", content: "Laporan — Sahabat UMKM" },
      { property: "og:description", content: "Lihat omzet, laba kotor, dan laba bersih usaha Anda." },
    ],
  }),
  component: () => (
    <Page>
      <Laporan />
    </Page>
  ),
});

type Periode = "hari" | "7hari" | "30hari" | "bulan";

const LABEL: Record<Periode, string> = {
  hari: "Hari ini",
  "7hari": "7 hari",
  "30hari": "30 hari",
  bulan: "Bulan ini",
};

function rangeOf(p: Periode): [number, number] {
  const now = Date.now();
  if (p === "hari") return [startOfDay(now), endOfDay(now)];
  if (p === "7hari") return [daysAgo(6), endOfDay(now)];
  if (p === "30hari") return [daysAgo(29), endOfDay(now)];
  return [startOfMonth(now), endOfDay(now)];
}

function Laporan() {
  const [periode, setPeriode] = useState<Periode>("7hari");
  const [from, to] = rangeOf(periode);

  const sales = useLiveQuery(
    () => db.sales.where("tanggal").between(from, to, true, true).toArray(),
    [from, to],
    [],
  );
  const expenses = useLiveQuery(
    () => db.expenses.where("tanggal").between(from, to, true, true).toArray(),
    [from, to],
    [],
  );
  const saleItems = useLiveQuery(() => db.saleItems.toArray(), [], []);

  const omzet = sales.reduce((s, x) => s + x.total, 0);
  const hpp = sales.reduce((s, x) => s + x.hpp, 0);
  const totalPengeluaran = expenses.reduce((s, x) => s + x.jumlah, 0);
  const labaKotor = calculateGrossProfit(omzet, hpp);
  const labaBersih = calculateNetProfit(omzet, hpp, totalPengeluaran);

  const saleIds = new Set(sales.map((s) => s.id));
  const terlaris = new Map<string, { nama: string; qty: number; omzet: number }>();
  for (const it of saleItems) {
    if (!saleIds.has(it.saleId)) continue;
    const cur = terlaris.get(it.productId) ?? { nama: it.namaProduk, qty: 0, omzet: 0 };
    cur.qty += it.qty;
    cur.omzet += it.subtotal;
    terlaris.set(it.productId, cur);
  }
  const topProduk = [...terlaris.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  const hari = Array.from({ length: 7 }, (_, i) => {
    const start = daysAgo(6 - i);
    const end = endOfDay(start);
    const total = sales
      .filter((s) => s.tanggal >= start && s.tanggal <= end)
      .reduce((s, x) => s + x.total, 0);
    return { start, total };
  });
  const maxHari = Math.max(1, ...hari.map((h) => h.total));

  return (
    <div className="space-y-4 pb-6">
      <PageHeader title="Laporan" subtitle={LABEL[periode]} />

      <div className="flex gap-2 overflow-x-auto px-4 pt-3">
        {(Object.keys(LABEL) as Periode[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriode(p)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-bold",
              periode === p ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
            )}
          >
            {LABEL[p]}
          </button>
        ))}
      </div>

      <Section>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Omzet" value={formatCurrency(omzet)} tone="primary" />
          <StatCard label="Laba bersih" value={formatCurrency(labaBersih)} />
          <StatCard label="HPP" value={formatCurrency(hpp)} />
          <StatCard label="Pengeluaran" value={formatCurrency(totalPengeluaran)} />
        </div>
        <Card className="mt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Laba kotor</span>
            <span className="num-big font-bold text-success">{formatCurrency(labaKotor)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Jumlah transaksi</span>
            <span className="num-big font-bold">{sales.length}</span>
          </div>
        </Card>
      </Section>

      <Section title="Penjualan 7 hari terakhir">
        <Card>
          <div className="flex h-32 items-end gap-2">
            {hari.map((h) => (
              <div key={h.start} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary"
                  style={{ height: `${Math.max(4, (h.total / maxHari) * 100)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {namaHari(h.start).slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Produk terlaris">
        {topProduk.length === 0 ? (
          <EmptyState title="Belum ada penjualan" description="Data akan muncul setelah ada transaksi." />
        ) : (
          <div className="space-y-2">
            {topProduk.map((p) => (
              <Card key={p.nama} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.nama}</p>
                  <p className="text-xs text-muted-foreground">Terjual {p.qty}</p>
                </div>
                <span className="num-big text-sm font-bold">{formatCurrency(p.omzet)}</span>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
