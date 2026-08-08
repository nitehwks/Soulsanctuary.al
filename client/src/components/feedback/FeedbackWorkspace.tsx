import { useEffect, useState } from "react";
import { MessageSquareQuote, Sparkles, Bug, AlertTriangle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type FeedbackCategory = "feature" | "bug" | "coaching" | "general";

interface FeedbackItem {
  id: number;
  userId: string;
  category: FeedbackCategory;
  rating: number | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const CATEGORY_META: Record<
  FeedbackCategory,
  { label: string; icon: typeof Sparkles; color: string }
> = {
  feature: { label: "Feature Request", icon: Sparkles, color: "text-purple-500" },
  bug: { label: "Bug Report", icon: Bug, color: "text-red-500" },
  coaching: { label: "Coaching/Care", icon: Star, color: "text-amber-500" },
  general: { label: "General", icon: MessageSquareQuote, color: "text-blue-500" },
};

export function FeedbackWorkspace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupContact, setSetupContact] = useState<{ email: string; phone: string }>({
    email: "",
    phone: "",
  });
  const [setupStoreContact, setSetupStoreContact] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [rating, setRating] = useState<number>(5);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const loadFeedback = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("GET", `/api/feedback?userId=${encodeURIComponent(user.id)}`);
      const data = (await res.json()) as FeedbackItem[];
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load feedback history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [user?.id]);

  useEffect(() => {
    const loadContactSetup = async () => {
      if (!user?.id) return;

      setSetupLoading(true);
      try {
        const res = await apiRequest("GET", "/api/setup/contact");
        const data = (await res.json()) as { email?: string | null; phone?: string | null; storeContactInfo?: boolean };
        setSetupContact({
          email: data.email || user.email || "",
          phone: data.phone || "",
        });
        setSetupStoreContact(data.storeContactInfo ?? true);
      } catch {
        setSetupContact({
          email: user.email || "",
          phone: "",
        });
        setSetupStoreContact(true);
      } finally {
        setSetupLoading(false);
      }
    };

    loadContactSetup();
  }, [user?.id, user?.email]);

  const saveSetupContact = async () => {
    if (!user?.id) return;

    setSavingSetup(true);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/setup/contact", {
        email: setupContact.email.trim() || null,
        phone: setupContact.phone.trim() || null,
      });
      const data = (await res.json()) as { email?: string | null; phone?: string | null; storeContactInfo?: boolean };
      setSetupContact({
        email: data.email || setupContact.email,
        phone: data.phone || setupContact.phone,
      });
      setSetupStoreContact(data.storeContactInfo ?? true);
      toast({
        title: "Setup saved",
        description: "Your contact details will be reused automatically.",
      });
    } catch (e: any) {
      setError(e?.message || "Failed to save setup contact information.");
    } finally {
      setSavingSetup(false);
    }
  };

  const hasSetupContact = Boolean(setupContact.email.trim() || setupContact.phone.trim());

  const clearSetupContact = async () => {
    if (!user?.id) return;

    setSavingSetup(true);
    setError(null);
    try {
      await apiRequest("DELETE", "/api/setup/contact");
      setSetupContact({ email: user.email || "", phone: "" });
      setSetupStoreContact(false);
      toast({
        title: "Contact info removed",
        description: "You can keep using Feedback, and we’ll ask again next time if needed.",
      });
    } catch (e: any) {
      setError(e?.message || "Failed to clear setup contact information.");
    } finally {
      setSavingSetup(false);
    }
  };

  const submitFeedback = async () => {
    if (!user?.id || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/feedback", {
        userId: user.id,
        category,
        rating,
        subject: subject.trim() || null,
        message: message.trim(),
      });
      const created = (await res.json()) as FeedbackItem;
      setItems((prev) => [created, ...prev]);
      setSubject("");
      setMessage("");
      setCategory("general");
      setRating(5);
    } catch (e: any) {
      setError(e?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto p-4 md:p-6 bg-background">
      <div className="max-w-4xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {!setupLoading && (!hasSetupContact || !setupStoreContact) ? (
          <Card className="xl:col-span-3 bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Setup
              </CardTitle>
              <CardDescription>
                Add your email or phone once. We’ll reuse it automatically for feedback, and you can change or delete it anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="email"
                placeholder="Email address"
                value={setupContact.email}
                onChange={(e) => setSetupContact((prev) => ({ ...prev, email: e.target.value }))}
                data-testid="setup-contact-email"
              />
              <Input
                type="tel"
                placeholder="Phone number (optional)"
                value={setupContact.phone}
                onChange={(e) => setSetupContact((prev) => ({ ...prev, phone: e.target.value }))}
                data-testid="setup-contact-phone"
              />
              <div className="md:col-span-2 flex justify-end">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={clearSetupContact} disabled={savingSetup} data-testid="setup-contact-opt-out">
                    {savingSetup ? "Working..." : "Continue without sharing"}
                  </Button>
                  <Button onClick={saveSetupContact} disabled={savingSetup} data-testid="setup-contact-save">
                    {savingSetup ? "Saving..." : "Save and Continue"}
                  </Button>
                </div>
              </div>
              {hasSetupContact ? (
                <div className="md:col-span-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <span>This information is editable and deletable at any time.</span>
                  <Button variant="ghost" size="sm" onClick={clearSetupContact} disabled={savingSetup} data-testid="setup-contact-delete">
                    Delete saved info
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card className="xl:col-span-2 bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
              Send Feedback
            </CardTitle>
            <CardDescription>
              Help improve SoulSanctuary. Your feedback is tracked and routed to the product queue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_META) as FeedbackCategory[]).map((c) => {
                const Icon = CATEGORY_META[c].icon;
                return (
                  <Button
                    key={c}
                    type="button"
                    variant={category === c ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(c)}
                    className="gap-1.5"
                    data-testid={`feedback-category-${c}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {CATEGORY_META[c].label}
                  </Button>
                );
              })}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={value <= rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRating(value)}
                    data-testid={`feedback-rating-${value}`}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <Input
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              data-testid="feedback-subject"
            />

            <Textarea
              placeholder="Tell us what worked, what didn't, and what you'd like next..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              data-testid="feedback-message"
            />

            {error && (
              <div className="text-sm text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {!hasSetupContact ? (
                <span className="text-xs text-muted-foreground sm:mr-auto">
                  Add setup contact info above for a fully seamless feedback flow.
                </span>
              ) : null}
              <Button
                onClick={submitFeedback}
                disabled={submitting || !message.trim()}
                data-testid="feedback-submit"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Recent Feedback</CardTitle>
            <CardDescription>Your latest submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[34rem] overflow-auto">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading feedback history...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground">No feedback submitted yet.</div>
            ) : (
              items.map((item) => {
                const meta = CATEGORY_META[item.category] || CATEGORY_META.general;
                const Icon = meta.icon;
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Icon className={`h-3 w-3 ${meta.color}`} />
                        {meta.label}
                      </Badge>
                      {item.rating ? (
                        <span className="text-xs text-amber-500">{item.rating}/5</span>
                      ) : null}
                    </div>
                    {item.subject ? <div className="text-sm font-medium">{item.subject}</div> : null}
                    <div className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                      {item.message}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
