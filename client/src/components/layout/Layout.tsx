import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-50"></div>
        <div className="relative z-10 h-full">
            {children}
        </div>
      </main>
    </div>
  );
}
