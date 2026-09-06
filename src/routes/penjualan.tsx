import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Page } from "@/components/Page";
import { EmptyState, PageHeader } from "@/components/ui-kit";
import { Alert, Button, SelectInput, TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { formatCurrency, parseCurrencyInput } from "@/lib/currency";
import { calculateSaleSubtotal, calculateSaleTotal, type CartLine } from "@/lib/calculations";
import { createSale } from "@/lib/operations";
import type { PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/penjualan")({
  head: () => ({
    meta: [
      { title: "Kasir — Sahabat UMKM" },
      { name: "description", content: "Catat penjualan harian dengan kasir sederhana yang bekerja offline." },
      { property: "og:title", content: "Kasir — Sahabat UMKM" },
      { property: "og:description", content: "Catat penjualan harian tanpa internet." },
    ],
  }),
  component: () => (
    <Page>
      <Kasir />
    </Page>
  ),
});

const METODE: PaymentMethod[] = ["Tunai", "Transfer", "QRIS", "Lainnya"];

function Kasir() {
  const products = useLiveQuery(() => db.products.orderBy("nama").toArray(), [], []);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [diskonText, setDiskon] = useState("");
  const [metode, setMetode] = useState<PaymentMethod>("Tunai");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const diskon = parseCurrencyInput(diskonText);
  const subtotal = useMemo(() => calculateSaleSubtotal(cart), [cart]);
  const total = calculateSaleTotal(subtotal, diskon);

  const filtered = products.filter((p) => p.nama.toLowerCase().includes(q.toLowerCase()));

  function tambah(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setCart((c) => {
      const ada = c.find((l) => l.productId === productId);
      if (ada) {
        return c.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...c, { productId, nama: p.nama, harga: p.hargaJual, hpp: p.hpp, qty: 1 }];
    });
  }

  function ubahQty(productId: string, delta: number) {
    setCart((c) =>
      c
        .map((l) => (l.productId === productId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }

  async function simpan() {
    setError("");
    setBusy(true);
    try {
      const invoice = await createSale({ lines: cart, diskon, metode });
      toast.success(`Penjualan tersimpan · ${invoice}`);
      setCart([]);
      setDiskon("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan penjualan.";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-40">
      <PageHeader
        title="Kasir"
        subtitle="Pilih produk untuk mulai"
        action={
          <Link to="/riwayat" className="text-xs font-bold text-primary">
            Riwayat
          </Link>
        }
      />

      <div className="px-4 py-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari produk..."
          className="mt-0"
        />
      </div>

      <div className="px-4">
        {filtered.length === 0 ? (
          <EmptyState title="Belum ada produk" description="Tambahkan produk terlebih dahulu." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => tambah(p.id)}
                disabled={p.stok <= 0}
                className={cn(
                  "card-soft p-3 text-left active:scale-[0.98]",
                  p.stok <= 0 && "opacity-50",
                )}
              >
                <p className="line-clamp-2 text-sm font-bold">{p.nama}</p>
                <p className="num-big mt-1 text-sm font-extrabold text-primary">
                  {formatCurrency(p.hargaJual)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Stok {p.stok} {p.satuan}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="mt-5 px-4">
          <h2 className="mb-2 text-sm font-bold">Keranjang</h2>
          <div className="card-soft divide-y divide-border">
            {cart.map((l) => (
              <div key={l.productId} className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.nama}</p>
                  <p className="num-big text-xs text-muted-foreground">
                    {formatCurrency(l.harga)} × {l.qty} = {formatCurrency(l.harga * l.qty)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Kurangi"
                  onClick={() => ubahQty(l.productId, -1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="num-big w-6 text-center text-sm font-bold">{l.qty}</span>
                <button
                  type="button"
                  aria-label="Tambah"
                  onClick={() => ubahQty(l.productId, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Hapus"
                  onClick={() => setCart((c) => c.filter((x) => x.productId !== l.productId))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <TextInput
              inputMode="numeric"
              value={diskonText}
              onChange={(e) => setDiskon(e.target.value)}
              placeholder="Diskon (Rp)"
              className="mt-0"
            />
            <SelectInput
              value={metode}
              onChange={(e) => setMetode(e.target.value as PaymentMethod)}
              className="mt-0"
            >
              {METODE.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="mt-3">
            <Alert>{error}</Alert>
          </div>
        </div>
      ) : null}

      {cart.length > 0 ? (
        <div className="safe-bottom fixed inset-x-0 bottom-[60px] z-30 border-t border-border bg-surface/98 p-3 backdrop-blur">
          <div className="mx-auto max-w-lg">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal {formatCurrency(subtotal)}
                {diskon > 0 ? ` · diskon ${formatCurrency(diskon)}` : ""}
              </span>
              <span className="num-big text-lg font-extrabold">{formatCurrency(total)}</span>
            </div>
            <Button className="w-full" onClick={simpan} disabled={busy}>
              {busy ? "Menyimpan..." : "Simpan penjualan"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
