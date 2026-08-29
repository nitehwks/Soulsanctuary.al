/** Admin dashboard backed by Clerk-authenticated, role-authorized APIs. */

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  ScrollText,
  MessageSquareQuote,
  Flag,
  RefreshCw,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetch } from "@/lib/admin";

// ---------- data shapes (mirror server responses) ----------

interface AuditLogItem {
  id: number;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  success: boolean | null;
  errorMessage: string | null;
  createdAt: string;
}

interface FeedbackItem {
  id: number;
  userId: string;
  category: string;
  rating: number | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

interface ModeratedMessage {
  id: number;
  groupId: number | null;
  anonUserHash: string;
  message: string;
  moderationReason: string | null;
  createdAt: string;
}

const FEEDBACK_STATUSES = ["submitted", "reviewed", "resolved"] as const;

// ---------- page ----------

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            Admin Dashboard
          </h1>
        </div>

        <Tabs defaultValue="feedback">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="feedback" className="gap-1">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1">
              <ScrollText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-1">
              <Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Moderation</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback">
            <FeedbackTab />
          </TabsContent>
          <TabsContent value="logs">
            <LogsTab />
          </TabsContent>
          <TabsContent value="moderation">
            <ModerationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ---------- shared bits ----------

function useAdminResource<T>(path: string, deps: unknown[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(path);
      setItems((await res.json()) as T[]);
    } catch (e: any) {
      setError(e?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, setItems, loading, error, reload };
}

function TabState({ loading, error, empty }: { loading: boolean; error: string | null; empty: boolean }) {
  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading...</div>;
  if (error) return <div className="text-sm text-red-500 p-4">{error}</div>;
  if (empty) return <div className="text-sm text-muted-foreground p-4">Nothing here yet.</div>;
  return null;
}

// ---------- Feedback tab ----------

function FeedbackTab() {
  const { items, setItems, loading, error, reload } = useAdminResource<FeedbackItem>("/api/admin/feedback");
  const [busyId, setBusyId] = useState<number | null>(null);

  const setStatus = async (item: FeedbackItem, status: string) => {
    setBusyId(item.id);
    try {
      await adminFetch(`/api/admin/feedback/${item.id}`, { method: "PATCH", body: { status } });
      setItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status } : f)));
    } catch {
      // surfaced on next reload
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">All User Feedback</CardTitle>
          <CardDescription>Every submission, newest first. Tap a status to triage.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={reload} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <TabState loading={loading} error={error} empty={items.length === 0} />
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="outline">{item.category}</Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {item.rating ? <span className="text-amber-500">{item.rating}/5</span> : null}
                <span className="font-mono">user {item.userId.slice(0, 12)}...</span>
              </div>
            </div>
            {item.subject ? <div className="text-sm font-medium">{item.subject}</div> : null}
            <div className="text-xs text-muted-foreground whitespace-pre-wrap">{item.message}</div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1">
                {FEEDBACK_STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={item.status === status ? "default" : "outline"}
                    disabled={busyId === item.id}
                    onClick={() => setStatus(item, status)}
                    className="text-xs h-7 px-2"
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Logs tab ----------

function LogsTab() {
  const [actionFilter, setActionFilter] = useState("");
  const path = `/api/admin/logs?limit=200${actionFilter ? `&action=${encodeURIComponent(actionFilter)}` : ""}`;
  const { items, loading, error, reload } = useAdminResource<AuditLogItem>(path, [actionFilter]);

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Audit Logs</CardTitle>
          <CardDescription>Hash-chained security event log, newest first.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={reload} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Filter by action (e.g. feedback_triage)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        />
        <TabState loading={loading} error={error} empty={items.length === 0} />
        {items.map((log) => (
          <div key={log.id} className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant={log.success === false ? "destructive" : "outline"} className="font-mono text-xs">
                {log.action}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {log.resourceType}
              {log.resourceId ? ` #${log.resourceId}` : ""} · {log.userId}
              {log.ipAddress ? ` · ${log.ipAddress}` : ""}
            </div>
            {log.details ? (
              <div className="text-[10px] font-mono text-muted-foreground break-all">{log.details}</div>
            ) : null}
            {log.errorMessage ? (
              <div className="text-xs text-red-500">{log.errorMessage}</div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Moderation tab ----------

function ModerationTab() {
  const { items, setItems, loading, error, reload } = useAdminResource<ModeratedMessage>("/api/admin/moderation");
  const [busyId, setBusyId] = useState<number | null>(null);

  const act = async (id: number, action: "restore" | "delete") => {
    setBusyId(id);
    try {
      if (action === "restore") {
        await adminFetch(`/api/admin/moderation/${id}/restore`, { method: "POST" });
      } else {
        await adminFetch(`/api/admin/moderation/${id}`, { method: "DELETE" });
      }
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // surfaced on next reload
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Moderation Queue</CardTitle>
          <CardDescription>Group messages flagged by automated moderation.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={reload} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <TabState loading={loading} error={error} empty={items.length === 0} />
        {items.map((msg) => (
          <div key={msg.id} className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="outline" className="text-amber-600 border-amber-600/40">
                {msg.moderationReason || "flagged"}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                group {msg.groupId ?? "?"} · {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-xs whitespace-pre-wrap">{msg.message}</div>
            <div className="text-[10px] font-mono text-muted-foreground">
              anon {msg.anonUserHash.slice(0, 16)}...
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={busyId === msg.id} onClick={() => act(msg.id, "restore")}>
                <Undo2 className="h-3.5 w-3.5 mr-1" />
                Restore
              </Button>
              <Button variant="destructive" size="sm" disabled={busyId === msg.id} onClick={() => act(msg.id, "delete")}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
