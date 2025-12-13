import { Card } from "@/components/ui/card";
import { Shield, Lock, Brain, Zap, Target, Users } from "lucide-react";

const metrics = [
  { label: 'Security', value: 80, icon: Shield, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
  { label: 'Privacy', value: 65, icon: Lock, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  { label: 'Knowledge', value: 57, icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  { label: 'Speed', value: 66, icon: Zap, color: 'text-amber-500', bgColor: 'bg-amber-500' },
  { label: 'Accuracy', value: 57, icon: Target, color: 'text-rose-500', bgColor: 'bg-rose-500' },
  { label: 'Context', value: 43, icon: Users, color: 'text-cyan-500', bgColor: 'bg-cyan-500' },
];

export function KnowledgeGraph() {
  return (
    <Card className="p-6 flex flex-col bg-card/30 border-border/50">
      <h3 className="text-lg font-heading font-bold mb-4">System Proficiency Metrics</h3>
      <div className="flex-1 space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-sm">{metric.label}</span>
                </div>
                <span className="text-sm font-medium">{metric.value}%</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${metric.bgColor} rounded-full transition-all duration-500`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Current Session</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span>Global Average</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
