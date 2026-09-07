import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { PageHeader, Section } from "@/components/ui-kit";
import { Alert, Button, Field, SelectInput, TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { calculateRecipeCost } from "@/lib/calculations";
import { formatCurrency, parseCurrencyInput, parseNumberInput } from "@/lib/currency";
import { deleteProduct, saveProduct, saveRecipe } from "@/lib/operations";
import type { RecipeItem } from "@/types";

export const Route = createFileRoute("/produk/$id")({
  head: () => ({
    meta: [
      { title: "Ubah Produk — Sahabat UMKM" },
      { name: "description", content: "Tambah atau ubah produk, harga jual, stok, dan resep bahan baku." },
      { property: "og:title", content: "Ubah Produk — Sahabat UMKM" },
      { property: "og:description", content: "Atur detail produk dan resep penghitung HPP." },
    ],
  }),
  component: () => (
    <Page>
      <ProdukForm />
    </Page>
  ),
});

const SATUAN = ["pcs", "porsi", "gram", "kg", "ml", "liter", "box", "botol", "sachet"];

interface Baris {
  rawMaterialId: string;
  qty: number;
}

function ProdukForm() {
  const { id } = Route.useParams();
  const baru = id === "baru";
  const navigate = useNavigate();

  const produk = useLiveQuery(
    async () => (baru ? undefined : await db.products.get(id)),
    [id],
    undefined,
  );
  const materials = useLiveQuery(() => db.rawMaterials.toArray(), [], []);
  const resepItems = useLiveQuery(async () => {
    if (baru) return [] as RecipeItem[];
    const recipe = await db.recipes.where("productId").equals(id).first();
    if (!recipe) return [] as RecipeItem[];
    return db.recipeItems.where("recipeId").equals(recipe.id).toArray();
  }, [id], [] as RecipeItem[]);

  const [nama, setNama] = useState("");
  const [sku, setSku] = useState("");
  const [harga, setHarga] = useState(0);
  const [hppManual, setHppManual] = useState(0);
  const [stok, setStok] = useState(0);
  const [satuan, setSatuan] = useState("pcs");
  const [minStok, setMinStok] = useState(0);
  const [baris, setBaris] = useState<Baris[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loaded) return;
    if (baru) {
      setLoaded(true);
      return;
    }
    if (produk) {
      setNama(produk.nama);
      setSku(produk.sku);
      setHarga(produk.hargaJual);
      setHppManual(produk.hpp);
      setStok(produk.stok);
      setSatuan(produk.satuan);
      setMinStok(produk.minStok);
      setBaris(resepItems.map((r) => ({ rawMaterialId: r.rawMaterialId, qty: r.qty })));
      setLoaded(true);
    }
  }, [produk, resepItems, baru, loaded]);

  const hppResep = calculateRecipeCost(baris, materials);
  const pakaiResep = baris.length > 0;
  const hppFinal = pakaiResep ? hppResep : hppManual;

  async function simpan() {
    setError("");
    if (!nama.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    try {
      const productId = await saveProduct({
        ...(baru ? {} : { id }),
        nama: nama.trim(),
        sku: sku.trim(),
        hargaJual: harga,
        hpp: hppFinal,
        stok,
        satuan,
        minStok,
      });
      if (pakaiResep || !baru) await saveRecipe(productId, baris);
      toast.success(baru ? "Produk ditambahkan." : "Produk diperbarui.");
      navigate({ to: "/produk" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan produk.");
    }
  }

  async function hapus() {
    if (baru) return;
    if (!confirm("Hapus produk ini beserta resepnya?")) return;
    await deleteProduct(id);
    toast.success("Produk dihapus.");
    navigate({ to: "/produk" });
  }

  return (
    <div className="pb-6">
      <PageHeader title={baru ? "Produk baru" : "Ubah produk"} back="/produk" />
      <Section className="space-y-3 pt-3">
        <Field label="Nama produk">
          <TextInput value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Es Teh Manis" />
        </Field>
        <Field label="Kode / SKU" hint="Boleh dikosongkan">
          <TextInput value={sku} onChange={(e) => setSku(e.target.value)} placeholder="MNM-001" />
        </Field>
        <Field label="Harga jual">
          <TextInput
            inputMode="numeric"
            value={harga ? harga.toLocaleString("id-ID") : ""}
            onChange={(e) => setHarga(parseCurrencyInput(e.target.value))}
            placeholder="5.000"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stok">
            <TextInput
              inputMode="decimal"
              value={String(stok)}
              onChange={(e) => setStok(parseNumberInput(e.target.value))}
            />
          </Field>
          <Field label="Satuan">
            <SelectInput value={satuan} onChange={(e) => setSatuan(e.target.value)}>
              {SATUAN.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <Field label="Stok minimum" hint="Muncul peringatan bila stok di bawah angka ini">
          <TextInput
            inputMode="decimal"
            value={String(minStok)}
            onChange={(e) => setMinStok(parseNumberInput(e.target.value))}
          />
        </Field>
        {!pakaiResep ? (
          <Field label="HPP per unit" hint="Isi manual bila produk tidak memakai resep">
            <TextInput
              inputMode="numeric"
              value={hppManual ? hppManual.toLocaleString("id-ID") : ""}
              onChange={(e) => setHppManual(parseCurrencyInput(e.target.value))}
              placeholder="3.000"
            />
          </Field>
        ) : null}
      </Section>

      <Section title="Resep (hitung HPP otomatis)" className="mt-5">
        {materials.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Belum ada bahan baku. Tambahkan bahan baku dulu untuk memakai resep.
          </p>
        ) : (
          <div className="space-y-2">
            {baris.map((b, i) => (
              <div key={i} className="card-soft flex items-end gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <Field label="Bahan">
                    <SelectInput
                      value={b.rawMaterialId}
                      onChange={(e) =>
                        setBaris((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, rawMaterialId: e.target.value } : x,
                          ),
                        )
                      }
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
                <div className="w-24">
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
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setBaris((prev) => prev.filter((_, j) => j !== i))}
                  aria-label="Hapus bahan"
                  className="px-2"
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setBaris((prev) => [...prev, { rawMaterialId: "", qty: 1 }])}
            >
              + Tambah bahan
            </Button>
            {pakaiResep ? (
              <p className="text-xs font-semibold text-muted-foreground">
                HPP dari resep: {formatCurrency(hppResep)}
              </p>
            ) : null}
          </div>
        )}
      </Section>

      <Section className="mt-5 space-y-3">
        <Alert>{error}</Alert>
        <Button onClick={simpan}>Simpan produk</Button>
        {!baru ? (
          <Button variant="outline" onClick={hapus}>
            Hapus produk
          </Button>
        ) : null}
      </Section>
    </div>
  );
}
