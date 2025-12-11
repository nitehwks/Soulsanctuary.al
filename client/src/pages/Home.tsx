import { Layout } from "@/components/layout/Layout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PrivacyShield } from "@/components/chat/PrivacyShield";
import { KnowledgeGraph } from "@/components/dashboard/KnowledgeGraph";
import { MemoryPanel } from "@/components/chat/MemoryPanel";
import { KnowledgePanel } from "@/components/chat/KnowledgePanel";
import { motion } from "framer-motion";
import { 
  ChevronRight, Database, ShieldCheck, Activity, LogOut, User, 
  MessageSquare, Heart, Brain, CheckCircle2, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ChatMode = "chat" | "therapist";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "checking">("checking");
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
            <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                  <h1 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                      SoulSanctuary AI
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-sans font-medium">BETA</span>
                  </h1>
                  
                  <Tabs value={mode} onValueChange={(v) => setMode(v as ChatMode)} className="ml-4">
                    <TabsList className="h-10 bg-primary/10 border-2 border-primary/20 p-1">
                      <TabsTrigger 
                        value="chat" 
                        className="text-sm px-4 py-2 gap-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        data-testid="tab-chat-mode"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger 
                        value="therapist" 
                        className="text-sm px-4 py-2 gap-2 font-semibold data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        data-testid="tab-therapist-mode"
                      >
                        <Heart className="h-4 w-4" />
                        Therapist
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs"
                        onClick={() => setShowKnowledge(true)}
                        data-testid="button-what-i-know"
                      >
                        <Brain className="h-4 w-4" />
                        What do you know about me?
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View all facts I've learned about you</TooltipContent>
                  </Tooltip>

                  <Link href="/addons">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-xs"
                      data-testid="button-addons"
                    >
                      <Sparkles className="h-4 w-4" />
                      Wellness Tools
                    </Button>
                  </Link>
                  
                  {user && (
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {user.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                        <span data-testid="text-current-user">
                          {user.firstName || user.lastName 
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : user.email || 'User'}
                        </span>
                        {isGuest && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                            Guest
                          </span>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={handleLogout}
                            data-testid="button-logout"
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isGuest ? "Exit Guest Mode" : "Sign Out"}</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 hover:bg-muted rounded-md"
                  >
                      <Activity className="w-4 h-4" />
                  </button>
                </div>
            </div>
            
            {mode === "therapist" && (
              <div className="bg-gradient-to-r from-rose-500/10 to-purple-500/10 border-b border-rose-500/20 px-6 py-2">
                <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <Heart className="h-3.5 w-3.5" />
                  <span>Therapist mode active - I'll track emotional patterns and provide supportive responses</span>
                </div>
              </div>
            )}
            
            <ChatInterface mode={mode} />
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
                        <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium">Dolphin AI</span>
                            </div>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Active</span>
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
      </div>
    </Layout>
  );
}
