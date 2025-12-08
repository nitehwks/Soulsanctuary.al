import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, X, Download, Trash2, Lock, Eye, EyeOff, 
  FileText, Database, Brain, CheckCircle2, AlertTriangle,
  RefreshCw, History, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";

interface PrivacyDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface PrivacySummary {
  dataInventory: {
    conversations: number;
    messages: number;
    contextItems: number;
    moodObservations: number;
  };
  privacySettings: {
    storeContactInfo: boolean;
    privacyLevel: string;
    therapistModeEnabled: boolean;
  } | null;
  consents: Array<{
    consentType: string;
    granted: boolean;
    grantedAt: string | null;
  }>;
  encryptionStatus: {
    messagesEncrypted: boolean;
    contextEncrypted: boolean;
    moodDataEncrypted: boolean;
  };
  retentionPolicy: {
    messages: string;
    context: string;
    moodData: string;
  };
}

const CONSENT_TYPES = [
  { id: "data_collection", label: "Data Collection", description: "Allow collection of conversation data to improve your experience" },
  { id: "mood_tracking", label: "Mood Tracking", description: "Enable emotional pattern analysis for wellness insights" },
  { id: "context_learning", label: "Context Learning", description: "Allow AI to remember facts about you across conversations" },
  { id: "analytics", label: "Usage Analytics", description: "Help improve the platform through anonymous usage data" }
];

