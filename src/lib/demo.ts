import { db, newId } from "./db";
import type { Product, RawMaterial, RecipeItem, Sale, SaleItem } from "@/types";

interface BahanSeed {
  nama: string;
  satuan: string;
  stok: number;
  minStok: number;
  harga: number;
}

const BAHAN: BahanSeed[] = [
  { nama: "Teh", satuan: "gram", stok: 2000, minStok: 300, harga: 60 },
  { nama: "Gula", satuan: "gram", stok: 5000, minStok: 1000, harga: 16 },
  { nama: "Kopi", satuan: "gram", stok: 1500, minStok: 300, harga: 120 },
  { nama: "Susu", satuan: "ml", stok: 4000, minStok: 1000, harga: 22 },
  { nama: "Cup", satuan: "pcs", stok: 250, minStok: 50, harga: 700 },
  { nama: "Mie", satuan: "pcs", stok: 60, minStok: 15, harga: 3000 },
  { nama: "Telur", satuan: "pcs", stok: 80, minStok: 20, harga: 2500 },
  { nama: "Beras", satuan: "gram", stok: 12000, minStok: 3000, harga: 14 },
  { nama: "Jeruk", satuan: "pcs", stok: 40, minStok: 15, harga: 2000 },
  { nama: "Minyak", satuan: "ml", stok: 3000, minStok: 800, harga: 20 },
];

interface ProdukSeed {
  nama: string;
  sku: string;
  harga: number;
  stok: number;
  minStok: number;
  satuan: string;
  resep: { bahan: string; qty: number }[];
}

const PRODUK: ProdukSeed[] = [
  {
    nama: "Es Teh Manis",
    sku: "MNM-001",
    harga: 5000,
    stok: 40,
    minStok: 10,
    satuan: "pcs",
    resep: [
      { bahan: "Teh", qty: 5 },
      { bahan: "Gula", qty: 20 },
      { bahan: "Cup", qty: 1 },
    ],
  },
  {
    nama: "Kopi Susu",
    sku: "MNM-002",
    harga: 12000,
    stok: 30,
    minStok: 8,
    satuan: "pcs",
    resep: [
      { bahan: "Kopi", qty: 15 },
      { bahan: "Susu", qty: 100 },
      { bahan: "Gula", qty: 15 },
      { bahan: "Cup", qty: 1 },
    ],
  },
  {
    nama: "Mie Goreng",
    sku: "MKN-001",
    harga: 15000,
    stok: 12,
    minStok: 5,
    satuan: "porsi",
    resep: [
      { bahan: "Mie", qty: 1 },
      { bahan: "Telur", qty: 1 },
      { bahan: "Minyak", qty: 20 },
    ],
  },
  {
    nama: "Nasi Goreng",
    sku: "MKN-002",
    harga: 18000,
    stok: 4,
    minStok: 5,
    satuan: "porsi",
    resep: [
      { bahan: "Beras", qty: 200 },
      { bahan: "Telur", qty: 1 },
      { bahan: "Minyak", qty: 25 },
    ],
  },
  {
    nama: "Es Jeruk",
    sku: "MNM-003",
    harga: 8000,
    stok: 25,
    minStok: 8,
    satuan: "pcs",
    resep: [
      { bahan: "Jeruk", qty: 2 },
      { bahan: "Gula", qty: 20 },
      { bahan: "Cup", qty: 1 },
    ],
  },
];

