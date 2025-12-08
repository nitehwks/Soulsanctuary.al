import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, User, Briefcase, MapPin, Heart, Tag, Building, 
  Phone, Mail, ChevronDown, ChevronUp, X, RefreshCw,
  AlertCircle, Info, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface TopicGroup {
  category: string;
  items: Array<{ value: string; confidence: number; sentiment?: string | null }>;
  summary: string;
  keywords: string[];
}

interface KnowledgeData {
  topics: TopicGroup[];
  moodSummary: {
    recentMoods: Array<{ topic: string; mood: string; intensity: number; createdAt: string }>;
    topicsDiscussed: string[];
  };
  totalFacts: number;
  totalMoodObservations: number;
}

const ICON_MAP: Record<string, any> = {
  "Name": User,
  "Role": Briefcase,
  "Location": MapPin,
  "Interest": Heart,
  "Project": Tag,
  "Company": Building,
  "Phone": Phone,
  "Email": Mail,
  "default": Info
};

interface KnowledgePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KnowledgePanel({ isOpen, onClose }: KnowledgePanelProps) {
  const { user } = useAuth();
  const [data, setData] = useState<KnowledgeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  
  const userId = user?.id;

  useEffect(() => {
    if (isOpen && userId) {
      fetchKnowledge();
    }
  }, [isOpen, userId]);

  const fetchKnowledge = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/knowledge/${userId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (category: string) => {
    setExpandedTopic(expandedTopic === category ? null : category);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
        data-testid="knowledge-panel"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="font-semibold">What I Know About You</h2>
              <p className="text-xs text-muted-foreground">Click a topic for more details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchKnowledge}
              disabled={loading}
              data-testid="button-refresh-knowledge"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-knowledge">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {loading && !data ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !data || data.topics.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="font-medium mb-2">No Knowledge Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start chatting and I'll learn facts about you over time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="p-3 bg-purple-500/5 border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-500">{data.totalFacts}</div>
                  <div className="text-xs text-muted-foreground">Facts Known</div>
                </Card>
                <Card className="p-3 bg-pink-500/5 border-pink-500/20">
                  <div className="text-2xl font-bold text-pink-500">{data.totalMoodObservations}</div>
                  <div className="text-xs text-muted-foreground">Mood Observations</div>
                </Card>
              </div>

              {data.topics.map((topic) => {
                const Icon = ICON_MAP[topic.category] || ICON_MAP.default;
                const isExpanded = expandedTopic === topic.category;
                
                return (
                  <motion.div key={topic.category} layout>
                    <Card 
                      className={`cursor-pointer transition-all ${isExpanded ? 'ring-2 ring-purple-500/50' : 'hover:bg-muted/50'}`}
                      onClick={() => toggleTopic(topic.category)}
                      data-testid={`topic-${topic.category.toLowerCase()}`}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-muted">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{topic.category}</div>
                              <div className="text-xs text-muted-foreground">{topic.summary}</div>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-border space-y-2">
                                {topic.items.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex items-start justify-between gap-2 p-2 rounded bg-muted/50"
                                  >
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{item.value}</div>
                                      {item.sentiment && item.sentiment !== 'neutral' && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          Shared with {item.sentiment.replace('_', ' ')} tone
                                        </div>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] shrink-0">
                                      {item.confidence}%
                                    </Badge>
                                  </div>
                                ))}
                                
                                {topic.keywords.length > 0 && (
                                  <div className="pt-2">
                                    <div className="text-xs text-muted-foreground mb-1">Keywords:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {topic.keywords.slice(0, 8).map((kw, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-[10px]">
                                          {kw}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

              {data.moodSummary.topicsDiscussed.length > 0 && (
                <Card className="p-3 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium">Topics We've Discussed</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {data.moodSummary.topicsDiscussed.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            This information is extracted from our conversations and stored securely.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
