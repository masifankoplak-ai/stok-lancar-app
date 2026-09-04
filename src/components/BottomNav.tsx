import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Boxes, ShoppingCart, BarChart3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Beranda", icon: Home, match: (p: string) => p === "/" },
  { to: "/stok", label: "Stok", icon: Boxes, match: (p: string) => p.startsWith("/stok") },
  {
    to: "/penjualan",
    label: "Penjualan",
    icon: ShoppingCart,
    match: (p: string) => p.startsWith("/penjualan"),
  },
  {
    to: "/laporan",
    label: "Laporan",
    icon: BarChart3,
    match: (p: string) => p.startsWith("/laporan"),
  },
  {
    to: "/lainnya",
    label: "Lainnya",
    icon: LayoutGrid,
    match: (p: string) =>
      ["/lainnya", "/produk", "/pembelian", "/pengeluaran", "/pengaturan"].some((x) =>
        p.startsWith(x),
      ),
  },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/98 backdrop-blur">
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
