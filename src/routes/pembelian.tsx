import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { Card, EmptyState, PageHeader, Section } from "@/components/ui-kit";
import { Alert, Button, Field, SelectInput, TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { formatCurrency, formatNumber, parseCurrencyInput, parseNumberInput } from "@/lib/currency";
import { fromInputDate, toInputDate, formatTanggal } from "@/lib/date";
import { createPurchase } from "@/lib/operations";

export const Route = createFileRoute("/pembelian")({
  head: () => ({
    meta: [
      { title: "Pembelian — Sahabat UMKM" },
      { name: "description", content: "Catat belanja bahan baku ke supplier dan perbarui stok otomatis." },
      { property: "og:title", content: "Pembelian — Sahabat UMKM" },
      { property: "og:description", content: "Catat pembelian bahan dan perbarui stok." },
    ],
  }),
  component: () => (
    <Page>
      <Pembelian />
    </Page>
  ),
});

interface Baris {
  rawMaterialId: string;
  qty: number;
  hargaSatuan: number;
}

function Pembelian() {
  const materials = useLiveQuery(() => db.rawMaterials.toArray(), [], []);
  const purchases = useLiveQuery(
    () => db.purchases.orderBy("tanggal").reverse().limit(20).toArray(),
    [],
    [],
  );

  const [supplier, setSupplier] = useState("");
  const [tanggal, setTanggal] = useState(toInputDate(Date.now()));
  const [catatan, setCatatan] = useState("");
  const [baris, setBaris] = useState<Baris[]>([]);
  const [error, setError] = useState("");

  const total = baris.reduce((s, b) => s + Math.round(b.qty * b.hargaSatuan), 0);

  async function simpan() {
    setError("");
    const valid = baris.filter((b) => b.rawMaterialId && b.qty > 0);
    if (valid.length === 0) {
      setError("Tambahkan minimal satu bahan dengan jumlah lebih dari nol.");
      return;
    }
    try {
      await createPurchase({
        supplier: supplier.trim(),
        tanggal: fromInputDate(tanggal),
        lines: valid,
        ...(catatan.trim() ? { catatan: catatan.trim() } : {}),
      });
      setBaris([]);
      setSupplier("");
      setCatatan("");
      toast.success("Pembelian tersimpan, stok bahan bertambah.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan pembelian.");
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title="Pembelian" subtitle="Belanja bahan baku" back="/lainnya" />

      <Section className="space-y-3 pt-3">
        <Field label="Supplier">
          <TextInput
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Toko Sembako Jaya"
          />
        </Field>
        <Field label="Tanggal">
          <TextInput type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </Field>
      </Section>

      <Section title="Bahan dibeli" className="mt-4">
        {materials.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Belum ada bahan baku. Tambahkan bahan baku dulu di menu Lainnya.
          </p>
        ) : (
          <div className="space-y-2">
            {baris.map((b, i) => (
              <div key={i} className="card-soft space-y-2 p-3">
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <Field label="Bahan">
                      <SelectInput
                        value={b.rawMaterialId}
                        onChange={(e) => {
                          const m = materials.find((x) => x.id === e.target.value);
                          setBaris((prev) =>
                            prev.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    rawMaterialId: e.target.value,
                                    hargaSatuan: x.hargaSatuan || (m?.hargaBeliTerakhir ?? 0),
                                  }
                                : x,
                            ),
                          );
                        }}
                      >
                        <option value="">Pilih bahan</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nama} ({m.satuan})
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    className="px-2"
                    aria-label="Hapus baris"
                    onClick={() => setBaris((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Jumlah">
                    <TextInput
                      inputMode="decimal"
                      value={String(b.qty)}
                      onChange={(e) =>
                        setBaris((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, qty: parseNumberInput(e.target.value) } : x,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Harga / satuan">
                    <TextInput
                      inputMode="numeric"
                      value={b.hargaSatuan ? b.hargaSatuan.toLocaleString("id-ID") : ""}
                      onChange={(e) =>
                        setBaris((prev) =>
                          prev.map((x, j) =>
                            j === i
                              ? { ...x, hargaSatuan: parseCurrencyInput(e.target.value) }
                              : x,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Subtotal {formatCurrency(Math.round(b.qty * b.hargaSatuan))}
                </p>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setBaris((prev) => [...prev, { rawMaterialId: "", qty: 1, hargaSatuan: 0 }])
              }
            >
              + Tambah bahan
            </Button>
          </div>
        )}
      </Section>

      <Section className="mt-4 space-y-3">
        <Field label="Catatan" hint="Opsional">
          <TextInput
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Belanja mingguan"
          />
        </Field>
        <div className="card-soft flex items-center justify-between p-4">
          <span className="text-sm font-bold">Total belanja</span>
          <span className="num-big text-lg font-extrabold">{formatCurrency(total)}</span>
        </div>
        <Alert>{error}</Alert>
        <Button onClick={simpan}>Simpan pembelian</Button>
      </Section>

      <Section title="Pembelian terakhir" className="mt-6">
        {purchases.length === 0 ? (
          <EmptyState title="Belum ada pembelian" description="Catatan belanja akan muncul di sini." />
        ) : (
          <div className="space-y-2">
            {purchases.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{p.supplier || "Tanpa supplier"}</p>
                    <p className="text-xs text-muted-foreground">{formatTanggal(p.tanggal)}</p>
                    {p.catatan ? (
                      <p className="text-xs text-muted-foreground">{p.catatan}</p>
                    ) : null}
                  </div>
                  <p className="num-big text-sm font-extrabold">{formatCurrency(p.total)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <p className="px-4 pt-4 text-xs text-muted-foreground">
        {materials.length} bahan tersedia · {formatNumber(baris.length)} baris belanja
      </p>
    </div>
  );
}
