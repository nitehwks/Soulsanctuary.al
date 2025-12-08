import { Layout } from "@/components/layout/Layout";
import { KnowledgeGraph } from "@/components/dashboard/KnowledgeGraph";
import { Card } from "@/components/ui/card";
import { Database, Share2, ShieldCheck, Zap } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Knowledge Nodes", value: "1,245,890", icon: Database, color: "text-primary" },
    { label: "Secure Connections", value: "48", icon: Share2, color: "text-secondary" },
    { label: "Threats Blocked", value: "99.9%", icon: ShieldCheck, color: "text-green-500" },
    { label: "Learning Rate", value: "45ms", icon: Zap, color: "text-yellow-500" },
  ];

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
           <h1 className="text-3xl font-heading font-bold text-foreground">Knowledge Dashboard</h1>
           <p className="text-muted-foreground mt-2">Real-time visualization of the AI's learned concepts and system performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
             const Icon = stat.icon;
             return (
               <Card key={stat.label} className="p-6 bg-card/50 border-border/50 backdrop-blur hover:bg-card/80 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground uppercase">{stat.label}</p>
                      <h3 className="text-2xl font-bold mt-2 font-heading">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-lg bg-background/50 ${stat.color}`}>
                       <Icon className="w-5 h-5" />
                    </div>
                  </div>
               </Card>
             );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <KnowledgeGraph />
            
            <Card className="p-6 bg-card/30 border-border/50">
               <h3 className="text-lg font-heading font-bold mb-4">Integration Hub</h3>
               <div className="space-y-4">
                  {[
                    { name: "CRM Database", status: "Connected", latency: "12ms", type: "Read/Write" },
                    { name: "Global Auth Provider", status: "Connected", latency: "45ms", type: "Read Only" },
                    { name: "External API Gateway", status: "Idle", latency: "-", type: "Webhook" },
                    { name: "Legacy System Bridge", status: "Syncing", latency: "120ms", type: "Read Only" },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded bg-background/40 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${node.status === "Connected" ? "bg-green-500" : node.status === "Syncing" ? "bg-yellow-500 animate-pulse" : "bg-muted"}`}></div>
                            <div>
                                <div className="font-medium text-sm">{node.name}</div>
                                <div className="text-xs text-muted-foreground">{node.type}</div>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">{node.latency}</div>
                    </div>
                  ))}
               </div>
            </Card>
        </div>
      </div>
    </Layout>
  );
}
