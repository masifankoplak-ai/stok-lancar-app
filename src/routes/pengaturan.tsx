import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { PageHeader, Section } from "@/components/ui-kit";
import { Alert, Button, Field, TextInput } from "@/components/form";
import { getPrefs, savePrefs } from "@/lib/prefs";
import {
  clearAllData,
  downloadBackup,
  importData,
  summarizeBackup,
  validateBackup,
} from "@/lib/backup";
import { seedDemoData } from "@/lib/demo";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Sahabat UMKM" },
      { name: "description", content: "Atur nama usaha, cadangkan data, pulihkan cadangan, dan hapus semua data." },
      { property: "og:title", content: "Pengaturan — Sahabat UMKM" },
      { property: "og:description", content: "Cadangan, pemulihan, dan pengaturan data aplikasi." },
    ],
  }),
  component: () => (
    <Page>
      <Pengaturan />
    </Page>
  ),
});

function Pengaturan() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [namaUsaha, setNamaUsaha] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [error, setError] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    const p = getPrefs();
    setNamaUsaha(p.namaUsaha);
    setNamaPemilik(p.namaPemilik);
  }, []);

  function simpanProfil() {
    savePrefs({ namaUsaha: namaUsaha.trim() || "Usaha Saya", namaPemilik: namaPemilik.trim() });
    toast.success("Profil usaha disimpan.");
  }

  async function cadangkan() {
    try {
      setSibuk(true);
      const nama = await downloadBackup();
      toast.success(`Cadangan tersimpan: ${nama}`);
    } catch {
      setError("Gagal membuat cadangan.");
    } finally {
      setSibuk(false);
    }
  }

  async function pulihkan(file: File, mode: "ganti" | "gabung") {
    setError("");
    try {
      setSibuk(true);
      const backup = validateBackup(JSON.parse(await file.text()));
      const ringkas = summarizeBackup(backup)
        .filter((r) => r.count > 0)
        .map((r) => `${r.name}: ${r.count}`)
        .join(", ");
      if (!confirm(`Pulihkan cadangan (${mode})?\n${ringkas || "Cadangan kosong"}`)) return;
      await importData(backup, mode);
      toast.success("Data berhasil dipulihkan.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memulihkan data.");
    } finally {
      setSibuk(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function isiDataContoh() {
    if (!confirm("Tambahkan data contoh ke aplikasi?")) return;
    setSibuk(true);
    try {
      await seedDemoData();
      toast.success("Data contoh ditambahkan.");
    } catch {
      setError("Gagal menambahkan data contoh.");
    } finally {
      setSibuk(false);
    }
  }

  async function hapusSemua() {
    if (konfirmasi.trim().toUpperCase() !== "HAPUS") {
      setError('Ketik kata HAPUS untuk konfirmasi.');
      return;
    }
    if (!confirm("Semua data usaha akan dihapus permanen. Lanjutkan?")) return;
    setSibuk(true);
    try {
      await clearAllData();
      setKonfirmasi("");
      toast.success("Semua data telah dihapus.");
      window.dispatchEvent(new Event("su:reset"));
    } catch {
      setError("Gagal menghapus data.");
    } finally {
      setSibuk(false);
    }
  }

  const [mode, setMode] = useState<"ganti" | "gabung">("gabung");

  return (
    <div className="pb-6">
      <PageHeader title="Pengaturan" subtitle="Profil & data" back="/lainnya" />

      <Section title="Profil usaha" className="space-y-3 pt-3">
        <Field label="Nama usaha">
          <TextInput value={namaUsaha} onChange={(e) => setNamaUsaha(e.target.value)} />
        </Field>
        <Field label="Nama pemilik" hint="Opsional">
          <TextInput value={namaPemilik} onChange={(e) => setNamaPemilik(e.target.value)} />
        </Field>
        <Button onClick={simpanProfil}>Simpan profil</Button>
      </Section>

      <Section title="Cadangkan data" className="mt-6 space-y-3">
        <p className="text-xs text-muted-foreground">
          Simpan seluruh data usaha ke satu berkas JSON di perangkat Anda.
        </p>
        <Button variant="outline" disabled={sibuk} onClick={cadangkan}>
          Unduh cadangan
        </Button>
      </Section>

      <Section title="Pulihkan data" className="mt-6 space-y-3">
        <div className="flex rounded-xl bg-muted p-1">
          {(["gabung", "ganti"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-bold ${
                mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "gabung" ? "Gabungkan" : "Ganti semua"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "gabung"
            ? "Data cadangan ditambahkan ke data yang ada."
            : "Semua data saat ini dihapus lalu diganti isi cadangan."}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void pulihkan(f, mode);
          }}
        />
        <Button variant="outline" disabled={sibuk} onClick={() => fileRef.current?.click()}>
          Pilih berkas cadangan
        </Button>
      </Section>

      <Section title="Data contoh" className="mt-6 space-y-3">
        <p className="text-xs text-muted-foreground">
          Menambahkan produk, bahan, dan transaksi contoh untuk mencoba aplikasi.
        </p>
        <Button variant="outline" disabled={sibuk} onClick={isiDataContoh}>
          Isi data contoh
        </Button>
      </Section>

      <Section title="Hapus semua data" className="mt-6 space-y-3">
        <p className="text-xs text-muted-foreground">
          Tindakan ini permanen dan tidak bisa dibatalkan. Ketik <strong>HAPUS</strong> untuk
          mengonfirmasi.
        </p>
        <TextInput
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
          placeholder="HAPUS"
        />
        <Alert>{error}</Alert>
        <Button variant="danger" disabled={sibuk} onClick={hapusSemua}>
          Hapus semua data
        </Button>
      </Section>
    </div>
  );
}
