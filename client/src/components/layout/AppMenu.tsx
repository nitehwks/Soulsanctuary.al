import { useEffect } from "react";
import {
  Home as HomeIcon,
  Users,
  BarChart3,
  Activity,
  Sparkles,
  Brain,
  Database,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Global menu events. The app has ONE menu (this component, mounted by
// Layout); pages and panels open it or its sub-panels via these events.
export const OPEN_MENU_EVENT = "soulsanctuary:open-menu";
export const OPEN_KNOWLEDGE_EVENT = "soulsanctuary:open-knowledge";
export const OPEN_STATUS_EVENT = "soulsanctuary:open-status";

export function openAppMenu() {
  window.dispatchEvent(new Event(OPEN_MENU_EVENT));
}

const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "Chat" },
  { href: "/groups", icon: Users, label: "Groups" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard", icon: Activity, label: "Activity" },
  { href: "/addons", icon: Sparkles, label: "Wellness Tools" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [location, navigate] = useLocation();
  const { user, isGuest, logout } = useAuth();

  const close = () => onOpenChange(false);

  // Panels like "What I Know" and "System Status" live on the Home page;
  // navigate there first, then ask Home to open the panel.
  const openHomePanel = (eventName: string) => {
    close();
    if (location !== "/") {
      navigate("/");
      setTimeout(() => window.dispatchEvent(new Event(eventName)), 100);
    } else {
      window.dispatchEvent(new Event(eventName));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="text-left">
              <div className="text-sm font-medium">
                {user?.firstName || user?.lastName
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : user?.email || "User"}
              </div>
              {isGuest && <div className="text-[10px] text-amber-600">Guest Account</div>}
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">User menu and navigation</SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={close}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    isActive && "bg-muted text-foreground"
                  )}
                  data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => openHomePanel(OPEN_KNOWLEDGE_EVENT)}
            data-testid="menu-knowledge"
          >
            <Brain className="h-5 w-5" />
            What I Know About You
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
            onClick={() => openHomePanel(OPEN_STATUS_EVENT)}
            data-testid="menu-system-status"
          >
            <Database className="h-5 w-5" />
            System Status
          </Button>

          <div className="pt-2 border-t border-border mt-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-destructive"
              onClick={() => {
                logout();
                close();
              }}
              data-testid="menu-logout"
            >
              <LogOut className="h-5 w-5" />
              {isGuest ? "Exit Guest Mode" : "Sign Out"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Listens for global open requests; mount once (Layout does this). */
export function useAppMenuEvents(onOpen: () => void) {
  useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener(OPEN_MENU_EVENT, handler);
    return () => window.removeEventListener(OPEN_MENU_EVENT, handler);
  }, [onOpen]);
}
