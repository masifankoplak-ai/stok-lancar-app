/** LocalStorage hanya untuk preferensi kecil. Data bisnis ada di IndexedDB. */
const KEY_ONBOARDED = "su:onboarded";
const KEY_PREFS = "su:prefs";

export interface Prefs {
  namaUsaha: string;
  namaPemilik: string;
}

const defaultPrefs: Prefs = { namaUsaha: "Usaha Saya", namaPemilik: "" };

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function isOnboarded(): boolean {
  return safeGet(KEY_ONBOARDED) === "1";
}

export function setOnboarded(): void {
  try {
    localStorage.setItem(KEY_ONBOARDED, "1");
  } catch {
    /* abaikan */
  }
}

export function getPrefs(): Prefs {
  const raw = safeGet(KEY_PREFS);
  if (!raw) return defaultPrefs;
  try {
    return { ...defaultPrefs, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return defaultPrefs;
  }
}

export function savePrefs(prefs: Partial<Prefs>): void {
  try {
    localStorage.setItem(KEY_PREFS, JSON.stringify({ ...getPrefs(), ...prefs }));
    window.dispatchEvent(new Event("su:prefs-changed"));
  } catch {
    /* abaikan */
  }
}
