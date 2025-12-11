import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Heart, CreditCard, Bitcoin, ArrowLeft, Sparkles, Church } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const DONATION_AMOUNTS = [10, 25, 50, 100, 250];

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleDonateCard = async () => {
    if (!finalAmount || finalAmount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a donation amount of at least $1",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/donate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(finalAmount * 100) })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to process donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to SoulSanctuary
          </Button>
        </Link>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-accent/20">
              <Heart className="h-12 w-12 text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Support SoulSanctuary
            <Sparkles className="h-6 w-6 text-accent" />
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your generosity helps us continue providing faith-based support and healing to those who need it most.
            Every donation goes toward hosting, AI costs, and developing new features to serve our community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Credit / Debit Card
              </CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Select an amount</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DONATION_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                      className="h-12"
                      data-testid={`button-amount-${amount}`}
                    >
                      ${amount}
                    </Button>
                  ))}
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        className="pl-7"
                        min="1"
                        data-testid="input-custom-amount"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg gap-2" 
                onClick={handleDonateCard}
                disabled={isProcessing || !finalAmount}
                data-testid="button-donate-card"
              >
                <Heart className="h-5 w-5" />
                {isProcessing ? "Processing..." : `Donate ${finalAmount ? `$${finalAmount}` : ""}`}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-accent" />
                Cryptocurrency
              </CardTitle>
              <CardDescription>
                Support with Bitcoin, Ethereum, or other crypto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Crypto donations coming soon! We're working on integrating cryptocurrency payments.
                </p>
                <div className="flex justify-center gap-4 text-2xl">
                  <span title="Bitcoin">₿</span>
                  <span title="Ethereum">Ξ</span>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Why donate with crypto?</p>
                <ul className="space-y-1">
                  <li>• Lower transaction fees</li>
                  <li>• Greater privacy</li>
                  <li>• Support decentralization</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Card className="inline-block max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Church className="h-5 w-5 text-primary" />
                <span className="font-medium">Creative Love Church</span>
              </div>
              <p className="text-sm text-muted-foreground">
                SoulSanctuary is a ministry of Creative Love Church. 
                All donations support our mission to provide faith-based healing and hope.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Contact: joe_abbott@me.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
