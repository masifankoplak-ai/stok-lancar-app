import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/Page";
import { Card, EmptyState, Fab, PageHeader, Section, StatusBadge } from "@/components/ui-kit";
import { TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { calculateStockStatus } from "@/lib/calculations";
import { formatCurrency, formatNumber } from "@/lib/currency";

export const Route = createFileRoute("/produk/")({
  head: () => ({
    meta: [
      { title: "Produk — Sahabat UMKM" },
      { name: "description", content: "Daftar produk jualan beserta harga, stok, dan HPP dari resep." },
      { property: "og:title", content: "Produk — Sahabat UMKM" },
      { property: "og:description", content: "Kelola produk, harga jual, dan HPP resep." },
    ],
  }),
  component: () => (
    <Page>
      <ProdukList />
    </Page>
  ),
});

function ProdukList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const products = useLiveQuery(() => db.products.toArray(), [], []);
  const rows = products.filter(
    (p) =>
      p.nama.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="pb-6">
      <PageHeader title="Produk" subtitle={`${products.length} produk`} back="/lainnya" />
      <div className="px-4 py-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari produk atau SKU..."
          className="mt-0"
        />
      </div>
      <Section>
        {rows.length === 0 ? (
          <EmptyState
            title="Belum ada produk"
            description="Tambahkan produk pertama Anda dengan tombol di bawah."
          />
        ) : (
          <div className="space-y-2">
            {rows.map((p) => (
              <Link key={p.id} to="/produk/$id" params={{ id: p.id }} className="block">
                <Card>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.sku || "Tanpa SKU"} · Stok {formatNumber(p.stok)} {p.satuan}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        HPP {formatCurrency(p.hpp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num-big text-sm font-extrabold">
                        {formatCurrency(p.hargaJual)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={calculateStockStatus(p.stok, p.minStok)} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
      <Fab label="+ Produk" onClick={() => navigate({ to: "/produk/$id", params: { id: "baru" } })} />
    </div>
  );
}
