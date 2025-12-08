import { useState, useEffect } from "react";
import { Heart, TrendingUp, AlertCircle, Sparkles, RefreshCw, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodObservation {
  id: number;
  topic: string;
  mood: string;
  attitude: string;
  intensity: number;
  observation: string;
  createdAt: string;
}

interface WellnessAssessment {
  id: number;
  overallMood: string;
  stressLevel: number;
  patterns: string[] | null;
  concerns: string[] | null;
  positives: string[] | null;
  advice: string | null;
  createdAt: string;
}

interface UserPreferences {
  therapistModeEnabled: boolean;
  storeContactInfo: boolean;
  privacyLevel: string;
}

interface WellnessPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function WellnessPanel({ isOpen, onClose, userId }: WellnessPanelProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [moods, setMoods] = useState<MoodObservation[]>([]);
  const [assessment, setAssessment] = useState<WellnessAssessment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'settings'>('insights');

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
      fetchMoods();
      fetchAssessment();
    }
  }, [isOpen, userId]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`/api/preferences/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const fetchMoods = async () => {
    try {
      const res = await fetch(`/api/mood/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMoods(data);
      }
    } catch (error) {
      console.error('Failed to fetch moods:', error);
    }
  };

  const fetchAssessment = async () => {
    try {
      const res = await fetch(`/api/wellness/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
    }
  };

  const toggleTherapistMode = async () => {
    if (!preferences) return;
    
    try {
      const res = await fetch(`/api/preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preferences,
          therapistModeEnabled: !preferences.therapistModeEnabled
        })
      });
      
      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const generateAssessment = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/wellness/${userId}/generate`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (error) {
      console.error('Failed to generate assessment:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getMoodColor = (mood: string): string => {
    const colors: Record<string, string> = {
      happy: 'bg-green-500/20 text-green-400',
      ecstatic: 'bg-green-400/20 text-green-300',
      calm: 'bg-blue-400/20 text-blue-300',
      hopeful: 'bg-cyan-400/20 text-cyan-300',
      content: 'bg-teal-400/20 text-teal-300',
      neutral: 'bg-gray-400/20 text-gray-300',
      confused: 'bg-yellow-400/20 text-yellow-300',
      sad: 'bg-blue-600/20 text-blue-400',
      deeply_sad: 'bg-indigo-600/20 text-indigo-400',
      devastated: 'bg-purple-600/20 text-purple-400',
      anxious: 'bg-orange-500/20 text-orange-400',
      panic: 'bg-red-500/20 text-red-400',
      frustrated: 'bg-amber-500/20 text-amber-400',
      angry: 'bg-red-600/20 text-red-400',
      exhausted: 'bg-slate-500/20 text-slate-400',
      overwhelmed: 'bg-rose-500/20 text-rose-400',
      distressed: 'bg-pink-500/20 text-pink-400',
    };
    return colors[mood] || 'bg-gray-400/20 text-gray-300';
  };

  const getOverallMoodEmoji = (mood: string): string => {
    const emojis: Record<string, string> = {
      positive: '😊',
      stable: '😌',
      mixed: '😐',
      struggling: '😔',
      unknown: '🤔'
    };
    return emojis[mood] || '🤔';
  };

  const getStressLevelColor = (level: number): string => {
    if (level <= 3) return 'text-green-400';
    if (level <= 5) return 'text-yellow-400';
    if (level <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="w-80 h-full bg-card border-l border-border flex flex-col"
        data-testid="wellness-panel"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            Wellness
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-wellness">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex border-b border-border">
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === 'insights' 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('insights')}
            data-testid="tab-insights"
          >
            Insights
          </button>
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === 'settings' 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('settings')}
            data-testid="tab-settings"
          >
            <Settings className="h-4 w-4 inline mr-1" />
            Settings
          </button>
        </div>

        <ScrollArea className="flex-1">
          {activeTab === 'settings' ? (
            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="therapist-mode" className="text-sm font-medium">
                      Therapist Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Track mood patterns and receive supportive guidance
                    </p>
                  </div>
                  <Switch
                    id="therapist-mode"
                    checked={preferences?.therapistModeEnabled ?? false}
                    onCheckedChange={toggleTherapistMode}
                    data-testid="switch-therapist-mode"
                  />
                </div>

                {preferences?.therapistModeEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20"
                  >
                    <p className="text-xs text-rose-300">
                      Therapist mode is active. I'll track your emotional patterns across conversations and offer gentle support when appropriate.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {!preferences?.therapistModeEnabled ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Therapist mode is disabled
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Enable it in Settings to track your emotional wellness
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('settings')}
                    data-testid="button-enable-therapist"
                  >
                    Enable Therapist Mode
                  </Button>
                </div>
              ) : (
                <>
                  {assessment && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Current State</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateAssessment}
                          disabled={isGenerating}
                          data-testid="button-refresh-assessment"
                        >
                          <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        </Button>
                      </div>

                      <div className="p-3 bg-card/50 rounded-lg border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overall Mood</span>
                          <span className="text-lg" data-testid="text-overall-mood">
                            {getOverallMoodEmoji(assessment.overallMood)} {assessment.overallMood}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Stress Level</span>
                          <span className={cn("font-mono", getStressLevelColor(assessment.stressLevel))} data-testid="text-stress-level">
                            {assessment.stressLevel}/10
                          </span>
                        </div>
                      </div>

                      {assessment.patterns && assessment.patterns.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Patterns
                          </h4>
                          {assessment.patterns.map((pattern, i) => (
                            <p key={i} className="text-xs pl-4" data-testid={`text-pattern-${i}`}>
                              {pattern}
                            </p>
                          ))}
                        </div>
                      )}

                      {assessment.concerns && assessment.concerns.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-orange-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Areas to Watch
                          </h4>
                          {assessment.concerns.map((concern, i) => (
                            <p key={i} className="text-xs pl-4 text-orange-300/80" data-testid={`text-concern-${i}`}>
                              {concern}
                            </p>
                          ))}
                        </div>
                      )}

                      {assessment.positives && assessment.positives.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-green-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Positives
                          </h4>
                          {assessment.positives.map((positive, i) => (
                            <p key={i} className="text-xs pl-4 text-green-300/80" data-testid={`text-positive-${i}`}>
                              {positive}
                            </p>
                          ))}
                        </div>
                      )}

                      {assessment.advice && (
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <h4 className="text-xs font-medium text-primary mb-1">Gentle Guidance</h4>
                          <p className="text-xs text-muted-foreground" data-testid="text-advice">
                            {assessment.advice}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!assessment && moods.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        No mood data yet. Start chatting to build your wellness profile.
                      </p>
                    </div>
                  )}

                  {moods.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Recent Observations</h3>
                      <div className="space-y-2">
                        {moods.slice(0, 10).map((mood) => (
                          <div 
                            key={mood.id}
                            className="p-2 rounded-lg bg-card/30 border border-border/50"
                            data-testid={`mood-observation-${mood.id}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                getMoodColor(mood.mood)
                              )}>
                                {mood.mood}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {mood.topic}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {mood.intensity}/10
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {mood.observation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {!assessment && (
                        <Button
                          className="w-full"
                          variant="outline"
                          size="sm"
                          onClick={generateAssessment}
                          disabled={isGenerating}
                          data-testid="button-generate-assessment"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Wellness Report
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}
