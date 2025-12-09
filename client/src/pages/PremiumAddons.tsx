import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Heart, 
  Leaf, 
  Sparkles, 
  Target, 
  HandHeart,
  Wind,
  BookOpen,
  Clock,
  Star,
  Lock,
  Check,
  ArrowLeft,
  Zap,
  Shield,
  Users,
  Crown,
  Rocket,
  TrendingUp,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";

interface TherapyModule {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  isPremium: boolean;
  price: number;
  features: string[];
  scientificBasis: string;
  exerciseCount: number;
}

const therapyModules: TherapyModule[] = [
  {
    id: "dbt",
    name: "Dialectical Behavior Therapy (DBT)",
    description: "Evidence-based skills for emotional regulation, distress tolerance, and interpersonal effectiveness.",
    longDescription: "DBT was developed by Dr. Marsha Linehan and combines cognitive-behavioral techniques with mindfulness concepts. It's particularly effective for emotional dysregulation, relationship difficulties, and impulsive behaviors. Our module includes the four core skill areas: Mindfulness, Distress Tolerance, Emotion Regulation, and Interpersonal Effectiveness.",
    category: "dbt",
    icon: <Target className="w-8 h-8" />,
    color: "from-violet-500 to-purple-600",
    isPremium: true,
    price: 999,
    features: [
      "TIPP Skills for crisis moments",
      "DEAR MAN communication technique",
      "Radical acceptance exercises",
      "Emotion regulation worksheets",
      "Mindfulness meditations",
      "Distress tolerance toolkit"
    ],
    scientificBasis: "Supported by 40+ years of clinical research. Proven effective for borderline personality disorder, depression, anxiety, and PTSD.",
    exerciseCount: 24
  },
  {
    id: "cbt",
    name: "Cognitive Behavioral Therapy (CBT)",
    description: "Identify and change negative thought patterns to improve emotional well-being and behavior.",
    longDescription: "CBT is one of the most researched and effective forms of psychotherapy. It focuses on identifying cognitive distortions - unhelpful thinking patterns - and replacing them with more balanced, realistic thoughts. Our module guides you through structured exercises to challenge negative thinking and build healthier mental habits.",
    category: "cbt",
    icon: <Brain className="w-8 h-8" />,
    color: "from-blue-500 to-cyan-600",
    isPremium: true,
    price: 999,
    features: [
      "Cognitive distortion identification",
      "Thought record worksheets",
      "Behavioral activation planning",
      "Core belief work",
      "Problem-solving strategies",
      "Exposure hierarchy building"
    ],
    scientificBasis: "Gold-standard treatment backed by hundreds of clinical trials. Effective for anxiety, depression, OCD, and many other conditions.",
    exerciseCount: 18
  },
  {
    id: "mindfulness",
    name: "Mindfulness & Meditation",
    description: "Cultivate present-moment awareness to reduce stress and increase emotional resilience.",
    longDescription: "Mindfulness-Based Stress Reduction (MBSR) and Mindfulness-Based Cognitive Therapy (MBCT) are evidence-based approaches that use meditation and awareness practices to reduce psychological distress. Our module includes guided meditations, body scans, and daily mindfulness exercises suitable for beginners and experienced practitioners.",
    category: "mindfulness",
    icon: <Leaf className="w-8 h-8" />,
    color: "from-emerald-500 to-teal-600",
    isPremium: true,
    price: 799,
    features: [
      "Guided breathing exercises",
      "Body scan meditations",
      "Walking meditation guides",
      "Loving-kindness practices",
      "5-4-3-2-1 grounding technique",
      "Progressive muscle relaxation"
    ],
    scientificBasis: "Over 3,000 peer-reviewed studies support mindfulness for stress, anxiety, depression, and chronic pain management.",
    exerciseCount: 30
  },
  {
    id: "spiritual",
    name: "Prayer & Spiritual Support",
    description: "Faith-based resources and guided prayers for inner peace, healing, and spiritual connection.",
    longDescription: "Research shows that spiritual practices and religious coping can significantly improve mental health outcomes. Our module offers non-denominational spiritual resources alongside traditional religious prayers and contemplative practices. Designed to support your spiritual journey regardless of your faith tradition.",
    category: "spiritual",
    icon: <HandHeart className="w-8 h-8" />,
    color: "from-amber-500 to-orange-600",
    isPremium: true,
    price: 499,
    features: [
      "Guided contemplative prayers",
      "Gratitude journaling prompts",
      "Faith-based affirmations",
      "Meditation on sacred texts",
      "Community prayer groups",
      "Spiritual journaling exercises"
    ],
    scientificBasis: "Studies show religious and spiritual practices correlate with lower depression, anxiety, and improved life satisfaction.",
    exerciseCount: 20
  },
  {
    id: "grounding",
    name: "Grounding & Crisis Skills",
    description: "Immediate techniques for managing panic, dissociation, and overwhelming emotions.",
    longDescription: "Grounding techniques help you stay connected to the present moment during times of intense emotional distress, panic, or dissociation. These skills are essential tools for anyone who experiences anxiety attacks, flashbacks, or emotional overwhelm. Learn to use your senses and body to anchor yourself in the here and now.",
    category: "grounding",
    icon: <Shield className="w-8 h-8" />,
    color: "from-rose-500 to-pink-600",
    isPremium: false,
    price: 0,
    features: [
      "54321 sensory grounding",
      "Ice cube technique",
      "Box breathing exercise",
      "Safe place visualization",
      "Butterfly hug for anxiety",
      "Orientation to present moment"
    ],
    scientificBasis: "Grounding is a cornerstone of trauma-informed care, recommended by the American Psychological Association for managing acute distress.",
    exerciseCount: 12
  },
  {
    id: "act",
    name: "Acceptance & Commitment Therapy (ACT)",
    description: "Build psychological flexibility by accepting what's out of your control and committing to valued action.",
    longDescription: "ACT teaches you to accept difficult thoughts and feelings while taking action aligned with your personal values. Rather than trying to control or eliminate uncomfortable experiences, ACT helps you develop a different relationship with them. This leads to greater psychological flexibility and a more meaningful life.",
    category: "act",
    icon: <Sparkles className="w-8 h-8" />,
    color: "from-indigo-500 to-blue-600",
    isPremium: true,
    price: 899,
    features: [
      "Values clarification exercises",
      "Cognitive defusion techniques",
      "Acceptance practices",
      "Committed action planning",
      "Self-as-context exercises",
      "Present moment awareness"
    ],
    scientificBasis: "Third-wave behavioral therapy with strong research support for chronic pain, anxiety, depression, and addiction recovery.",
    exerciseCount: 16
  }
];

