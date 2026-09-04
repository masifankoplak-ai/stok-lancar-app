import { useState } from "react";
import { Sprout, Loader2 } from "lucide-react";
import { seedDemoData } from "@/lib/demo";
import { savePrefs, setOnboarded } from "@/lib/prefs";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [namaUsaha, setNamaUsaha] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [loading, setLoading] = useState<"demo" | "kosong" | null>(null);
  const [error, setError] = useState("");

  async function mulai(mode: "demo" | "kosong") {
    if (!namaUsaha.trim()) {
      setError("Nama usaha wajib diisi.");
      return;
    }
    setError("");
    setLoading(mode);
    try {
      savePrefs({ namaUsaha: namaUsaha.trim(), namaPemilik: namaPemilik.trim() });
      if (mode === "demo") await seedDemoData();
      setOnboarded();
      onDone();
    } catch {
      setError("Gagal menyiapkan data. Coba lagi.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
            <Sprout className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Selamat datang di Sahabat UMKM
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola stok, penjualan, dan usaha Anda dengan lebih mudah.
          </p>
          <p className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            Stok rapi, jualan lancar.
          </p>
        </div>

        <div className="card-soft space-y-4 p-5">
          <div>
            <label htmlFor="nama-usaha" className="text-sm font-semibold text-foreground">
              Nama Usaha
            </label>
            <input
              id="nama-usaha"
              value={namaUsaha}
              onChange={(e) => setNamaUsaha(e.target.value)}
              placeholder="Warung Bu Sri"
              className="mt-1 h-12 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="nama-pemilik" className="text-sm font-semibold text-foreground">
              Nama Pemilik <span className="font-normal text-muted-foreground">(opsional)</span>
            </label>
            <input
              id="nama-pemilik"
              value={namaPemilik}
              onChange={(e) => setNamaPemilik(e.target.value)}
              placeholder="Sri Rahayu"
              className="mt-1 h-12 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="button"
            disabled={loading !== null}
            onClick={() => mulai("demo")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {loading === "demo" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Mulai dengan Data Contoh
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => mulai("kosong")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-foreground disabled:opacity-60"
          >
            {loading === "kosong" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Mulai dari Kosong
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Tanpa akun, tanpa internet. Semua data tersimpan di perangkat Anda.
        </p>
      </div>
    </div>
  );
}
