import { db, newId } from "./db";
import type {
  CartLine,
} from "./calculations";
import {
  calculateCOGS,
  calculateSaleSubtotal,
  calculateSaleTotal,
} from "./calculations";
import type {
  Expense,
  MovementType,
  PaymentMethod,
  Product,
  RawMaterial,
  StockMovement,
} from "@/types";

export class StockError extends Error {}

function movement(
  data: Omit<StockMovement, "id" | "tanggal"> & { tanggal?: number },
): StockMovement {
  return { id: newId("mv"), tanggal: data.tanggal ?? Date.now(), ...data };
}

export async function nextInvoice(tanggal = Date.now()): Promise<string> {
  const d = new Date(tanggal);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const prefix = `INV-${ymd}-`;
  const todays = await db.sales.where("invoice").startsWith(prefix).count();
  return `${prefix}${String(todays + 1).padStart(3, "0")}`;
}

/** Simpan penjualan secara atomik: validasi stok, kurangi stok produk & bahan, catat mutasi. */
export async function createSale(params: {
  lines: CartLine[];
  diskon: number;
  metode: PaymentMethod;
  catatan?: string;
}): Promise<string> {
  const { lines, diskon, metode, catatan } = params;
  if (lines.length === 0) throw new StockError("Keranjang masih kosong.");

  const invoice = await nextInvoice();

  return db.transaction(
    "rw",
    [
      db.products,
      db.rawMaterials,
      db.recipes,
      db.recipeItems,
      db.sales,
      db.saleItems,
      db.stockMovements,
    ],
    async () => {
      const now = Date.now();
      const materialUsage = new Map<string, number>();
      const productUsage = new Map<string, number>();

      for (const line of lines) {
        const product = await db.products.get(line.productId);
        if (!product) throw new StockError(`Produk ${line.nama} tidak ditemukan.`);
        productUsage.set(
          product.id,
          (productUsage.get(product.id) ?? 0) + line.qty,
        );

        const recipe = await db.recipes.where("productId").equals(product.id).first();
        if (recipe) {
          const items = await db.recipeItems
            .where("recipeId")
            .equals(recipe.id)
            .toArray();
          for (const it of items) {
            materialUsage.set(
              it.rawMaterialId,
              (materialUsage.get(it.rawMaterialId) ?? 0) + it.qty * line.qty,
            );
          }
        }
      }

      // Validasi stok produk
      for (const [productId, qty] of productUsage) {
        const p = (await db.products.get(productId)) as Product;
        if (p.stok < qty) {
          throw new StockError(`Stok produk tidak mencukupi: ${p.nama} (sisa ${p.stok} ${p.satuan}).`);
        }
      }

      // Validasi stok bahan baku
      for (const [materialId, qty] of materialUsage) {
        const m = await db.rawMaterials.get(materialId);
        if (!m) throw new StockError("Bahan baku pada resep tidak ditemukan.");
        if (m.stok < qty) {
          throw new StockError(
            `Stok bahan baku tidak mencukupi. ${m.nama}: butuh ${qty} ${m.satuan}, tersedia ${m.stok} ${m.satuan}.`,
          );
        }
      }

      const subtotal = calculateSaleSubtotal(lines);
      const total = calculateSaleTotal(subtotal, diskon);
      const hpp = calculateCOGS(lines);
      const saleId = newId("sale");

      await db.sales.add({
        id: saleId,
        invoice,
        tanggal: now,
        subtotal,
        diskon: Math.round(diskon),
        total,
        hpp,
        laba: total - hpp,
        metode,
        ...(catatan ? { catatan } : {}),
      });

      for (const line of lines) {
        await db.saleItems.add({
          id: newId("si"),
          saleId,
          productId: line.productId,
          namaProduk: line.nama,
          qty: line.qty,
          harga: line.harga,
          hpp: line.hpp,
          subtotal: line.harga * line.qty,
        });
      }

      for (const [productId, qty] of productUsage) {
        const p = (await db.products.get(productId)) as Product;
        await db.products.update(productId, { stok: p.stok - qty, updatedAt: now });
        await db.stockMovements.add(
          movement({
            itemType: "produk",
            itemId: productId,
            namaItem: p.nama,
            satuan: p.satuan,
            qty: -qty,
            tipe: "Penjualan",
            alasan: invoice,
            refId: saleId,
            tanggal: now,
          }),
        );
      }

      for (const [materialId, qty] of materialUsage) {
        const m = (await db.rawMaterials.get(materialId)) as RawMaterial;
        await db.rawMaterials.update(materialId, { stok: m.stok - qty, updatedAt: now });
        await db.stockMovements.add(
          movement({
            itemType: "bahan",
            itemId: materialId,
            namaItem: m.nama,
            satuan: m.satuan,
            qty: -qty,
            tipe: "Penjualan",
            alasan: `Pemakaian resep ${invoice}`,
            refId: saleId,
            tanggal: now,
          }),
        );
      }

      return invoice;
    },
  );
}

