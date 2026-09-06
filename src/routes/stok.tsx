import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { Card, EmptyState, PageHeader, Section, StatusBadge } from "@/components/ui-kit";
import { Alert, Button, Field, TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { calculateStockStatus } from "@/lib/calculations";
import { formatNumber, parseNumberInput } from "@/lib/currency";
import { adjustStock } from "@/lib/operations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stok")({
  head: () => ({
    meta: [
      { title: "Stok — Sahabat UMKM" },
      { name: "description", content: "Pantau stok produk dan bahan baku usaha Anda secara offline." },
      { property: "og:title", content: "Stok — Sahabat UMKM" },
      { property: "og:description", content: "Pantau stok produk dan bahan baku usaha Anda." },
    ],
  }),
  component: () => (
    <Page>
      <StokPage />
    </Page>
  ),
});

type Tab = "produk" | "bahan";

function StokPage() {
  const [tab, setTab] = useState<Tab>("produk");
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<{
    itemType: Tab;
    itemId: string;
    nama: string;
    satuan: string;
    stok: number;
  } | null>(null);

  const products = useLiveQuery(() => db.products.toArray(), [], []);
  const materials = useLiveQuery(() => db.rawMaterials.toArray(), [], []);

  const rows = (
    tab === "produk"
      ? products.map((p) => ({
          id: p.id,
          nama: p.nama,
          ket: p.sku,
          stok: p.stok,
          satuan: p.satuan,
          minStok: p.minStok,
        }))
      : materials.map((m) => ({
          id: m.id,
          nama: m.nama,
          ket: "Bahan baku",
          stok: m.stok,
          satuan: m.satuan,
          minStok: m.minStok,
        }))
  ).filter((r) => r.nama.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pb-6">
      <PageHeader
        title="Stok"
        subtitle="Produk & bahan baku"
        action={
          <Link to="/mutasi" className="text-xs font-bold text-primary">
            Mutasi
          </Link>
        }
      />

      <div className="space-y-3 px-4 py-3">
        <div className="flex rounded-xl bg-muted p-1">
          {(["produk", "bahan"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-bold capitalize",
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {t === "produk" ? "Produk" : "Bahan baku"}
            </button>
          ))}
        </div>
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama..."
          className="mt-0"
        />
      </div>

      <Section>
        {rows.length === 0 ? (
          <EmptyState
            title="Belum ada data"
            description={
              tab === "produk"
                ? "Tambahkan produk lewat menu Lainnya › Produk."
                : "Tambahkan bahan lewat menu Lainnya › Bahan baku."
            }
          />
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <Card
                key={r.id}
                onClick={() =>
                  setTarget({
                    itemType: tab,
                    itemId: r.id,
                    nama: r.nama,
                    satuan: r.satuan,
                    stok: r.stok,
                  })
                }
                className="flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{r.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.ket}</p>
                </div>
                <div className="text-right">
                  <p className="num-big text-sm font-bold">
                    {formatNumber(r.stok)} {r.satuan}
                  </p>
                  <StatusBadge status={calculateStockStatus(r.stok, r.minStok)} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {target ? <SheetPenyesuaian target={target} onClose={() => setTarget(null)} /> : null}
    </div>
  );
}

function SheetPenyesuaian({
  target,
  onClose,
}: {
  target: { itemType: Tab; itemId: string; nama: string; satuan: string; stok: number };
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"tambah" | "kurang">("tambah");
  const [qty, setQty] = useState("");
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function simpan() {
    const n = parseNumberInput(qty);
    if (n <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }
    setBusy(true);
    try {
      await adjustStock({
        itemType: target.itemType,
        itemId: target.itemId,
        delta: mode === "tambah" ? n : -n,
        alasan: alasan.trim() || (mode === "tambah" ? "Penambahan manual" : "Pengurangan manual"),
      });
      toast.success("Stok diperbarui.");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-card p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-extrabold">{target.nama}</h2>
        <p className="text-xs text-muted-foreground">
          Stok sekarang {formatNumber(target.stok)} {target.satuan}
        </p>

        <div className="mt-4 flex gap-2">
          {(["tambah", "kurang"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-xl py-3 text-sm font-bold capitalize",
                mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          <Field label={`Jumlah (${target.satuan})`}>
            <TextInput
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Alasan">
            <TextInput
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Rusak, hilang, stok opname..."
            />
          </Field>
          <Alert>{error}</Alert>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button className="flex-1" onClick={simpan} disabled={busy}>
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
