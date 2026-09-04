import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Onboarding } from "./Onboarding";
import { isOnboarded } from "@/lib/prefs";

export function AppShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboardedState] = useState(true);

  const refresh = useCallback(() => {
    setOnboardedState(isOnboarded());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("su:reset", refresh);
    return () => window.removeEventListener("su:reset", refresh);
  }, [refresh]);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboardedState(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen max-w-lg pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
