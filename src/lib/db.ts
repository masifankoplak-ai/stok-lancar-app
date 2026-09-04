import Dexie, { type Table } from "dexie";
import type {
  Product,
  RawMaterial,
  Recipe,
  RecipeItem,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  StockMovement,
  Expense,
  Setting,
} from "@/types";

export class SahabatUmkmDB extends Dexie {
  products!: Table<Product, string>;
  rawMaterials!: Table<RawMaterial, string>;
  recipes!: Table<Recipe, string>;
  recipeItems!: Table<RecipeItem, string>;
  sales!: Table<Sale, string>;
  saleItems!: Table<SaleItem, string>;
  purchases!: Table<Purchase, string>;
  purchaseItems!: Table<PurchaseItem, string>;
  stockMovements!: Table<StockMovement, string>;
  expenses!: Table<Expense, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("sahabat-umkm");
    this.version(1).stores({
      products: "id, nama, sku, updatedAt",
      rawMaterials: "id, nama, updatedAt",
      recipes: "id, productId",
      recipeItems: "id, recipeId, rawMaterialId",
      sales: "id, invoice, tanggal",
      saleItems: "id, saleId, productId",
      purchases: "id, tanggal, supplier",
      purchaseItems: "id, purchaseId, rawMaterialId",
      stockMovements: "id, tanggal, itemId, itemType",
      expenses: "id, tanggal, kategori",
      settings: "key",
    });
  }
}

export const db = new SahabatUmkmDB();

export const TABLE_NAMES = [
  "products",
  "rawMaterials",
  "recipes",
  "recipeItems",
  "sales",
  "saleItems",
  "purchases",
  "purchaseItems",
  "stockMovements",
  "expenses",
  "settings",
] as const;

export function newId(prefix = "id"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${rnd}`;
}

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}
