import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Brain, Heart, Lock, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl">SoulSanctuary</span>
          </div>
          <Button onClick={handleLogin} data-testid="button-login-header">
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Find Your Sanctuary
              <span className="text-primary"> Within</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              SoulSanctuary combines intelligent conversation with world-class privacy protection. 
              Your data stays secure with AES-256 encryption, while our AI learns and remembers 
              what matters to you.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} data-testid="button-login-hero">
                Get Started
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
            <Card className="p-6 h-full bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">AES-256 Encryption</h3>
              <p className="text-muted-foreground text-sm">
                All sensitive data is encrypted at rest with military-grade AES-256-GCM encryption.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
                <Brain className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">I Cherish Your Story</h3>
              <p className="text-muted-foreground text-sm">
                Every detail you share matters. I treasure your journey, remembering what's important so you always feel known and valued.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <div className="p-3 bg-rose-500/10 rounded-lg w-fit mb-4">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Therapist Mode</h3>
              <p className="text-muted-foreground text-sm">
                Optional emotional support with mood tracking and compassionate responses.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <div className="p-3 bg-amber-500/10 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">PII Protection</h3>
              <p className="text-muted-foreground text-sm">
                SSNs and credit cards are automatically redacted. Phone and email are securely stored.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
                <MessageSquare className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Dual Chat Modes</h3>
              <p className="text-muted-foreground text-sm">
                Switch between regular chat and therapist mode. Both share context about you.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 h-full bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">GDPR Compliant</h3>
              <p className="text-muted-foreground text-sm">
                Full control over your data with export and deletion options. Audit logs for transparency.
              </p>
            </Card>
          </motion.div>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Start your journey to inner peace
          </p>
          <div className="flex gap-4 justify-center">
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
        </div>
      </footer>
    </div>
  );
}
