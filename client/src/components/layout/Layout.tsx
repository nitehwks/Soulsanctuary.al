import { useState } from "react";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AppMenu, useAppMenuEvents } from "./AppMenu";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  // Home has its own hamburger in the header; it opens this same menu via
  // the global event. Other pages get a floating trigger on mobile.
  useAppMenuEvents(() => setMenuOpen(true));

  return (
    <div className="flex h-dvh bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative bg-background flex flex-col min-w-0">
        {children}
      </main>

      {location !== "/" && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg md:hidden h-12 w-12"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <AppMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
}