const pricingTiers = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Get started with basic AI chat and wellness tools",
    icon: <Heart className="w-6 h-6" />,
    color: "from-slate-500 to-gray-600",
    features: [
      "Unlimited AI chat conversations",
      "Basic memory & context",
      "Grounding & crisis skills module",
      "Privacy dashboard",
      "PII auto-redaction"
    ],
    limitations: [
      "Standard response speed",
      "Basic conversation history"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 1499,
    description: "Unlock coaching mode and premium therapy modules",
    icon: <Rocket className="w-6 h-6" />,
    color: "from-blue-500 to-indigo-600",
    popular: true,
    features: [
      "Everything in Free",
      "Therapist/Coaching mode",
      "Auto-Coaching activation",
      "Goal tracking & progress",
      "1 premium therapy module",
      "Priority response speed",
      "Extended conversation history"
    ],
    limitations: []
  },
  {
    id: "premium",
    name: "Premium",
    price: 2999,
    description: "Full access to all features and therapy modules",
    icon: <Crown className="w-6 h-6" />,
    color: "from-amber-500 to-orange-600",
    features: [
      "Everything in Pro",
      "All premium therapy modules",
      "Advanced psychoanalytic insights",
      "Motivation pattern analysis",
      "Personalized coaching programs",
      "Data export & portability",
      "Priority support"
    ],
    limitations: []
  }
];

