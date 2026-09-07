import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { PageHeader, Section } from "@/components/ui-kit";
import { Alert, Button, Field, SelectInput, TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { parseCurrencyInput, parseNumberInput } from "@/lib/currency";
import { deleteRawMaterial, saveRawMaterial } from "@/lib/operations";

export const Route = createFileRoute("/bahan/$id")({
  head: () => ({
    meta: [
      { title: "Ubah Bahan Baku — Sahabat UMKM" },
      { name: "description", content: "Tambah atau ubah bahan baku, satuan, stok, dan harga beli." },
      { property: "og:title", content: "Ubah Bahan Baku — Sahabat UMKM" },
      { property: "og:description", content: "Atur detail bahan baku usaha Anda." },
    ],
  }),
  component: () => (
    <Page>
      <BahanForm />
    </Page>
  ),
});

const SATUAN = ["gram", "kg", "ml", "liter", "pcs", "meter", "box", "botol", "sachet"];

function BahanForm() {
  const { id } = Route.useParams();
  const baru = id === "baru";
  const navigate = useNavigate();
  const bahan = useLiveQuery(
    async () => (baru ? undefined : await db.rawMaterials.get(id)),
    [id],
    undefined,
  );

  const [nama, setNama] = useState("");
  const [satuan, setSatuan] = useState("gram");
  const [stok, setStok] = useState(0);
  const [minStok, setMinStok] = useState(0);
  const [harga, setHarga] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loaded) return;
    if (baru) {
      setLoaded(true);
      return;
    }
    if (bahan) {
      setNama(bahan.nama);
      setSatuan(bahan.satuan);
      setStok(bahan.stok);
      setMinStok(bahan.minStok);
      setHarga(bahan.hargaBeliTerakhir);
      setLoaded(true);
    }
  }, [bahan, baru, loaded]);

  async function simpan() {
    setError("");
    if (!nama.trim()) {
      setError("Nama bahan wajib diisi.");
      return;
    }
    try {
      await saveRawMaterial({
        ...(baru ? {} : { id }),
        nama: nama.trim(),
        satuan,
        stok,
        minStok,
        hargaBeliTerakhir: harga,
      });
      toast.success(baru ? "Bahan ditambahkan." : "Bahan diperbarui.");
      navigate({ to: "/bahan" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan bahan.");
    }
  }

  async function hapus() {
    if (baru) return;
    if (!confirm("Hapus bahan baku ini?")) return;
    try {
      await deleteRawMaterial(id);
      toast.success("Bahan dihapus.");
      navigate({ to: "/bahan" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus bahan.");
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title={baru ? "Bahan baru" : "Ubah bahan"} back="/bahan" />
      <Section className="space-y-3 pt-3">
        <Field label="Nama bahan">
          <TextInput value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Gula pasir" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Satuan">
            <SelectInput value={satuan} onChange={(e) => setSatuan(e.target.value)}>
              {SATUAN.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Stok">
            <TextInput
              inputMode="decimal"
              value={String(stok)}
              onChange={(e) => setStok(parseNumberInput(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Stok minimum">
          <TextInput
            inputMode="decimal"
            value={String(minStok)}
            onChange={(e) => setMinStok(parseNumberInput(e.target.value))}
          />
        </Field>
        <Field label="Harga beli terakhir" hint={`Per 1 ${satuan}`}>
          <TextInput
            inputMode="numeric"
            value={harga ? harga.toLocaleString("id-ID") : ""}
            onChange={(e) => setHarga(parseCurrencyInput(e.target.value))}
            placeholder="16"
          />
        </Field>
        <Alert>{error}</Alert>
        <Button onClick={simpan}>Simpan bahan</Button>
        {!baru ? (
          <Button variant="outline" onClick={hapus}>
            Hapus bahan
          </Button>
        ) : null}
      </Section>
    </div>
  );
}
