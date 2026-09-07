import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/components/Page";
import { Card, EmptyState, PageHeader, Section } from "@/components/ui-kit";
import { Alert, Button, Field, SelectInput, TextInput } from "@/components/form";
import { db } from "@/lib/db";
import { formatCurrency, parseCurrencyInput } from "@/lib/currency";
import { formatTanggal, fromInputDate, toInputDate } from "@/lib/date";
import { deleteExpense, saveExpense } from "@/lib/operations";
import type { ExpenseCategory } from "@/types";

export const Route = createFileRoute("/pengeluaran")({
  head: () => ({
    meta: [
      { title: "Pengeluaran — Sahabat UMKM" },
      { name: "description", content: "Catat biaya operasional usaha seperti listrik, sewa, dan gaji." },
      { property: "og:title", content: "Pengeluaran — Sahabat UMKM" },
      { property: "og:description", content: "Catat dan pantau biaya operasional usaha." },
    ],
  }),
  component: () => (
    <Page>
      <Pengeluaran />
    </Page>
  ),
});

const KATEGORI: ExpenseCategory[] = [
  "Listrik",
  "Air",
  "Sewa",
  "Gaji",
  "Transportasi",
  "Bahan bakar",
  "Peralatan",
  "Marketing",
  "Lainnya",
];

function Pengeluaran() {
  const expenses = useLiveQuery(
    () => db.expenses.orderBy("tanggal").reverse().toArray(),
    [],
    [],
  );

  const [kategori, setKategori] = useState<ExpenseCategory>("Listrik");
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState(0);
  const [tanggal, setTanggal] = useState(toInputDate(Date.now()));
  const [error, setError] = useState("");

  const totalBulanIni = expenses
    .filter((e) => new Date(e.tanggal).getMonth() === new Date().getMonth())
    .reduce((s, e) => s + e.jumlah, 0);

  async function simpan() {
    setError("");
    if (jumlah <= 0) {
      setError("Jumlah pengeluaran harus lebih dari nol.");
      return;
    }
    try {
      await saveExpense({
        kategori,
        keterangan: keterangan.trim() || kategori,
        jumlah,
        tanggal: fromInputDate(tanggal),
      });
      setKeterangan("");
      setJumlah(0);
      toast.success("Pengeluaran dicatat.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan pengeluaran.");
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title="Pengeluaran" subtitle="Biaya operasional" back="/lainnya" />

      <Section className="space-y-3 pt-3">
        <Field label="Kategori">
          <SelectInput
            value={kategori}
            onChange={(e) => setKategori(e.target.value as ExpenseCategory)}
          >
            {KATEGORI.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Keterangan" hint="Opsional">
          <TextInput
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Bayar listrik bulan ini"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jumlah">
            <TextInput
              inputMode="numeric"
              value={jumlah ? jumlah.toLocaleString("id-ID") : ""}
              onChange={(e) => setJumlah(parseCurrencyInput(e.target.value))}
              placeholder="150.000"
            />
          </Field>
          <Field label="Tanggal">
            <TextInput type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </Field>
        </div>
        <Alert>{error}</Alert>
        <Button onClick={simpan}>Simpan pengeluaran</Button>
        <div className="card-soft flex items-center justify-between p-4">
          <span className="text-sm font-bold">Total bulan ini</span>
          <span className="num-big text-lg font-extrabold">{formatCurrency(totalBulanIni)}</span>
        </div>
      </Section>

      <Section title="Riwayat pengeluaran" className="mt-6">
        {expenses.length === 0 ? (
          <EmptyState title="Belum ada pengeluaran" description="Catatan biaya akan muncul di sini." />
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <Card key={e.id}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{e.keterangan}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.kategori} · {formatTanggal(e.tanggal)}
                    </p>
                  </div>
                  <p className="num-big text-sm font-extrabold text-destructive">
                    -{formatCurrency(e.jumlah)}
                  </p>
                  <button
                    type="button"
                    aria-label="Hapus pengeluaran"
                    className="p-1"
                    onClick={async () => {
                      if (!confirm("Hapus catatan pengeluaran ini?")) return;
                      await deleteExpense(e.id);
                      toast.success("Pengeluaran dihapus.");
                    }}
                  >
                    <Trash2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
