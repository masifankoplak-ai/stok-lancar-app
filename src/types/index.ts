export type Unit =
  | "pcs"
  | "gram"
  | "kg"
  | "ml"
  | "liter"
  | "meter"
  | "box"
  | "botol"
  | "sachet"
  | string;

export interface Product {
  id: string;
  nama: string;
  sku: string;
  hargaJual: number; // integer rupiah
  hpp: number; // integer rupiah
  stok: number;
  satuan: Unit;
  minStok: number;
  foto?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RawMaterial {
  id: string;
  nama: string;
  satuan: Unit;
  stok: number;
  minStok: number;
  hargaBeliTerakhir: number; // integer rupiah per satuan
  createdAt: number;
  updatedAt: number;
}

export interface Recipe {
  id: string;
  productId: string;
  createdAt: number;
  updatedAt: number;
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  rawMaterialId: string;
  qty: number;
}

export type PaymentMethod = "Tunai" | "Transfer" | "QRIS" | "Lainnya";

export interface Sale {
  id: string;
  invoice: string;
  tanggal: number;
  subtotal: number;
  diskon: number;
  total: number;
  hpp: number;
  laba: number;
  metode: PaymentMethod;
  catatan?: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  namaProduk: string;
  qty: number;
  harga: number;
  hpp: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  tanggal: number;
  total: number;
  catatan?: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  rawMaterialId: string;
  namaBahan: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
}

export type MovementType = "Pembelian" | "Penjualan" | "Penyesuaian" | "Awal";

export interface StockMovement {
  id: string;
  tanggal: number;
  itemType: "produk" | "bahan";
  itemId: string;
  namaItem: string;
  satuan: Unit;
  qty: number; // positive or negative
  tipe: MovementType;
  alasan: string;
  refId?: string;
}

export type ExpenseCategory =
  | "Listrik"
  | "Air"
  | "Sewa"
  | "Gaji"
  | "Transportasi"
  | "Bahan bakar"
  | "Peralatan"
  | "Marketing"
  | "Lainnya";

export interface Expense {
  id: string;
  kategori: ExpenseCategory;
  keterangan: string;
  jumlah: number;
  tanggal: number;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: string;
}

export type StockStatus = "Aman" | "Menipis" | "Habis";
