import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, TrendingUp, Brain, Flame, Star, 
  ChevronRight, Lightbulb, Award, Zap, Heart,
  CheckCircle2, Circle, Plus, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  progress: number;
  category: "growth" | "habit" | "mindset" | "performance";
}

interface CoachingHighlightsProps {
  userId?: string;
  onSuggestPrompt?: (prompt: string) => void;
}

const coachingPrompts = [
  { icon: Target, text: "What's the #1 goal you want to achieve?", category: "goal-setting" },
  { icon: Brain, text: "What patterns do you notice in your behavior?", category: "self-awareness" },
  { icon: Flame, text: "What would you do if you couldn't fail?", category: "motivation" },
  { icon: TrendingUp, text: "How can you push beyond your comfort zone today?", category: "growth" },
  { icon: Lightbulb, text: "What's holding you back right now?", category: "breakthrough" },
  { icon: Heart, text: "What does success look like for you?", category: "vision" },
];

const coachingMethods = [
  { name: "Psychoanalytic Insight", description: "Understanding unconscious patterns", icon: Brain },
  { name: "Goal Accountability", description: "Tracking and achieving your goals", icon: Target },
  { name: "Motivation Mapping", description: "Discovering what drives you", icon: Flame },
  { name: "Performance Coaching", description: "Optimizing for results", icon: TrendingUp },
];

export function CoachingHighlights({ userId, onSuggestPrompt }: CoachingHighlightsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [streak, setStreak] = useState(0);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(`coaching-goals-${userId || 'guest'}`);
    if (stored) {
      setGoals(JSON.parse(stored));
    }
    const storedStreak = localStorage.getItem(`coaching-streak-${userId || 'guest'}`);
    if (storedStreak) {
      setStreak(parseInt(storedStreak));
    }
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % coachingPrompts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem(`coaching-goals-${userId || 'guest'}`, JSON.stringify(newGoals));
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      progress: 0,
      category: "growth"
    };
    saveGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setShowAddGoal(false);
  };

  const updateGoalProgress = (goalId: string, increment: number) => {
    const updated = goals.map(g => 
      g.id === goalId 
        ? { ...g, progress: Math.min(100, Math.max(0, g.progress + increment)) }
        : g
    );
    saveGoals(updated);
  };

  const removeGoal = (goalId: string) => {
    saveGoals(goals.filter(g => g.id !== goalId));
  };

  const currentPrompt = coachingPrompts[activePromptIndex];
  const PromptIcon = currentPrompt.icon;

  return (
    <div className="space-y-4 p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-xl p-4 border border-purple-500/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-purple-400" />
          <h3 className="font-heading font-semibold text-purple-300">Coaching Mode Active</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          I'm your performance coach and psychoanalyst. Let's unlock your potential and achieve your goals together.
        </p>
      </motion.div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Coaching Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {coachingMethods.map((method, i) => (
            <motion.div
              key={method.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <method.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">{method.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{method.description}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              Your Goals
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2"
              onClick={() => setShowAddGoal(!showAddGoal)}
              data-testid="button-add-goal"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {showAddGoal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Enter your goal..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                  className="h-8 text-sm"
                  data-testid="input-new-goal"
                />
                <Button size="sm" onClick={addGoal} className="h-8" data-testid="button-save-goal">
                  Add
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {goals.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No goals yet. Add one to start tracking!
            </p>
          ) : (
            goals.map((goal) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium flex items-center gap-2">
                    {goal.progress >= 100 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {goal.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => updateGoalProgress(goal.id, 10)}
                      data-testid={`button-progress-${goal.id}`}
                    >
                      <TrendingUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-destructive/60 hover:text-destructive"
                      onClick={() => removeGoal(goal.id)}
                      data-testid={`button-remove-goal-${goal.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Progress value={goal.progress} className="h-1.5" />
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Coaching Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.button
              key={activePromptIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => onSuggestPrompt?.(currentPrompt.text)}
              className="w-full p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-colors text-left group"
              data-testid="button-coaching-prompt"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <PromptIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{currentPrompt.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                    {currentPrompt.category.replace("-", " ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.button>
          </AnimatePresence>
        </CardContent>
      </Card>

      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
        >
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="text-sm font-medium">{streak} day streak!</span>
          <Star className="h-4 w-4 text-amber-400" />
        </motion.div>
      )}
    </div>
  );
}
