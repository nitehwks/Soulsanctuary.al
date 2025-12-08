import { Layout } from "@/components/layout/Layout";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { PrivacyShield } from "@/components/chat/PrivacyShield";
import { motion } from "framer-motion";
import generatedImage from '@assets/generated_images/secure_ai_network_background.png';

export default function Home() {
  return (
    <Layout>
      <div className="p-6 space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Secure Operations Center
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                SYSTEM ONLINE
            </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0"
        >
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
             <ChatInterface />
          </div>
          
          <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-2">
            <PrivacyShield />
            
            <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden relative aspect-video">
                <img src={generatedImage} alt="Network Visualization" className="w-full h-full object-cover opacity-50 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="font-heading font-bold text-white mb-1">Neural Network Status</h4>
                    <p className="text-xs text-gray-300">Visualizing 1.2M active nodes with real-time encryption protocols enabled.</p>
                </div>
            </div>

            <div className="p-4 rounded-lg bg-sidebar border border-sidebar-border">
                <h4 className="text-sm font-bold text-muted-foreground mb-3 font-mono uppercase">Recent Learnings</h4>
                <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 items-start">
                        <span className="text-primary mt-1">▹</span>
                        <span className="text-foreground/80">Updated user preference context regarding data retention policies.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                        <span className="text-primary mt-1">▹</span>
                        <span className="text-foreground/80">Integrated new security compliance module v4.5.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                        <span className="text-primary mt-1">▹</span>
                        <span className="text-foreground/80">Optimized natural language processing for technical query obfuscation.</span>
                    </li>
                </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
