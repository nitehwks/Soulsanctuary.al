/**
 * Full-screen second-factor gate.
 *
 * Shown whenever any API call gets a 403 "2fa_required" (see queryClient.ts).
 * The user enters their authenticator code; on success the server issues a
 * 12h session token, and optionally a 30-day trusted-device token so this
 * device stops being challenged.
 */

import { useEffect, useState } from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  storeTwoFactorTokens,
  thisDeviceLabel,
  TWO_FA_REQUIRED_EVENT,
  TWO_FA_SATISFIED_EVENT,
} from "@/lib/twofa";

export function TwoFactorGate() {
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const onRequired = () => {
      setCode("");
      setError(null);
      setVisible(true);
    };
    window.addEventListener(TWO_FA_REQUIRED_EVENT, onRequired);
    return () => window.removeEventListener(TWO_FA_REQUIRED_EVENT, onRequired);
  }, []);

  if (!visible) return null;

  const submit = async () => {
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/2fa/challenge", {
        code,
        trustDevice,
        label: thisDeviceLabel(),
      });
      const data = (await res.json()) as {
        sessionToken: string;
        deviceToken: string | null;
      };
      storeTwoFactorTokens(data);
      setVisible(false);
      window.dispatchEvent(new Event(TWO_FA_SATISFIED_EVENT));
      // Retry everything that was blocked by the gate
      queryClient.invalidateQueries();
    } catch {
      setError("That code didn't work. Check your authenticator app and try again.");
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-5 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            onComplete={submit}
            autoFocus
            data-testid="2fa-code-input"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <label className="flex items-center gap-2 justify-center text-sm text-muted-foreground cursor-pointer">
          <Checkbox
            checked={trustDevice}
            onCheckedChange={(v) => setTrustDevice(v === true)}
            data-testid="2fa-trust-device"
          />
          Trust this device for 30 days
        </label>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button
          className="w-full"
          onClick={submit}
          disabled={code.length !== 6 || submitting}
          data-testid="2fa-submit"
        >
          {submitting ? "Verifying..." : "Verify"}
        </Button>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out instead
        </Button>
      </div>
    </div>
  );
}
