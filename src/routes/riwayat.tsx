import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/Page";
import { Card, EmptyState, PageHeader, Section } from "@/components/ui-kit";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import { formatTanggalWaktu } from "@/lib/date";
import type { SaleItem } from "@/types";

export const Route = createFileRoute("/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Penjualan — Sahabat UMKM" },
      { name: "description", content: "Lihat seluruh riwayat transaksi penjualan usaha Anda." },
      { property: "og:title", content: "Riwayat Penjualan — Sahabat UMKM" },
      { property: "og:description", content: "Seluruh transaksi penjualan tersimpan di perangkat." },
    ],
  }),
  component: () => (
    <Page>
      <Riwayat />
    </Page>
  ),
});

function Riwayat() {
  const [open, setOpen] = useState<string | null>(null);
  const sales = useLiveQuery(() => db.sales.orderBy("tanggal").reverse().toArray(), [], []);
  const items = useLiveQuery(
    async () => (open ? await db.saleItems.where("saleId").equals(open).toArray() : []),
    [open],
    [] as SaleItem[],
  );

  return (
    <div className="pb-6">
      <PageHeader title="Riwayat penjualan" back="/penjualan" />
      <Section className="pt-3">
        {sales.length === 0 ? (
          <EmptyState title="Belum ada transaksi" description="Penjualan Anda akan muncul di sini." />
        ) : (
          <div className="space-y-2">
            {sales.map((s) => (
              <Card key={s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{s.invoice}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTanggalWaktu(s.tanggal)} · {s.metode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="num-big text-sm font-extrabold">{formatCurrency(s.total)}</p>
                    <p className="text-xs text-success">Laba {formatCurrency(s.laba)}</p>
                  </div>
                </div>
                {open === s.id ? (
                  <div className="mt-3 space-y-1 border-t border-border pt-3">
                    {items.map((it) => (
                      <div key={it.id} className="flex justify-between text-xs">
                        <span>
                          {it.namaProduk} × {it.qty}
                        </span>
                        <span className="num-big">{formatCurrency(it.subtotal)}</span>
                      </div>
                    ))}
                    {s.diskon > 0 ? (
                      <div className="flex justify-between text-xs text-destructive">
                        <span>Diskon</span>
                        <span className="num-big">-{formatCurrency(s.diskon)}</span>
                      </div>
                    ) : null}
                    {s.catatan ? (
                      <p className="pt-1 text-xs text-muted-foreground">{s.catatan}</p>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