export function PrivacyDashboard({ isOpen, onClose, userId }: PrivacyDashboardProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"messages" | "context" | "mood" | "all">("messages");
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const { data: summary, isLoading } = useQuery<PrivacySummary>({
    queryKey: ["/api/privacy/summary", userId],
    queryFn: async () => {
      const res = await fetch(`/api/privacy/summary/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch privacy summary");
      return res.json();
    },
    enabled: isOpen
  });

  const updateConsentMutation = useMutation({
    mutationFn: async ({ consentType, granted }: { consentType: string; granted: boolean }) => {
      const res = await apiRequest("PUT", `/api/privacy/consents/${userId}/${consentType}`, { granted });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy/summary", userId] });
    }
  });

  const exportDataMutation = useMutation({
    mutationFn: async (options: { includeMessages: boolean; includeContext: boolean; includeMoodData: boolean }) => {
      setIsExporting(true);
      setExportProgress(10);
      
      const res = await apiRequest("POST", `/api/privacy/export/${userId}`, options);
      setExportProgress(70);
      
      const data = await res.json();
      setExportProgress(100);
      
      return data;
    },
    onSuccess: (data) => {
      if (data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = `trusthub-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    },
    onError: () => {
      setIsExporting(false);
      setExportProgress(0);
    }
  });

  const deleteDataMutation = useMutation({
    mutationFn: async (options: { deleteMessages: boolean; deleteContext: boolean; deleteMoodData: boolean; deleteAccount: boolean }) => {
      const res = await apiRequest("POST", `/api/privacy/deletion/${userId}`, options);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/privacy/summary", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/context", userId] });
      setDeleteDialogOpen(false);
    }
  });

  const handleDelete = () => {
    const options = {
      deleteMessages: deleteType === "messages" || deleteType === "all",
      deleteContext: deleteType === "context" || deleteType === "all",
      deleteMoodData: deleteType === "mood" || deleteType === "all",
      deleteAccount: deleteType === "all"
    };
    deleteDataMutation.mutate(options);
  };

  const getConsentStatus = (consentType: string) => {
    return summary?.consents.find(c => c.consentType === consentType)?.granted ?? true;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
        data-testid="privacy-dashboard"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-semibold">Privacy Center</h2>
              <p className="text-xs text-muted-foreground">World-class data protection</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-privacy">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start px-4 pt-2 bg-transparent">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="consents" className="text-xs">Consents</TabsTrigger>
            <TabsTrigger value="data" className="text-xs">My Data</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="p-4 space-y-4 m-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium">Encryption</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">AES-256-GCM</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium">PII Protection</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="text-sm font-medium mb-3">Data Inventory</h3>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Conversations</span>
                      <span className="font-medium">{summary?.dataInventory.conversations || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Messages</span>
                      <span className="font-medium">{summary?.dataInventory.messages || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Remembered Facts</span>
                      <span className="font-medium">{summary?.dataInventory.contextItems || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Mood Observations</span>
                      <span className="font-medium">{summary?.dataInventory.moodObservations || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="text-sm font-medium mb-3">Data Retention</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium text-emerald-500">{summary?.retentionPolicy.messages}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Context</span>
                    <span className="font-medium text-emerald-500">{summary?.retentionPolicy.context}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mood Data</span>
                    <span className="font-medium text-emerald-500">{summary?.retentionPolicy.moodData}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Your Data is Protected</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      All sensitive data is encrypted with AES-256-GCM. SSN and credit card numbers are automatically redacted.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="consents" className="p-4 space-y-3 m-0">
              <p className="text-xs text-muted-foreground mb-4">
                Control how your data is collected and used. Changes take effect immediately.
              </p>

              {CONSENT_TYPES.map(consent => (
                <div key={consent.id} className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{consent.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{consent.description}</p>
                    </div>
                    <Switch
                      checked={getConsentStatus(consent.id)}
                      onCheckedChange={(granted) => updateConsentMutation.mutate({ consentType: consent.id, granted })}
                      data-testid={`switch-consent-${consent.id}`}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="data" className="p-4 space-y-4 m-0">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium">Export My Data</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Download a copy of all your data in JSON format.
                </p>
                
                {isExporting && (
                  <div className="mb-3">
                    <Progress value={exportProgress} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">Preparing export...</p>
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={() => exportDataMutation.mutate({ includeMessages: true, includeContext: true, includeMoodData: true })}
                  disabled={isExporting}
                  className="w-full"
                  data-testid="button-export-data"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-2" />
                      Export All Data
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-card border border-destructive/30">
                <div className="flex items-center gap-3 mb-3">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-medium">Delete Data</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Permanently remove your data. This action cannot be undone.
                </p>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => { setDeleteType("messages"); setDeleteDialogOpen(true); }}
                    data-testid="button-delete-messages"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Delete Conversations & Messages
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => { setDeleteType("context"); setDeleteDialogOpen(true); }}
                    data-testid="button-delete-context"
                  >
                    <Database className="h-3 w-3 mr-2" />
                    Delete Remembered Facts
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => { setDeleteType("mood"); setDeleteDialogOpen(true); }}
                    data-testid="button-delete-mood"
                  >
                    <Brain className="h-3 w-3 mr-2" />
                    Delete Mood & Wellness Data
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => { setDeleteType("all"); setDeleteDialogOpen(true); }}
                    data-testid="button-delete-all"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete All My Data
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="p-4 space-y-4 m-0">
              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="text-sm font-medium mb-3">Encryption Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs">Messages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-emerald-500">Encrypted</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs">Context Data</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-emerald-500">Encrypted</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs">Mood Data</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-emerald-500">Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="text-sm font-medium mb-3">PII Protection</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-amber-500" />
                      <span className="text-xs">SSN Numbers</span>
                    </div>
                    <span className="text-xs text-amber-500 font-medium">Auto-Redacted</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-amber-500" />
                      <span className="text-xs">Credit Cards</span>
                    </div>
                    <span className="text-xs text-amber-500 font-medium">Auto-Redacted</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-xs">Phone Numbers</span>
                    </div>
                    <span className="text-xs text-blue-500 font-medium">Stored as Contact</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-xs">Email Addresses</span>
                    </div>
                    <span className="text-xs text-blue-500 font-medium">Stored as Contact</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="text-sm font-medium mb-3">Security Features</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>AES-256-GCM encryption at rest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>TLS 1.3 encryption in transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Tamper-evident audit logging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Automatic data retention policies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>GDPR-compliant data controls</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Data Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteType === "all" 
                  ? "This will permanently delete ALL your data including conversations, remembered facts, mood observations, and account settings. This action cannot be undone."
                  : deleteType === "messages"
                  ? "This will permanently delete all your conversations and messages. This action cannot be undone."
                  : deleteType === "context"
                  ? "This will permanently delete all facts the AI has learned about you. This action cannot be undone."
                  : "This will permanently delete all mood observations and wellness assessments. This action cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteDataMutation.isPending ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
}
