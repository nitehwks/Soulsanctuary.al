import { Home, Shield, Database, Book, Settings, Activity } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Secure Chat" },
    { href: "/dashboard", icon: Activity, label: "Knowledge Graph" },
    { href: "/settings", icon: Settings, label: "Privacy Controls" },
    { href: "/docs", icon: Book, label: "Documentation" },
  ];

  return (
    <div className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-primary font-heading font-bold text-xl">
          <Shield className="h-6 w-6" />
          <span>SecureAI Nexus</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground font-mono">
          System Status: <span className="text-green-500">SECURE</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent/50 p-4 rounded-md border border-sidebar-border">
          <div className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">
            Connected Nodes
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-foreground">CRM System</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse delay-75"></div>
              <span className="text-foreground">Email Server</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="text-foreground">Analytics DB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
