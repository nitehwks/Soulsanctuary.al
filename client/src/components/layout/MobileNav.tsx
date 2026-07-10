import { Home, Users, BarChart3, Stethoscope, Settings, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", icon: Home, labelKey: "nav.chat" },
  { href: "/groups", icon: Users, labelKey: "nav.groups" },
  { href: "/analytics", icon: BarChart3, labelKey: "nav.analytics" },
  { href: "/clinician", icon: Stethoscope, labelKey: "nav.clinician" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
];

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile hamburger trigger */}
      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg md:hidden h-12 w-12"
        onClick={() => onOpenChange(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl safe-bottom px-0">
          <SheetHeader className="px-4 pb-2 border-b border-border">
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>
          <nav className="grid grid-cols-3 gap-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-4 pb-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
