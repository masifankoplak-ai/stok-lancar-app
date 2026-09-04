/** Semua nilai uang disimpan sebagai integer Rupiah. */
export function formatCurrency(value: number): string {
  const n = Math.round(Number.isFinite(value) ? value : 0);
  const sign = n < 0 ? "-" : "";
  return `${sign}Rp ${Math.abs(n).toLocaleString("id-ID")}`;
}

export function formatNumber(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

/** Ubah input teks (mis. "25.000") menjadi integer rupiah. */
export function parseCurrencyInput(input: string): number {
  const digits = input.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function parseNumberInput(input: string): number {
  const cleaned = input.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
