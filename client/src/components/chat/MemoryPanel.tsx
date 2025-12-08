import { motion } from "framer-motion";
import { User, Briefcase, MapPin, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface UserContext {
  id: number;
  category: string;
  value: string;
  confidence: number;
}

const ICON_MAP: Record<string, any> = {
  "Role": Briefcase,
  "Location": MapPin,
  "Interest": Tag,
  "Project": Tag,
  "default": Tag
};

export function MemoryPanel() {
  const [contextData, setContextData] = useState<UserContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await fetch('/api/context/anonymous');
        if (response.ok) {
          const data = await response.json();
          setContextData(data);
        }
      } catch (error) {
        console.error('Failed to load user context:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, []);

  return (
    <Card className="p-4 bg-background border border-border mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <User className="w-3 h-3" />
          Retained Context
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium" data-testid="text-context-count">
          {contextData.length} Facts
        </span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading context...
          </div>
        ) : contextData.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            No context learned yet
          </div>
        ) : (
          contextData.map((item, i) => {
            const Icon = ICON_MAP[item.category] || ICON_MAP.default;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
                data-testid={`context-item-${item.id}`}
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
                    {item.confidence}%
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
         <div className="text-[10px] text-muted-foreground text-center">
            Memory retention active. Facts are categorized automatically.
         </div>
      </div>
    </Card>
  );
}
