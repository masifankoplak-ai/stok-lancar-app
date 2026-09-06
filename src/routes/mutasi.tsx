import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/Page";
import { Card, EmptyState, PageHeader, Section } from "@/components/ui-kit";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/currency";
import { formatTanggalWaktu } from "@/lib/date";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mutasi")({
  head: () => ({
    meta: [
      { title: "Mutasi Stok — Sahabat UMKM" },
      { name: "description", content: "Riwayat keluar masuk stok produk dan bahan baku." },
      { property: "og:title", content: "Mutasi Stok — Sahabat UMKM" },
      { property: "og:description", content: "Riwayat keluar masuk stok usaha Anda." },
    ],
  }),
  component: () => (
    <Page>
      <Mutasi />
    </Page>
  ),
});

function Mutasi() {
  const rows = useLiveQuery(
    () => db.stockMovements.orderBy("tanggal").reverse().limit(200).toArray(),
    [],
    [],
  );

  return (
    <div className="pb-6">
      <PageHeader title="Mutasi stok" back="/stok" subtitle="200 pergerakan terakhir" />
      <Section className="pt-3">
        {rows.length === 0 ? (
          <EmptyState title="Belum ada mutasi" description="Semua perubahan stok tercatat di sini." />
        ) : (
          <div className="space-y-2">
            {rows.map((m) => (
              <Card key={m.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{m.namaItem}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.tipe} · {m.alasan}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatTanggalWaktu(m.tanggal)}
                  </p>
                </div>
                <span
                  className={cn(
                    "num-big text-sm font-extrabold",
                    m.qty >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {m.qty >= 0 ? "+" : ""}
                  {formatNumber(m.qty)} {m.satuan}
                </span>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
