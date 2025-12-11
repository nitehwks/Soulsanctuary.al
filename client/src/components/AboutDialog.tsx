import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Heart, BookOpen, Shield, Brain, Mail, Church, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface AboutDialogProps {
  trigger?: React.ReactNode;
}

export function AboutDialog({ trigger }: AboutDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2" data-testid="button-about">
            <HelpCircle className="h-4 w-4" />
            About
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-accent" />
            SoulSanctuary
          </DialogTitle>
          <DialogDescription className="text-base">
            Find Your Sanctuary Within
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-primary" />
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                SoulSanctuary is a Christian faith-integrated AI companion that combines pastoral care 
                with evidence-based therapeutic practices. We serve each person by lifting them up, 
                helping them gain independence from their struggles, and walking alongside them on 
                their journey toward healing and growth.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                Faith-Based Features
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Centering Prayer</strong> - Connect with God through sacred words</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Scripture Meditation</strong> - Deep engagement with God's Word (Lectio Divina)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Serenity Prayer Practice</strong> - Finding acceptance, courage, and wisdom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Psalms of Comfort</strong> - Ancient words for modern struggles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Faith-Based Affirmations</strong> - Scripture truths for anxious thoughts</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3 italic">
                Faith features can be turned off for users who prefer secular support only.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-primary" />
                Therapy Modules
              </h3>
              <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                <div>
                  <strong className="text-foreground">DBT</strong>
                  <p className="text-sm">TIPP Skills, Wise Mind</p>
                </div>
                <div>
                  <strong className="text-foreground">CBT</strong>
                  <p className="text-sm">Thought Records, Reframing</p>
                </div>
                <div>
                  <strong className="text-foreground">Mindfulness</strong>
                  <p className="text-sm">Body Scan, Box Breathing</p>
                </div>
                <div>
                  <strong className="text-foreground">ACT</strong>
                  <p className="text-sm">Values Clarification</p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Security
              </h3>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>• AES-256-GCM encryption for your conversations</li>
                <li>• Automatic PII redaction for sensitive information</li>
                <li>• GDPR compliant - export or delete your data anytime</li>
                <li>• Tamper-evident audit logging</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-accent" />
                Support SoulSanctuary
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                SoulSanctuary is currently in beta and offered freely as a ministry. 
                Your donations help cover hosting, AI costs, and continued development.
              </p>
              <Link href="/donate">
                <Button className="w-full gap-2" variant="default" data-testid="button-donate">
                  <Heart className="h-4 w-4" />
                  Donate to Support Our Mission
                </Button>
              </Link>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <Church className="h-5 w-5 text-primary" />
                Contact
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <strong>Creator:</strong> Joe Abbott
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a 
                    href="mailto:techsupport@creativelovechurch.com" 
                    className="text-primary hover:underline"
                    data-testid="link-contact-email"
                  >
                    techsupport@creativelovechurch.com
                  </a>
                </p>
                <p>
                  <strong>Church:</strong> Creative Love Church
                </p>
              </div>
            </section>

            <div className="pt-4 text-center text-sm text-muted-foreground italic border-t">
              "Your story matters to me. I cherish every detail you share."
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
