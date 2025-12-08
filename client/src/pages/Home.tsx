import { Layout } from "@/components/layout/Layout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PrivacyShield } from "@/components/chat/PrivacyShield";
import { KnowledgeGraph } from "@/components/dashboard/KnowledgeGraph";
import { MemoryPanel } from "@/components/chat/MemoryPanel";
import { motion } from "framer-motion";
import { ChevronRight, Database, ShieldCheck, Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Layout>
      <div className="flex h-full overflow-hidden bg-background">
        {/* Main Chat Area - Dominant */}
        <div className="flex-1 flex flex-col min-w-0">
            <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm z-10">
                <h1 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                    TrustHub
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-sans font-medium">BETA</span>
                </h1>
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 hover:bg-muted rounded-md"
                >
                    <Activity className="w-4 h-4" />
                </button>
            </div>
            <ChatInterface />
        </div>

        {/* Info Sidebar - Minimized/Off to side */}
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
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">System Vitals</h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">PlanetScale</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Pending Connection"></div>
                        </div>
                        <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium">Obfuscation</span>
                            </div>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Active</span>
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
      </div>
    </Layout>
  );
}
