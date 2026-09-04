import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockStatus } from "@/types";

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3">
        {back ? (
          <Link
            to={back}
            aria-label="Kembali"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground active:bg-muted"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
    </header>
  );
}

export function Section({
  title,
  children,
  action,
  className,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-4", className)}>
      {title ? (
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={cn(
        "card-soft w-full p-4 text-left",
        onClick && "active:scale-[0.995] transition-transform",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "primary" | "warning";
}) {
  return (
    <div
      className={cn(
        "card-soft p-4",
        tone === "primary" && "bg-primary text-primary-foreground border-transparent",
      )}
    >
      <p
        className={cn(
          "text-xs font-medium",
          tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="num-big mt-1 text-2xl font-extrabold">{value}</p>
      {hint ? (
        <p
          className={cn(
            "mt-0.5 text-xs",
            tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: StockStatus }) {
  const tone =
    status === "Habis"
      ? "bg-destructive/10 text-destructive"
      : status === "Menipis"
        ? "bg-warning/20 text-warning-foreground"
        : "bg-success/12 text-success";
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tone)}>
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-soft flex flex-col items-center gap-2 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-4 z-30 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-lg active:scale-95"
    >
      {label}
    </button>
  );
}
