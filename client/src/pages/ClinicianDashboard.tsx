import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Users, Calendar, ClipboardList, Plus, Play, CheckCircle, 
  Clock, FileText, TrendingUp, UserCircle, Stethoscope
} from "lucide-react";
import type { ClinicianSession } from "@shared/schema";

export default function ClinicianDashboard() {
  const { toast } = useToast();
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    anonPatientHash: "",
    sessionType: "ad_hoc",
    sessionNotes: ""
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<ClinicianSession[]>({
    queryKey: ['/api/clinician/sessions']
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    patientCount: number;
  }>({
    queryKey: ['/api/clinician/stats']
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: typeof newSession) => {
      return await apiRequest('POST', '/api/clinician/sessions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinician/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clinician/stats'] });
      setIsNewSessionOpen(false);
      setNewSession({ anonPatientHash: "", sessionType: "ad_hoc", sessionNotes: "" });
      toast({ title: "Session created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create session", description: error.message, variant: "destructive" });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<ClinicianSession> }) => {
      return await apiRequest('PATCH', `/api/clinician/sessions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinician/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clinician/stats'] });
      toast({ title: "Session updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update session", description: error.message, variant: "destructive" });
    }
  });

  const handleStartSession = (id: number) => {
    updateSessionMutation.mutate({ 
      id, 
      updates: { status: 'in_progress', startedAt: new Date() } 
    });
  };

  const handleCompleteSession = (id: number) => {
    updateSessionMutation.mutate({ 
      id, 
      updates: { status: 'completed', endedAt: new Date() } 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600 border-blue-300"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-green-500"><Play className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-clinician-title">
                <Stethoscope className="h-6 w-6 text-primary" />
                Clinician Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage patient sessions and track outcomes</p>
            </div>
            
            <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-session">
                  <Plus className="w-4 h-4 mr-2" />
                  New Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                  <DialogDescription>Schedule a new patient session</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient Identifier</Label>
                    <Input
                      id="patientId"
                      placeholder="Anonymous patient hash or ID"
                      value={newSession.anonPatientHash}
                      onChange={(e) => setNewSession(prev => ({ ...prev, anonPatientHash: e.target.value }))}
                      data-testid="input-patient-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select 
                      value={newSession.sessionType} 
                      onValueChange={(v) => setNewSession(prev => ({ ...prev, sessionType: v }))}
                    >
                      <SelectTrigger data-testid="select-session-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ad_hoc">Ad Hoc</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="intake">Intake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Initial Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Session notes..."
                      value={newSession.sessionNotes}
                      onChange={(e) => setNewSession(prev => ({ ...prev, sessionNotes: e.target.value }))}
                      data-testid="input-session-notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewSessionOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => createSessionMutation.mutate(newSession)}
                    disabled={!newSession.anonPatientHash || createSessionMutation.isPending}
                    data-testid="button-create-session"
                  >
                    {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-sessions">
                  {statsLoading ? "..." : stats?.totalSessions ?? 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Play className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-active-sessions">
                  {statsLoading ? "..." : stats?.activeSessions ?? 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-completed-sessions">
                  {statsLoading ? "..." : stats?.completedSessions ?? 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Patients</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="text-patient-count">
                  {statsLoading ? "..." : stats?.patientCount ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sessions
              </CardTitle>
              <CardDescription>View and manage your patient sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <UserCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No sessions yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Create your first session to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`card-session-${session.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <UserCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Patient: {session.anonPatientHash.slice(0, 8)}...</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="capitalize">{session.sessionType?.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(session.status || 'scheduled')}
                        
                        {session.status === 'scheduled' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartSession(session.id)}
                            disabled={updateSessionMutation.isPending}
                            data-testid={`button-start-session-${session.id}`}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {session.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCompleteSession(session.id)}
                            disabled={updateSessionMutation.isPending}
                            data-testid={`button-complete-session-${session.id}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        
                        {session.sessionNotes && (
                          <Button size="icon" variant="ghost">
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
