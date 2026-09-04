import type { RawMaterial, RecipeItem, StockStatus } from "@/types";

export { formatCurrency } from "./currency";

export interface CartLine {
  productId: string;
  nama: string;
  harga: number;
  hpp: number;
  qty: number;
}

/** HPP resep = jumlah (qty x harga beli terakhir bahan). */
export function calculateRecipeCost(
  items: Pick<RecipeItem, "rawMaterialId" | "qty">[],
  materials: RawMaterial[],
): number {
  const map = new Map(materials.map((m) => [m.id, m]));
  const total = items.reduce((sum, it) => {
    const m = map.get(it.rawMaterialId);
    if (!m) return sum;
    return sum + it.qty * m.hargaBeliTerakhir;
  }, 0);
  return Math.round(total);
}

export function calculateSaleSubtotal(lines: CartLine[]): number {
  return Math.round(lines.reduce((s, l) => s + l.harga * l.qty, 0));
}

export function calculateSaleTotal(subtotal: number, diskon: number): number {
  return Math.max(0, Math.round(subtotal - diskon));
}

export function calculateCOGS(lines: Pick<CartLine, "hpp" | "qty">[]): number {
  return Math.round(lines.reduce((s, l) => s + l.hpp * l.qty, 0));
}

export function calculateGrossProfit(penjualan: number, hpp: number): number {
  return Math.round(penjualan - hpp);
}

export function calculateNetProfit(
  penjualan: number,
  hpp: number,
  pengeluaran: number,
): number {
  return Math.round(penjualan - hpp - pengeluaran);
}

export function calculateStockStatus(stok: number, minStok: number): StockStatus {
  if (stok <= 0) return "Habis";
  if (stok <= minStok) return "Menipis";
  return "Aman";
}

export function statusColorClass(status: StockStatus): string {
  if (status === "Habis") return "bg-destructive/10 text-destructive";
  if (status === "Menipis") return "bg-warning/15 text-warning-foreground";
  return "bg-success/12 text-success";
}