export async function seedDemoData(): Promise<void> {
  const now = Date.now();
  const bahanIds = new Map<string, RawMaterial>();

  const materials: RawMaterial[] = BAHAN.map((b) => {
    const m: RawMaterial = {
      id: newId("rm"),
      nama: b.nama,
      satuan: b.satuan,
      stok: b.stok,
      minStok: b.minStok,
      hargaBeliTerakhir: b.harga,
      createdAt: now,
      updatedAt: now,
    };
    bahanIds.set(b.nama, m);
    return m;
  });

  const products: Product[] = [];
  const recipes: { id: string; productId: string; createdAt: number; updatedAt: number }[] = [];
  const recipeItems: RecipeItem[] = [];

  for (const p of PRODUK) {
    const hpp = p.resep.reduce((s, r) => {
      const m = bahanIds.get(r.bahan);
      return s + (m ? m.hargaBeliTerakhir * r.qty : 0);
    }, 0);
    const product: Product = {
      id: newId("prd"),
      nama: p.nama,
      sku: p.sku,
      hargaJual: p.harga,
      hpp: Math.round(hpp),
      stok: p.stok,
      satuan: p.satuan,
      minStok: p.minStok,
      createdAt: now,
      updatedAt: now,
    };
    products.push(product);
    const recipeId = newId("rcp");
    recipes.push({ id: recipeId, productId: product.id, createdAt: now, updatedAt: now });
    for (const r of p.resep) {
      const m = bahanIds.get(r.bahan);
      if (m) recipeItems.push({ id: newId("ri"), recipeId, rawMaterialId: m.id, qty: r.qty });
    }
  }

  // Penjualan contoh 7 hari terakhir
  const sales: Sale[] = [];
  const saleItems: SaleItem[] = [];
  const metode = ["Tunai", "QRIS", "Transfer"] as const;
  for (let d = 6; d >= 0; d--) {
    const hari = new Date(now - d * 86400000);
    const jumlahTrx = 2 + ((d * 3) % 3);
    for (let t = 0; t < jumlahTrx; t++) {
      const tanggal = new Date(hari);
      tanggal.setHours(9 + t * 2, 15, 0, 0);
      const ymd = `${tanggal.getFullYear()}${String(tanggal.getMonth() + 1).padStart(2, "0")}${String(tanggal.getDate()).padStart(2, "0")}`;
      const saleId = newId("sale");
      const picks = [products[(d + t) % products.length], products[(d + t + 2) % products.length]]
        .filter((x): x is Product => Boolean(x));
      let subtotal = 0;
      let hppTotal = 0;
      for (const p of picks) {
        const qty = 1 + ((d + t) % 3);
        subtotal += p.hargaJual * qty;
        hppTotal += p.hpp * qty;
        saleItems.push({
          id: newId("si"),
          saleId,
          productId: p.id,
          namaProduk: p.nama,
          qty,
          harga: p.hargaJual,
          hpp: p.hpp,
          subtotal: p.hargaJual * qty,
        });
      }
      sales.push({
        id: saleId,
        invoice: `INV-${ymd}-${String(t + 1).padStart(3, "0")}`,
        tanggal: tanggal.getTime(),
        subtotal,
        diskon: 0,
        total: subtotal,
        hpp: hppTotal,
        laba: subtotal - hppTotal,
        metode: metode[t % metode.length] ?? "Tunai",
      });
    }
  }

  const purchaseId = newId("pur");
  const bahanBeli = ["Gula", "Cup", "Kopi"]
    .map((n) => bahanIds.get(n))
    .filter((m): m is RawMaterial => Boolean(m));
  const purchaseItems = bahanBeli.map((m) => ({
    id: newId("pi"),
    purchaseId,
    rawMaterialId: m.id,
    namaBahan: m.nama,
    qty: m.nama === "Cup" ? 100 : 1000,
    hargaSatuan: m.hargaBeliTerakhir,
    subtotal: (m.nama === "Cup" ? 100 : 1000) * m.hargaBeliTerakhir,
  }));

  const movements = [
    ...materials.map((m) => ({
      id: newId("mv"),
      tanggal: now - 7 * 86400000,
      itemType: "bahan" as const,
      itemId: m.id,
      namaItem: m.nama,
      satuan: m.satuan,
      qty: m.stok,
      tipe: "Awal" as const,
      alasan: "Stok awal data contoh",
    })),
    ...purchaseItems.map((pi) => ({
      id: newId("mv"),
      tanggal: now - 2 * 86400000,
      itemType: "bahan" as const,
      itemId: pi.rawMaterialId,
      namaItem: pi.namaBahan,
      satuan: bahanIds.get(pi.namaBahan)?.satuan ?? "pcs",
      qty: pi.qty,
      tipe: "Pembelian" as const,
      alasan: "Pembelian dari Toko Sembako Jaya",
      refId: purchaseId,
    })),
  ];

  const expenses = [
    { kategori: "Listrik" as const, keterangan: "Token listrik warung", jumlah: 150000, tanggal: now - 5 * 86400000 },
    { kategori: "Sewa" as const, keterangan: "Sewa tempat bulanan", jumlah: 800000, tanggal: now - 10 * 86400000 },
    { kategori: "Transportasi" as const, keterangan: "Belanja ke pasar", jumlah: 35000, tanggal: now - 2 * 86400000 },
    { kategori: "Gaji" as const, keterangan: "Gaji karyawan paruh waktu", jumlah: 600000, tanggal: now - 8 * 86400000 },
  ].map((e) => ({ ...e, id: newId("exp"), createdAt: now }));

  await db.transaction(
    "rw",
    [
      db.products,
      db.rawMaterials,
      db.recipes,
      db.recipeItems,
      db.sales,
      db.saleItems,
      db.purchases,
      db.purchaseItems,
      db.stockMovements,
      db.expenses,
    ],
    async () => {
      await db.rawMaterials.bulkAdd(materials);
      await db.products.bulkAdd(products);
      await db.recipes.bulkAdd(recipes);
      await db.recipeItems.bulkAdd(recipeItems);
      await db.sales.bulkAdd(sales);
      await db.saleItems.bulkAdd(saleItems);
      await db.purchases.add({
        id: purchaseId,
        supplier: "Toko Sembako Jaya",
        tanggal: now - 2 * 86400000,
        total: purchaseItems.reduce((s, p) => s + p.subtotal, 0),
      });
      await db.purchaseItems.bulkAdd(purchaseItems);
      await db.stockMovements.bulkAdd(movements);
      await db.expenses.bulkAdd(expenses);
    },
  );
}
