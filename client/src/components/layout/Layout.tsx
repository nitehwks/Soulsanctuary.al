import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative bg-background flex flex-col min-w-0">
        {children}
      </main>
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </div>
  );
}
