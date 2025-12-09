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
            <span className="font-heading font-bold text-xl">TrustHub</span>
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
              Your Privacy-First
              <span className="text-primary"> AI Companion</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              TrustHub combines intelligent conversation with world-class privacy protection. 
              Your data stays secure with AES-256 encryption, while our AI learns and remembers 
              what matters to you.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} data-testid="button-login-hero">
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Learn More
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
              <h3 className="font-heading font-semibold text-lg mb-2">Smart Memory</h3>
              <p className="text-muted-foreground text-sm">
                I remember your preferences, contacts, and important facts across all our conversations.
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
            Sign in with your preferred provider
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="gap-2 bg-white text-black hover:bg-gray-100 border border-gray-200"
              data-testid="button-login-google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="gap-2 bg-black text-white hover:bg-gray-800"
              data-testid="button-login-apple"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </Button>
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="gap-2 bg-gray-900 text-white hover:bg-gray-700"
              data-testid="button-login-github"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="gap-2 bg-black text-white hover:bg-gray-800"
              data-testid="button-login-x"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </Button>
          </div>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="outline" onClick={handleGuestAccess} data-testid="button-guest-access">
              Try as Guest
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>TrustHub - Privacy-First AI Chat Platform</p>
        </div>
      </footer>
    </div>
  );
}
