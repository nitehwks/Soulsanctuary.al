import { Home, Shield, Settings, Activity, Users, BarChart3, Stethoscope } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Chat" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/clinician", icon: Stethoscope, label: "Clinician" },
    { href: "/dashboard", icon: Activity, label: "Activity" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-16 border-r border-border bg-card flex flex-col h-screen items-center py-4 z-20 shadow-sm">
      <div className="mb-8 p-2 rounded-xl bg-primary/10 text-primary">
        <Shield className="h-6 w-6" />
      </div>

      <nav className="flex-1 space-y-4 w-full flex flex-col items-center">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{link.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="mt-auto p-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:opacity-90">
          TH
        </div>
      </div>
    </div>
  );
}
