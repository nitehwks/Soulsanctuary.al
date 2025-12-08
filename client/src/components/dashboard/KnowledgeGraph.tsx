import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Card } from "@/components/ui/card";

const data = [
  { subject: 'Security', A: 120, B: 110, fullMark: 150 },
  { subject: 'Privacy', A: 98, B: 130, fullMark: 150 },
  { subject: 'Knowledge', A: 86, B: 130, fullMark: 150 },
  { subject: 'Speed', A: 99, B: 100, fullMark: 150 },
  { subject: 'Accuracy', A: 85, B: 90, fullMark: 150 },
  { subject: 'Context', A: 65, B: 85, fullMark: 150 },
];

export function KnowledgeGraph() {
  return (
    <Card className="p-6 h-[400px] flex flex-col bg-card/30 border-border/50">
      <h3 className="text-lg font-heading font-bold mb-4">System Proficiency Metrics</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Current Session"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
            <Radar
              name="Global Average"
              dataKey="B"
              stroke="hsl(var(--secondary))"
              fill="hsl(var(--secondary))"
              fillOpacity={0.3}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
