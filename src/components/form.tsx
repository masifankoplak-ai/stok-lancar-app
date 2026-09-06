import type {
  ReactNode,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

const baseInput =
  "mt-1 h-12 w-full rounded-xl border border-input bg-background px-3 text-foreground outline-none focus:border-primary";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseInput, className)} />;
}

export function SelectInput({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(baseInput, className)}>
      {children}
    </select>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: {
  variant?: "primary" | "outline" | "ghost" | "danger";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const tone =
    variant === "primary"
      ? "bg-primary text-primary-foreground"
      : variant === "danger"
        ? "bg-destructive text-destructive-foreground"
        : variant === "outline"
          ? "border border-input bg-background text-foreground"
          : "text-foreground";
  return (
    <button
      {...props}
      className={cn(
        "flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold active:scale-[0.98] disabled:opacity-50",
        tone,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  if (!children) return null;
  return (
    <p
      className={cn(
        "rounded-xl px-3 py-2 text-xs font-semibold",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      {children}
    </p>
  );
}