const autoCoachingFeature = {
  id: "auto-coaching",
  name: "Auto-Coaching Mode",
  description: "AI automatically switches to coaching mode when it knows enough about you",
  longDescription: "Our intelligent Auto-Coaching feature monitors your conversation patterns and learns about your goals, challenges, and personality. Once it has gathered enough context about you (typically after 10+ meaningful conversations), it automatically activates Therapist/Coaching mode to provide personalized performance coaching, goal accountability, and psychoanalytic insights tailored specifically to your needs.",
  icon: <Eye className="w-8 h-8" />,
  color: "from-purple-500 to-violet-600",
  price: 499,
  features: [
    "Automatic mode switching based on user context",
    "Personality-aware coaching style",
    "Goal detection and tracking",
    "Motivation pattern recognition",
    "Proactive check-ins and accountability",
    "Personalized growth suggestions"
  ],
  triggers: [
    "10+ conversations with substantial content",
    "Detected goals or aspirations",
    "Recurring patterns or challenges",
    "Sufficient personality data"
  ]
};

const copingStrategies = [
  {
    name: "Box Breathing",
    category: "breathing",
    duration: "2-5 minutes",
    description: "Inhale 4 seconds, hold 4 seconds, exhale 4 seconds, hold 4 seconds. Repeat.",
    effectiveness: ["Anxiety", "Stress", "Panic"],
  },
  {
    name: "Progressive Muscle Relaxation",
    category: "physical",
    duration: "10-15 minutes", 
    description: "Systematically tense and release muscle groups from head to toe.",
    effectiveness: ["Tension", "Insomnia", "Stress"],
  },
  {
    name: "Thought Challenging",
    category: "cognitive",
    duration: "5-10 minutes",
    description: "Identify negative thought, find evidence for/against, create balanced thought.",
    effectiveness: ["Negative thinking", "Depression", "Anxiety"],
  },
  {
    name: "Gratitude List",
    category: "mindfulness",
    duration: "5 minutes",
    description: "Write down 3-5 things you're grateful for, including why.",
    effectiveness: ["Low mood", "Negativity bias", "Depression"],
  },
  {
    name: "STOP Technique",
    category: "grounding",
    duration: "1-2 minutes",
    description: "Stop, Take a breath, Observe your thoughts and feelings, Proceed mindfully.",
    effectiveness: ["Impulsivity", "Overwhelm", "Reactivity"],
  },
  {
    name: "Self-Compassion Break",
    category: "mindfulness",
    duration: "3-5 minutes",
    description: "Acknowledge suffering, recognize common humanity, offer yourself kindness.",
    effectiveness: ["Self-criticism", "Shame", "Low self-worth"],
  }
];

