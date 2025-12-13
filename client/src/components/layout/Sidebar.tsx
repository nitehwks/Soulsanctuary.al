import { Home, Shield, Settings, Activity, Users, BarChart3, Stethoscope, Flag, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

export function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const links = [
    { href: "/", icon: Home, labelKey: "nav.chat" },
    { href: "/groups", icon: Users, labelKey: "nav.groups" },
    { href: "/analytics", icon: BarChart3, labelKey: "nav.analytics" },
    { href: "/clinician", icon: Stethoscope, labelKey: "nav.clinician" },
    { href: "/feature-flags", icon: Flag, labelKey: "nav.featureFlags" },
    { href: "/dashboard", icon: Activity, labelKey: "nav.activity" },
    { href: "/settings", icon: Settings, labelKey: "nav.settings" },
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
                <p>{t(link.labelKey)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 flex flex-col items-center pb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://gofund.me/7c08e69b"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl transition-all duration-200 flex items-center justify-center bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg hover:scale-105"
              data-testid="button-donate-gofundme"
            >
              <Heart className="h-5 w-5" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Support the Cause</p>
          </TooltipContent>
        </Tooltip>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:opacity-90">
          TH
        </div>
      </div>
    </div>
  );
}
