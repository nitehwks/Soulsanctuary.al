import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, Check, ChevronRight, Heart, 
  Target, TrendingUp, AlertTriangle, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CoreTrait {
  trait: string;
  description: string;
  strength: "strong" | "moderate" | "emerging";
}

interface RecommendedModality {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  reasoning: string;
}

interface PsychologicalProfile {
  summary: string;
  coreTraits: CoreTrait[];
  motivationalDrivers: string[];
  potentialChallenges: string[];
  recommendedModalities: RecommendedModality[];
  profileQuestion: string;
  ready: boolean;
}

interface PsychologicalProfileCardProps {
  profile: PsychologicalProfile | null;
  isLoading: boolean;
  onConfirmProfile: () => void;
  onDismiss: () => void;
  onSelectModality: (modality: RecommendedModality) => void;
}

const strengthColors = {
  strong: "from-emerald-500 to-green-600",
  moderate: "from-blue-500 to-indigo-600",
  emerging: "from-amber-500 to-orange-600"
};

const strengthLabels = {
  strong: "Strong",
  moderate: "Moderate",
  emerging: "Emerging"
};

export function PsychologicalProfileCard({ 
  profile, 
  isLoading,
  onConfirmProfile,
  onDismiss,
  onSelectModality
}: PsychologicalProfileCardProps) {
  const [step, setStep] = useState<"profile" | "modalities">("profile");
  const [confirmed, setConfirmed] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-violet-500/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
          <p className="text-muted-foreground">Analyzing your psychological profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const handleConfirm = () => {
    setConfirmed(true);
    setStep("modalities");
    onConfirmProfile();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-violet-500/5 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500" />
        
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 h-8 w-8"
            onClick={onDismiss}
            data-testid="button-dismiss-profile"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Your Psychological Profile
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Analysis
                </Badge>
              </CardTitle>
              <CardDescription>
                Based on our conversations, here's what I've learned about you
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {step === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-sm leading-relaxed italic text-muted-foreground">
                    "{profile.profileQuestion}"
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-purple-400" />
                    Core Personality Traits
                  </h4>
                  <div className="grid gap-3">
                    {profile.coreTraits.map((trait, i) => (
                      <motion.div
                        key={trait.trait}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-card/50 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{trait.trait}</span>
                          <Badge 
                            className={cn(
                              "text-xs",
                              trait.strength === "strong" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                              trait.strength === "moderate" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                              trait.strength === "emerging" && "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            )}
                          >
                            {strengthLabels[trait.strength]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{trait.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {profile.motivationalDrivers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-purple-400" />
                      What Drives You
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.motivationalDrivers.map((driver, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.potentialChallenges.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Areas for Growth
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.potentialChallenges.map((challenge, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === "modalities" && (
              <motion.div
                key="modalities"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Profile Confirmed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on your profile, I recommend these therapeutic approaches for our coaching sessions:
                  </p>
                </div>

                <div className="grid gap-3">
                  {profile.recommendedModalities.map((modality, i) => (
                    <motion.button
                      key={modality.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => onSelectModality(modality)}
                      className="w-full p-4 rounded-lg bg-card/50 border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group"
                      data-testid={`button-select-modality-${modality.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{modality.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-purple-400" />
                            <span className="text-xs text-purple-400">{modality.matchScore}% match</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{modality.description}</p>
                      <Progress value={modality.matchScore} className="h-1.5" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {step === "profile" && (
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onDismiss}
              data-testid="button-not-quite-right"
            >
              Not Quite Right
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600"
              onClick={handleConfirm}
              data-testid="button-confirm-profile"
            >
              <Check className="h-4 w-4 mr-2" />
              Yes, That's Me!
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
