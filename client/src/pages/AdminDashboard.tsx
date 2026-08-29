import { useCallback, useEffect, useState } from "react";
import { Flag, MessageSquareQuote, RefreshCw, ScrollText, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetch } from "@/lib/admin";

interface AuditLogItem { id: number; userId: string; action: string; resourceType: string; resourceId: string | null; details: string | null; ipAddress: string | null; success: boolean | null; errorMessage: string | null; createdAt: string; }
interface FeedbackItem { id: number; userId: string; category: string; rating: number | null; subject: string | null; message: string; status: string; createdAt: string; }
interface ModeratedMessage { id: number; groupId: number | null; anonUserHash: string; message: string; moderationReason: string | null; createdAt: string; }
const FEEDBACK_STATUSES = ["submitted", "reviewed", "resolved"] as const;

function useAdminResource<T>(path: string, deps: unknown[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await (await adminFetch(path)).json() as T[]); }
    catch (e: any) { setError(e?.message || "Failed to load."); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { items, setItems, loading, error, reload };
}

function TabState({ loading, error, empty }: { loading: boolean; error: string | null; empty: boolean }) {
  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  return empty ? <div className="p-4 text-sm text-muted-foreground">Nothing here yet.</div> : null;
}

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  useEffect(() => {
    adminFetch("/api/admin/status").then(() => setAuthorized(true)).catch(() => setAuthorized(false));
  }, []);
  if (authorized === null) return <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">Verifying access...</div>;
  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-background p-6 text-sm text-muted-foreground">You do not have administrator access.</div>;
  return <div className="min-h-screen bg-background"><div className="max-w-3xl mx-auto p-4 space-y-4">
    <h1 className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-500" />Admin Dashboard</h1>
    <Tabs defaultValue="feedback"><TabsList className="grid grid-cols-3 w-full">
      <TabsTrigger value="feedback" className="gap-1"><MessageSquareQuote className="h-3.5 w-3.5" /><span>Feedback</span></TabsTrigger>
      <TabsTrigger value="logs" className="gap-1"><ScrollText className="h-3.5 w-3.5" /><span>Logs</span></TabsTrigger>
      <TabsTrigger value="moderation" className="gap-1"><Flag className="h-3.5 w-3.5" /><span>Moderation</span></TabsTrigger>
    </TabsList><TabsContent value="feedback"><FeedbackTab /></TabsContent><TabsContent value="logs"><LogsTab /></TabsContent><TabsContent value="moderation"><ModerationTab /></TabsContent></Tabs>
  </div></div>;
}

function FeedbackTab() {
  const { items, setItems, loading, error, reload } = useAdminResource<FeedbackItem>("/api/admin/feedback");
  const [busyId, setBusyId] = useState<number | null>(null);
  const setStatus = async (item: FeedbackItem, status: string) => {
    setBusyId(item.id);
    try { await adminFetch(`/api/admin/feedback/${item.id}`, { method: "PATCH", body: { status } }); setItems(x => x.map(f => f.id === item.id ? { ...f, status } : f)); } finally { setBusyId(null); }
  };
  return <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>All User Feedback</CardTitle><CardDescription>Every submission, newest first.</CardDescription></div><Refresh reload={reload} /></CardHeader><CardContent className="space-y-3"><TabState loading={loading} error={error} empty={!items.length} />{items.map(item => <div key={item.id} className="rounded-lg border p-3 space-y-2"><div className="flex justify-between"><Badge variant="outline">{item.category}</Badge><span className="text-xs text-muted-foreground">user {item.userId}</span></div>{item.subject && <div className="text-sm font-medium">{item.subject}</div>}<div className="text-xs whitespace-pre-wrap">{item.message}</div><div className="flex justify-between"><div className="flex gap-1">{FEEDBACK_STATUSES.map(status => <Button key={status} size="sm" variant={item.status === status ? "default" : "outline"} disabled={busyId === item.id} onClick={() => setStatus(item, status)}>{status}</Button>)}</div><span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span></div></div>)}</CardContent></Card>;
}

function LogsTab() {
  const [action, setAction] = useState("");
  const { items, loading, error, reload } = useAdminResource<AuditLogItem>(`/api/admin/logs?limit=200${action ? `&action=${encodeURIComponent(action)}` : ""}`, [action]);
  return <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Audit Logs</CardTitle><CardDescription>Hash-chained security event log.</CardDescription></div><Refresh reload={reload} /></CardHeader><CardContent className="space-y-3"><Input placeholder="Filter by action" value={action} onChange={e => setAction(e.target.value)} /><TabState loading={loading} error={error} empty={!items.length} />{items.map(log => <div key={log.id} className="rounded-lg border p-3 text-xs space-y-1"><Badge variant={log.success === false ? "destructive" : "outline"}>{log.action}</Badge><div>{log.resourceType}{log.resourceId ? ` #${log.resourceId}` : ""} · {log.userId}</div>{log.details && <div className="font-mono break-all text-muted-foreground">{log.details}</div>}</div>)}</CardContent></Card>;
}

function ModerationTab() {
  const { items, setItems, loading, error, reload } = useAdminResource<ModeratedMessage>("/api/admin/moderation");
  const [busyId, setBusyId] = useState<number | null>(null);
  const act = async (id: number, action: "restore" | "delete") => { setBusyId(id); try { await adminFetch(action === "restore" ? `/api/admin/moderation/${id}/restore` : `/api/admin/moderation/${id}`, { method: action === "restore" ? "POST" : "DELETE" }); setItems(x => x.filter(m => m.id !== id)); } finally { setBusyId(null); } };
  return <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Moderation Queue</CardTitle><CardDescription>Group messages flagged by automated moderation.</CardDescription></div><Refresh reload={reload} /></CardHeader><CardContent className="space-y-3"><TabState loading={loading} error={error} empty={!items.length} />{items.map(msg => <div key={msg.id} className="rounded-lg border p-3 space-y-2"><Badge variant="outline">{msg.moderationReason || "flagged"}</Badge><div className="text-xs whitespace-pre-wrap">{msg.message}</div><div className="flex gap-2"><Button variant="outline" size="sm" disabled={busyId === msg.id} onClick={() => act(msg.id, "restore")}><Undo2 className="h-3.5 w-3.5 mr-1" />Restore</Button><Button variant="destructive" size="sm" disabled={busyId === msg.id} onClick={() => act(msg.id, "delete")}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button></div></div>)}</CardContent></Card>;
}

function Refresh({ reload }: { reload: () => void }) { return <Button variant="ghost" size="icon" onClick={reload} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button>; }