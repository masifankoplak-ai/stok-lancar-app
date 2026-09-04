import { db, TABLE_NAMES } from "./db";

export interface BackupFile {
  app: "sahabat-umkm";
  version: number;
  exportedAt: string;
  data: Record<string, unknown[]>;
}

export async function exportData(): Promise<BackupFile> {
  const data: Record<string, unknown[]> = {};
  for (const name of TABLE_NAMES) {
    data[name] = await db.table(name).toArray();
  }
  return {
    app: "sahabat-umkm",
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export async function downloadBackup(): Promise<string> {
  const backup = await exportData();
  const namaFile = `sahabat-umkm-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return namaFile;
}

export function validateBackup(raw: unknown): BackupFile {
  if (!raw || typeof raw !== "object") throw new Error("File tidak valid.");
  const obj = raw as Partial<BackupFile>;
  if (obj.app !== "sahabat-umkm") {
    throw new Error("File ini bukan cadangan Sahabat UMKM.");
  }
  if (!obj.data || typeof obj.data !== "object") {
    throw new Error("Isi cadangan tidak ditemukan.");
  }
  for (const name of TABLE_NAMES) {
    const rows = (obj.data as Record<string, unknown>)[name];
    if (rows !== undefined && !Array.isArray(rows)) {
      throw new Error(`Data "${name}" pada cadangan rusak.`);
    }
  }
  return obj as BackupFile;
}

export function summarizeBackup(backup: BackupFile): { name: string; count: number }[] {
  return TABLE_NAMES.map((name) => ({
    name,
    count: (backup.data[name] ?? []).length,
  }));
}

/** mode "ganti" = hapus semua lalu isi ulang. mode "gabung" = tambahkan/timpa per id. */
export async function importData(
  backup: BackupFile,
  mode: "ganti" | "gabung",
): Promise<void> {
  const tables = TABLE_NAMES.map((n) => db.table(n));
  await db.transaction("rw", tables, async () => {
    for (const name of TABLE_NAMES) {
      const rows = (backup.data[name] ?? []) as Record<string, unknown>[];
      const table = db.table(name);
      if (mode === "ganti") await table.clear();
      if (rows.length) await table.bulkPut(rows);
    }
  });
}

export async function clearAllData(): Promise<void> {
  const tables = TABLE_NAMES.map((n) => db.table(n));
  await db.transaction("rw", tables, async () => {
    for (const name of TABLE_NAMES) await db.table(name).clear();
  });
  try {
    localStorage.removeItem("su:onboarded");
    localStorage.removeItem("su:prefs");
  } catch {
    /* abaikan */
  }
}
