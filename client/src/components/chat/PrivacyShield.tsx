import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, Server, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PrivacyShield() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 bg-card/40 border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Shield className="w-24 h-24 text-primary" />
        </div>
        
        <h3 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Data Obfuscation Engine
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded bg-primary/10 text-primary">
                 <EyeOff className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-sm font-medium">PII Redaction</div>
                 <div className="text-xs text-muted-foreground">Emails, Phones, SSN</div>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-xs text-green-500 font-mono">ACTIVE</span>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded bg-primary/10 text-primary">
                 <Server className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-sm font-medium">Local Processing</div>
                 <div className="text-xs text-muted-foreground">Edge computing enabled</div>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-xs text-green-500 font-mono">ACTIVE</span>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card/40 border-secondary/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Globe className="w-24 h-24 text-secondary" />
        </div>

        <h3 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-secondary" />
          Network Traffic
        </h3>

        <div className="h-[140px] flex items-end justify-between gap-1 p-2">
            {[40, 65, 30, 80, 55, 90, 45, 70, 35, 60, 25, 50].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: "10%" }}
                animate={{ height: [`${height}%`, `${height - 10}%`, `${height + 10}%`] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                className="w-full bg-secondary/50 rounded-t-sm"
              />
            ))}
        </div>
        <div className="text-xs font-mono text-center text-muted-foreground mt-2">
            Encrypted Traffic Volume (Real-time)
        </div>
      </Card>
    </div>
  );
}