export default function PremiumAddons() {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<TherapyModule | null>(null);

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${(price / 100).toFixed(2)}/mo`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Chat
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                Premium Wellness Addons
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Evidence-based therapeutic tools and coping strategies to support your mental health journey.
                All modules are grounded in scientific research.
              </p>
            </motion.div>
          </div>

          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="plans" data-testid="tab-plans">Plans & Pricing</TabsTrigger>
              <TabsTrigger value="modules" data-testid="tab-modules">Therapy Modules</TabsTrigger>
              <TabsTrigger value="strategies" data-testid="tab-strategies">Quick Strategies</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {pricingTiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <Card className={`h-full flex flex-col ${tier.popular ? 'border-primary ring-2 ring-primary/20' : ''}`} data-testid={`card-tier-${tier.id}`}>
                      <CardHeader className="text-center">
                        <div className={`mx-auto p-3 rounded-full bg-gradient-to-br ${tier.color} text-white mb-4`}>
                          {tier.icon}
                        </div>
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            {tier.price === 0 ? 'Free' : `$${(tier.price / 100).toFixed(0)}`}
                          </span>
                          {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="space-y-2">
                          {tier.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {tier.limitations.map((limit, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-4 h-4 flex items-center justify-center">•</span>
                              <span>{limit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className={`w-full ${tier.popular ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}`}
                          variant={tier.popular ? 'default' : 'outline'}
                          data-testid={`button-select-${tier.id}`}
                        >
                          {tier.price === 0 ? 'Get Started' : 'Subscribe'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="overflow-hidden border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-violet-500/5">
                  <div className={`h-2 bg-gradient-to-r ${autoCoachingFeature.color}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${autoCoachingFeature.color} text-white`}>
                          {autoCoachingFeature.icon}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {autoCoachingFeature.name}
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI-Powered
                            </Badge>
                          </CardTitle>
                          <CardDescription>{autoCoachingFeature.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">${(autoCoachingFeature.price / 100).toFixed(0)}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{autoCoachingFeature.longDescription}</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                          Features
                        </h4>
                        <ul className="space-y-2">
                          {autoCoachingFeature.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          Activation Triggers
                        </h4>
                        <ul className="space-y-2">
                          {autoCoachingFeature.triggers.map((trigger, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Eye className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{trigger}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className={`bg-gradient-to-r ${autoCoachingFeature.color} text-white`} data-testid="button-add-auto-coaching">
                      <Zap className="w-4 h-4 mr-2" />
                      Add Auto-Coaching
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {therapyModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-module-${module.id}`}>
                      <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                            {module.icon}
                          </div>
                          {module.isPremium ? (
                            <Badge variant="secondary" className="gap-1">
                              <Zap className="w-3 h-3" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-600">
                              <Check className="w-3 h-3" />
                              Free
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-4">{module.name}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {module.exerciseCount} exercises
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Evidence-based
                          </span>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {module.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {module.features.length > 3 && (
                            <li className="text-muted-foreground">
                              +{module.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-3 border-t pt-4">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-2xl font-bold">{formatPrice(module.price)}</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedModule(module)} data-testid={`button-learn-more-${module.id}`}>
                                Learn More
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh]">
                              <DialogHeader>
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                                    {module.icon}
                                  </div>
                                  <div>
                                    <DialogTitle>{module.name}</DialogTitle>
                                    <DialogDescription>{module.category.toUpperCase()}</DialogDescription>
                                  </div>
                                </div>
                              </DialogHeader>
                              <ScrollArea className="max-h-[60vh] pr-4">
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="font-semibold mb-2">About This Module</h4>
                                    <p className="text-muted-foreground">{module.longDescription}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Scientific Foundation</h4>
                                    <p className="text-muted-foreground">{module.scientificBasis}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">What's Included</h4>
                                    <ul className="grid grid-cols-2 gap-2">
                                      {module.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                          <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                      <p className="font-semibold">{formatPrice(module.price)}</p>
                                      <p className="text-sm text-muted-foreground">{module.exerciseCount} exercises included</p>
                                    </div>
                                    <Button className={`bg-gradient-to-r ${module.color} text-white`} data-testid={`button-subscribe-${module.id}`}>
                                      {module.isPremium ? "Subscribe Now" : "Start Free"}
                                    </Button>
                                  </div>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Button className={`w-full bg-gradient-to-r ${module.color} text-white`} data-testid={`button-get-${module.id}`}>
                          {module.isPremium ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Unlock Module
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Start Now
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Wind className="w-5 h-5" />
                  Quick Coping Strategies
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Free evidence-based techniques you can use anytime. Each strategy is backed by psychological research.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {copingStrategies.map((strategy, index) => (
                  <motion.div
                    key={strategy.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full" data-testid={`card-strategy-${index}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">
                            {strategy.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {strategy.duration}
                          </span>
                        </div>
                        <CardTitle className="text-base mt-2">{strategy.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {strategy.effectiveness.map((effect, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" data-testid={`button-try-strategy-${index}`}>
                          Try Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Join Prayer & Support Groups</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with others on similar journeys. Virtual group sessions available weekly.
                      </p>
                    </div>
                  </div>
                  <Button data-testid="button-join-groups">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
