import { createRootRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useSettingsStore } from "@/stores/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  X,
  Languages,
  GraduationCap,
  Dumbbell,
} from "lucide-react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const introDismissed = useSettingsStore((state) => state.introDismissed);
  const dismissIntro = useSettingsStore((state) => state.dismissIntro);
  const location = useLocation();

  const getTabClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      isActive
        ? "bg-background text-foreground shadow"
        : "text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-red-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-sm">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Spanish Words</h1>
              <p className="text-xs text-muted-foreground">
                Practice makes perfecto
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {!introDismissed && (
          <Card className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">Welcome to Spanish Words!</p>
                  <p className="text-sm text-muted-foreground">
                    Progress through lessons to learn vocabulary step by step.
                    First master Spanish → English, then English → Spanish.
                    Unlock the next lesson by mastering 80% of the current one.
                    Use Practice mode to review words from unlocked lessons.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={dismissIntro}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div className="sticky top-1.5 z-10 bg-background pb-2 -mx-4 px-4">
            <div className="grid w-full grid-cols-3 h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              <Link to="/lessons" className={getTabClass("/lessons")}>
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Lessons</span>
              </Link>
              <Link to="/practice" className={getTabClass("/practice")}>
                <Dumbbell className="w-4 h-4" />
                <span className="hidden sm:inline">Practice</span>
              </Link>
              <Link to="/stats" className={getTabClass("/stats")}>
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </Link>
            </div>
          </div>

          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
