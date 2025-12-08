import { motion } from "framer-motion";
import { User, Mail, Briefcase, MapPin, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RetainedInfo {
  category: string;
  value: string;
  icon: any;
  confidence: number;
}

const retainedData: RetainedInfo[] = [
  { category: "Role", value: "Software Architect", icon: Briefcase, confidence: 0.98 },
  { category: "Location", value: "San Francisco, CA", icon: MapPin, confidence: 0.85 },
  { category: "Interest", value: "Distributed Systems", icon: Tag, confidence: 0.92 },
  { category: "Project", value: "TrustHub Deployment", icon: Tag, confidence: 0.95 },
];

export function MemoryPanel() {
  return (
    <Card className="p-4 bg-background border border-border mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <User className="w-3 h-3" />
          Retained Context
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          4 Facts
        </span>
      </div>

      <div className="space-y-3">
        {retainedData.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
            >
              <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                  {item.category}
                </div>
                <div className="text-sm font-medium text-foreground truncate">
                  {item.value}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {Math.round(item.confidence * 100)}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
         <div className="text-[10px] text-muted-foreground text-center">
            Memory retention active. Facts are categorized automatically.
         </div>
      </div>
    </Card>
  );
}
