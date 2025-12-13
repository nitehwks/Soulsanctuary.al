import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Users, MessageSquare, TrendingUp, Activity, Sparkles, Calendar, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalyticsSummary {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  activeUsersToday: number;
  avgMessagesPerConversation: number;
  topCategories: { category: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export default function Analytics() {
  const { data: summary, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/analytics/summary'],
    refetchInterval: 30000,
  });

  const stats = summary ? [
    { 
      label: "Total Users", 
      value: summary.totalUsers.toLocaleString(), 
      icon: Users, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      label: "Conversations", 
      value: summary.totalConversations.toLocaleString(), 
      icon: MessageSquare, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    { 
      label: "Total Messages", 
      value: summary.totalMessages.toLocaleString(), 
      icon: Sparkles, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    { 
      label: "Active Today", 
      value: summary.activeUsersToday.toLocaleString(), 
      icon: Activity, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    { 
      label: "Avg Messages/Conv", 
      value: summary.avgMessagesPerConversation.toString(), 
      icon: TrendingUp, 
      color: "text-rose-500",
      bgColor: "bg-rose-500/10"
    },
  ] : [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getActivityTrend = (data: { date: string; count: number }[]) => {
    if (data.length < 2) return 0;
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last = sorted[sorted.length - 1]?.count || 0;
    const prev = sorted[sorted.length - 2]?.count || 0;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-analytics-title">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Platform usage insights and engagement metrics
          </p>
        </div>

        {isLoading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            </div>
          </>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${stat.bgColor}`}>
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                          <p className="text-xl font-bold" data-testid={`value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Message Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.recentActivity.length > 0 ? (
                      <>
                        {(() => {
                          const trend = getActivityTrend(summary.recentActivity);
                          const TrendIcon = trend > 0 ? ChevronUp : trend < 0 ? ChevronDown : Minus;
                          const trendColor = trend > 0 ? "text-emerald-500" : trend < 0 ? "text-rose-500" : "text-muted-foreground";
                          return (
                            <div className="flex items-center gap-2 mb-4">
                              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                              <span className={`text-sm ${trendColor}`}>
                                {trend > 0 ? '+' : ''}{trend}% from previous day
                              </span>
                            </div>
                          );
                        })()}
                        {[...summary.recentActivity]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((day) => {
                            const maxCount = Math.max(...summary.recentActivity.map(d => d.count), 1);
                            const widthPercent = Math.max((day.count / maxCount) * 100, 5);
                            return (
                              <div key={day.date} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-24 flex-shrink-0">
                                  {formatDate(day.date)}
                                </span>
                                <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-primary h-full rounded-full transition-all"
                                    style={{ width: `${widthPercent}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">
                                  {day.count}
                                </span>
                              </div>
                            );
                          })}
                      </>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        No activity data yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Top Event Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.topCategories.length > 0 ? (
                      summary.topCategories.map((cat, index) => {
                        const maxCount = Math.max(...summary.topCategories.map(c => c.count), 1);
                        const widthPercent = Math.max((cat.count / maxCount) * 100, 5);
                        return (
                          <div key={cat.category} className="flex items-center gap-3">
                            <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-sm flex-1 truncate">{cat.category}</span>
                            <div className="w-24 bg-muted/30 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full transition-all"
                                style={{ width: `${widthPercent}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {cat.count}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        No analytics events recorded yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Engagement Rate</p>
                    <p className="text-lg font-semibold">
                      {summary.totalUsers > 0 
                        ? Math.round((summary.activeUsersToday / summary.totalUsers) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Conversations/User</p>
                    <p className="text-lg font-semibold">
                      {summary.totalUsers > 0 
                        ? (summary.totalConversations / summary.totalUsers).toFixed(1) 
                        : 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Messages/User</p>
                    <p className="text-lg font-semibold">
                      {summary.totalUsers > 0 
                        ? Math.round(summary.totalMessages / summary.totalUsers)
                        : 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Daily Active %</p>
                    <p className="text-lg font-semibold">
                      {summary.totalUsers > 0 
                        ? Math.round((summary.activeUsersToday / summary.totalUsers) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Unable to load analytics data</p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
