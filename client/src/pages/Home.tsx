import { Layout } from "@/components/layout/Layout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PrivacyShield } from "@/components/chat/PrivacyShield";
import { KnowledgeGraph } from "@/components/dashboard/KnowledgeGraph";
import { MemoryPanel } from "@/components/chat/MemoryPanel";
import { KnowledgePanel } from "@/components/chat/KnowledgePanel";
import { motion } from "framer-motion";
import { 
  ChevronRight, Database, ShieldCheck, Activity, LogOut, User, 
  MessageSquare, Heart, Brain, CheckCircle2, Sparkles, Menu, Settings
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

type ChatMode = "chat" | "therapist";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileStatus, setShowMobileStatus] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [activeModels, setActiveModels] = useState<string[]>([]);
  const { user, isGuest, logout } = useAuth();

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch('/api/users');
        setDbStatus(response.ok ? "connected" : "disconnected");
      } catch {
        setDbStatus("disconnected");
      }
    };
    checkDbStatus();
    const interval = setInterval(checkDbStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout>
      <div className="flex h-full overflow-hidden bg-background">
        <div className="flex-1 flex flex-col min-w-0">
            <div className="border-b border-border bg-card/50 backdrop-blur-sm z-10">
                <div className="h-14 flex items-center justify-between px-3 md:px-6 gap-2">
                  <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <h1 className="text-base md:text-lg font-heading font-bold text-foreground flex items-center gap-1.5 md:gap-2 shrink-0">
                        <span className="hidden sm:inline">SoulSanctuary AI</span>
                        <span className="sm:hidden">Soul</span>
                        <span className="px-1.5 md:px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] md:text-[10px] font-sans font-medium">BETA</span>
                    </h1>
                    
                    <Tabs value={mode} onValueChange={(v) => setMode(v as ChatMode)} className="ml-1 md:ml-4">
                      <TabsList className="h-9 md:h-10 bg-primary/10 border-2 border-primary/20 p-0.5 md:p-1">
                        <TabsTrigger 
                          value="chat" 
                          className="text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2 gap-1.5 md:gap-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                          data-testid="tab-chat-mode"
                        >
                          <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="hidden xs:inline">Chat</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="therapist" 
                          className="text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2 gap-1.5 md:gap-2 font-semibold data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                          data-testid="tab-therapist-mode"
                        >
                          <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="hidden xs:inline">Care</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="flex items-center gap-1 md:gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 md:h-auto md:w-auto md:px-3 md:py-2"
                          onClick={() => setShowKnowledge(true)}
                          data-testid="button-what-i-know"
                        >
                          <Brain className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline text-xs">What I Know</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View all facts I've learned about you</TooltipContent>
                    </Tooltip>

                    <Link href="/addons" className="hidden sm:block">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs"
                        data-testid="button-addons"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden lg:inline">Wellness Tools</span>
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9 lg:hidden"
                      onClick={() => setShowMobileStatus(true)}
                      data-testid="button-mobile-status"
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setShowMobileMenu(true)}
                      data-testid="button-mobile-menu"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
            </div>
            
            {mode === "therapist" && (
              <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border-b border-amber-500/20 px-3 md:px-6 py-1.5 md:py-2">
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-amber-700 dark:text-amber-400">
                  <Heart className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Pastoral Care Mode - Combining faith, therapy, and coaching to support your journey</span>
                  <span className="sm:hidden">Pastoral Care Mode</span>
                  <span className="ml-auto text-[9px] md:text-[10px] opacity-70 italic hidden md:inline">"Come to me, all you who are weary..." - Matthew 11:28</span>
                </div>
              </div>
            )}
            
            <ChatInterface mode={mode} onModelsUsed={setActiveModels} />
        </div>

        <motion.div 
            initial={false}
            animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
            className={cn(
                "border-l border-border bg-card/50 backdrop-blur-sm h-full flex flex-col overflow-hidden hidden lg:flex",
                !isSidebarOpen && "border-none"
            )}
        >
            <div className="p-4 space-y-6 overflow-y-auto minimal-scroll h-full">
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">System Status</h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">PostgreSQL</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {dbStatus === "checking" ? (
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                              ) : dbStatus === "connected" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  <span className="text-[10px] text-green-500">Connected</span>
                                </>
                              ) : (
                                <span className="text-[10px] text-red-500">Disconnected</span>
                              )}
                            </div>
                        </div>
                        <div className="p-3 bg-background border border-border rounded-lg">
                             <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium">AI Models</span>
                                </div>
                                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">
                                  {activeModels.length > 0 ? 'Active' : 'Ready'}
                                </span>
                            </div>
                            {activeModels.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {activeModels.map((model, i) => (
                                  <span key={i} className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-mono">
                                    {model}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Dual-model system ready</span>
                            )}
                        </div>
                        <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium">Encryption</span>
                            </div>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">AES-256</span>
                        </div>
                        <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {mode === "therapist" ? (
                                  <Heart className="w-4 h-4 text-rose-500" />
                                ) : (
                                  <MessageSquare className="w-4 h-4 text-blue-500" />
                                )}
                                <span className="text-sm font-medium">Mode</span>
                            </div>
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded capitalize",
                              mode === "therapist" 
                                ? "bg-rose-500/10 text-rose-500" 
                                : "bg-blue-500/10 text-blue-500"
                            )}>
                              {mode}
                            </span>
                        </div>
                    </div>
                </div>

                <MemoryPanel />

                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Knowledge Graph</h3>
                    <div className="transform scale-90 -ml-4 origin-top-left">
                        <KnowledgeGraph />
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Privacy Protocols</h3>
                    <div className="scale-90 origin-top-left -ml-2 w-[110%]">
                        <PrivacyShield />
                    </div>
                </div>
            </div>
        </motion.div>
        
        <KnowledgePanel isOpen={showKnowledge} onClose={() => setShowKnowledge(false)} />
        
        <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
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
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : user?.email || 'User'}
                  </div>
                  {isGuest && (
                    <div className="text-[10px] text-amber-600">Guest Account</div>
                  )}
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">User menu and navigation</SheetDescription>
            </SheetHeader>
            <div className="p-4 space-y-2">
              <Link href="/addons" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12" data-testid="mobile-menu-addons">
                  <Sparkles className="h-5 w-5" />
                  Wellness Tools
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  setShowKnowledge(true);
                  setShowMobileMenu(false);
                }}
                data-testid="mobile-menu-knowledge"
              >
                <Brain className="h-5 w-5" />
                What I Know About You
              </Button>
              <Link href="/settings" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12" data-testid="mobile-menu-settings">
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>
              </Link>
              <div className="pt-2 border-t border-border mt-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12 text-destructive"
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  data-testid="mobile-menu-logout"
                >
                  <LogOut className="h-5 w-5" />
                  {isGuest ? "Exit Guest Mode" : "Sign Out"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <Sheet open={showMobileStatus} onOpenChange={setShowMobileStatus}>
          <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>System Status</SheetTitle>
              <SheetDescription>AI system and privacy information</SheetDescription>
            </SheetHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">PostgreSQL</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dbStatus === "checking" ? (
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    ) : dbStatus === "connected" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] text-green-500">Connected</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-red-500">Disconnected</span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-background border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">AI Models</span>
                    </div>
                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">
                      {activeModels.length > 0 ? 'Active' : 'Ready'}
                    </span>
                  </div>
                  {activeModels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {activeModels.map((model, i) => (
                        <span key={i} className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-mono">
                          {model}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Dual-model system ready</span>
                  )}
                </div>
                <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Encryption</span>
                  </div>
                  <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">AES-256</span>
                </div>
                <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {mode === "therapist" ? (
                      <Heart className="w-4 h-4 text-rose-500" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">Mode</span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded capitalize",
                    mode === "therapist" 
                      ? "bg-rose-500/10 text-rose-500" 
                      : "bg-blue-500/10 text-blue-500"
                  )}>
                    {mode}
                  </span>
                </div>
              </div>
              
              <div className="pt-4">
                <MemoryPanel />
              </div>
              
              <div className="pt-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Privacy Protocols</h3>
                <PrivacyShield />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