export interface PurchaseLineInput {
  rawMaterialId: string;
  qty: number;
  hargaSatuan: number;
}

export async function createPurchase(params: {
  supplier: string;
  tanggal: number;
  lines: PurchaseLineInput[];
  catatan?: string;
}): Promise<void> {
  const { supplier, tanggal, lines, catatan } = params;
  if (lines.length === 0) throw new StockError("Belum ada bahan yang ditambahkan.");

  await db.transaction(
    "rw",
    [db.rawMaterials, db.purchases, db.purchaseItems, db.stockMovements],
    async () => {
      const purchaseId = newId("pur");
      const total = lines.reduce((s, l) => s + Math.round(l.qty * l.hargaSatuan), 0);
      await db.purchases.add({
        id: purchaseId,
        supplier: supplier || "Tanpa supplier",
        tanggal,
        total,
        ...(catatan ? { catatan } : {}),
      });

      for (const l of lines) {
        const m = await db.rawMaterials.get(l.rawMaterialId);
        if (!m) throw new StockError("Bahan baku tidak ditemukan.");
        await db.purchaseItems.add({
          id: newId("pi"),
          purchaseId,
          rawMaterialId: m.id,
          namaBahan: m.nama,
          qty: l.qty,
          hargaSatuan: Math.round(l.hargaSatuan),
          subtotal: Math.round(l.qty * l.hargaSatuan),
        });
        await db.rawMaterials.update(m.id, {
          stok: m.stok + l.qty,
          hargaBeliTerakhir: Math.round(l.hargaSatuan),
          updatedAt: Date.now(),
        });
        await db.stockMovements.add(
          movement({
            itemType: "bahan",
            itemId: m.id,
            namaItem: m.nama,
            satuan: m.satuan,
            qty: l.qty,
            tipe: "Pembelian",
            alasan: `Pembelian dari ${supplier || "supplier"}`,
            refId: purchaseId,
            tanggal,
          }),
        );
      }
    },
  );
}

export async function adjustStock(params: {
  itemType: "produk" | "bahan";
  itemId: string;
  delta: number;
  alasan: string;
  tipe?: MovementType;
}): Promise<void> {
  const { itemType, itemId, delta, alasan } = params;
  await db.transaction(
    "rw",
    [db.products, db.rawMaterials, db.stockMovements],
    async () => {
      const now = Date.now();
      if (itemType === "produk") {
        const p = await db.products.get(itemId);
        if (!p) throw new StockError("Produk tidak ditemukan.");
        const next = p.stok + delta;
        if (next < 0) throw new StockError("Stok tidak boleh menjadi negatif.");
        await db.products.update(itemId, { stok: next, updatedAt: now });
        await db.stockMovements.add(
          movement({
            itemType,
            itemId,
            namaItem: p.nama,
            satuan: p.satuan,
            qty: delta,
            tipe: params.tipe ?? "Penyesuaian",
            alasan,
          }),
        );
      } else {
        const m = await db.rawMaterials.get(itemId);
        if (!m) throw new StockError("Bahan baku tidak ditemukan.");
        const next = m.stok + delta;
        if (next < 0) throw new StockError("Stok tidak boleh menjadi negatif.");
        await db.rawMaterials.update(itemId, { stok: next, updatedAt: now });
        await db.stockMovements.add(
          movement({
            itemType,
            itemId,
            namaItem: m.nama,
            satuan: m.satuan,
            qty: delta,
            tipe: params.tipe ?? "Penyesuaian",
            alasan,
          }),
        );
      }
    },
  );
}

export async function saveExpense(
  data: Omit<Expense, "id" | "createdAt"> & { id?: string },
): Promise<void> {
  if (data.id) {
    await db.expenses.update(data.id, data);
  } else {
    await db.expenses.add({ ...data, id: newId("exp"), createdAt: Date.now() });
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  await db.transaction("rw", [db.products, db.recipes, db.recipeItems], async () => {
    const recipe = await db.recipes.where("productId").equals(productId).first();
    if (recipe) {
      await db.recipeItems.where("recipeId").equals(recipe.id).delete();
      await db.recipes.delete(recipe.id);
    }
    await db.products.delete(productId);
  });
}
