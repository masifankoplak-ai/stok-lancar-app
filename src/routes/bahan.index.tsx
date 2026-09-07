import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Page } from "@/components/Page";
import { Card, EmptyState, Fab, PageHeader, Section, StatusBadge } from "@/components/ui-kit";
import { TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { calculateStockStatus } from "@/lib/calculations";
import { formatCurrency, formatNumber } from "@/lib/currency";

export const Route = createFileRoute("/bahan/")({
  head: () => ({
    meta: [
      { title: "Bahan Baku — Sahabat UMKM" },
      { name: "description", content: "Daftar bahan baku, stok tersisa, dan harga beli terakhir." },
      { property: "og:title", content: "Bahan Baku — Sahabat UMKM" },
      { property: "og:description", content: "Pantau stok bahan mentah usaha Anda." },
    ],
  }),
  component: () => (
    <Page>
      <BahanList />
    </Page>
  ),
});

function BahanList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const materials = useLiveQuery(() => db.rawMaterials.toArray(), [], []);
  const rows = materials.filter((m) => m.nama.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pb-6">
      <PageHeader title="Bahan baku" subtitle={`${materials.length} bahan`} back="/lainnya" />
      <div className="px-4 py-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari bahan..."
          className="mt-0"
        />
      </div>
      <Section>
        {rows.length === 0 ? (
          <EmptyState title="Belum ada bahan baku" description="Tambahkan bahan pertama Anda." />
        ) : (
          <div className="space-y-2">
            {rows.map((m) => (
              <Link key={m.id} to="/bahan/$id" params={{ id: m.id }} className="block">
                <Card>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{m.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        Stok {formatNumber(m.stok)} {m.satuan} · min {formatNumber(m.minStok)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num-big text-sm font-extrabold">
                        {formatCurrency(m.hargaBeliTerakhir)}
                      </p>
                      <p className="text-xs text-muted-foreground">per {m.satuan}</p>
                      <div className="mt-1">
                        <StatusBadge status={calculateStockStatus(m.stok, m.minStok)} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
      <Fab label="+ Bahan" onClick={() => navigate({ to: "/bahan/$id", params: { id: "baru" } })} />
    </div>
  );
}
