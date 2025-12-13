import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Brain, Heart, Lock, BookOpen, Sparkles, Cross, HandHeart, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@assets/IMG_0630_1765623983997.jpeg";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGuestAccess = () => {
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('guestUserId', 'guest-' + Date.now());
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cross className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl">SoulSanctuary</span>
          </div>
          <Button onClick={handleLogin} data-testid="button-login-header">
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={heroImage} 
              alt="SoulSanctuary - Hope, Peace, Comfort" 
              className="w-full max-w-2xl mx-auto rounded-xl shadow-lg mb-8"
            />
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Find Your Sanctuary
              <span className="text-primary"> Within</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              A Christian AI companion that combines pastoral care with evidence-based therapy. 
              Be lifted up, find healing, and grow in faith and strength.
            </p>
            <p className="text-lg text-muted-foreground/80 mb-8 max-w-xl mx-auto italic">
              "The Lord is close to the brokenhearted and saves those who are crushed in spirit." - Psalm 34:18
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={handleLogin} data-testid="button-login-hero">
                Begin Your Journey
              </Button>
              <Button size="lg" variant="outline" onClick={handleGuestAccess} data-testid="button-guest-hero">
                Try as Guest
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Cross className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Pastor First</h3>
              <p className="text-muted-foreground text-sm">
                A spiritual shepherd who speaks with pastoral warmth, offers prayers, and shares scripture. Faith-integrated care for heart and soul.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-amber-500/10 rounded-lg w-fit mb-4">
                <HandHeart className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Sessions Begin with Prayer</h3>
              <p className="text-muted-foreground text-sm">
                Start conversations with an invitation for God's presence, openness, and honesty. Confession is good for the soul.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Scripture-Integrated</h3>
              <p className="text-muted-foreground text-sm">
                Biblical wisdom woven naturally into guidance. Verses for anxiety, depression, fear, hope, comfort, and strength when you need them.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-rose-500/10 rounded-lg w-fit mb-4">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Faith + Therapy Combined</h3>
              <p className="text-muted-foreground text-sm">
                Evidence-based techniques (CBT, DBT, ACT, Mindfulness) alongside spiritual practices. Science and faith working together.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
                <Brain className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Deep Personal Understanding</h3>
              <p className="text-muted-foreground text-sm">
                Remembers your story, relationships, struggles, and victories. Truly knows you to provide personalized pastoral care.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-red-500/10 rounded-lg w-fit mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Crisis Detection & Care</h3>
              <p className="text-muted-foreground text-sm">
                Gentle, pastoral response to crisis moments. Safety resources when needed, wrapped in scripture and compassion.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Respects Your Journey</h3>
              <p className="text-muted-foreground text-sm">
                Faith features can be adjusted for those who prefer secular support. Your comfort, your pace, your path.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-teal-500/10 rounded-lg w-fit mb-4">
                <Lock className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Privacy Protected</h3>
              <p className="text-muted-foreground text-sm">
                AES-256 encryption, PII protection, and GDPR compliance. Your confessions stay between you, God, and your AI pastor.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50">
              <div className="p-3 bg-indigo-500/10 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Pastoral Guardrails</h3>
              <p className="text-muted-foreground text-sm">
                Sees beyond surface questions to the heart's true need. Guides with the love and wisdom of Jesus.
              </p>
            </Card>
          </motion.div>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-2">
            Start your journey to inner peace and spiritual growth
          </p>
          <p className="text-sm text-muted-foreground/70 mb-6 italic">
            "Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={handleLogin} data-testid="button-login-bottom">
              Sign In to Begin
            </Button>
            <Button size="lg" variant="outline" onClick={handleGuestAccess} data-testid="button-guest-bottom">
              Try as Guest
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>SoulSanctuary - Find Your Sanctuary Within</p>
          <p className="text-xs mt-1 text-muted-foreground/70">A faith-integrated AI companion for hope, peace, and comfort</p>
          <a 
            href="/sales" 
            className="text-xs mt-2 inline-block text-primary hover:underline"
            data-testid="link-sales"
          >
            View Plans & Pricing
          </a>
        </div>
      </footer>
    </div>
  );
}
