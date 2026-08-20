/**
 * Two-factor authentication management card (Settings → Security).
 *
 * TOTP enrollment (QR + manual secret + confirm code), disable, and
 * trusted-device management. Server side: server/twofa-routes.ts.
 */

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Smartphone, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { storeTwoFactorTokens, clearTwoFactorTokens, thisDeviceLabel } from "@/lib/twofa";

interface TrustedDevice {
  id: number;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
}

interface TwoFactorStatus {
  enabled: boolean;
  devices: TrustedDevice[];
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

export function TwoFactorCard() {
  const { isGuest } = useAuth();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // enrollment state
  const [enrolling, setEnrolling] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [busy, setBusy] = useState(false);

  // disable state
  const [disabling, setDisabling] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("GET", "/api/2fa/status");
      setStatus((await res.json()) as TwoFactorStatus);
    } catch (e: any) {
      setError(e?.message || "Failed to load 2FA status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) loadStatus();
  }, [isGuest, loadStatus]);

  const startEnrollment = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/2fa/enroll");
      const data = (await res.json()) as { secret: string; qr: string };
      setSecret(data.secret);
      setQr(data.qr);
      setCode("");
      setEnrolling(true);
    } catch (e: any) {
      setError(e?.message || "Failed to start enrollment.");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnrollment = async () => {
    if (code.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/2fa/enable", {
        code,
        trustDevice,
        label: thisDeviceLabel(),
      });
      storeTwoFactorTokens((await res.json()) as any);
      setEnrolling(false);
      setQr(null);
      setSecret(null);
      setCode("");
      await loadStatus();
    } catch {
      setError("That code didn't work. Make sure your authenticator app is synced and try again.");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (disableCode.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      await apiRequest("POST", "/api/2fa/disable", { code: disableCode });
      clearTwoFactorTokens();
      setDisabling(false);
      setDisableCode("");
      await loadStatus();
    } catch {
      setError("That code didn't work. Try again.");
      setDisableCode("");
    } finally {
      setBusy(false);
    }
  };

  const revokeDevice = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/2fa/devices/${id}`);
      await loadStatus();
    } catch (e: any) {
      setError(e?.message || "Failed to revoke device.");
    }
  };

  if (isGuest) {
    return (
      <Card className="p-6 bg-card/40 border-border/50">
        <p className="text-sm text-muted-foreground">
          Two-factor authentication is not available for guest accounts.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5 bg-card/40 border-border/50">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Two-Factor Authentication
          </Label>
          <p className="text-sm text-muted-foreground">
            Require a code from an authenticator app (1Password, Google Authenticator, Authy…) at
            sign-in. Trusted devices only ask once every 30 days.
          </p>
        </div>
        {status && (
          <Badge variant={status.enabled ? "default" : "outline"} data-testid="2fa-status-badge">
            {status.enabled ? "On" : "Off"}
          </Badge>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !status?.enabled ? (
        <>
          {!enrolling ? (
            <Button onClick={startEnrollment} disabled={busy} data-testid="2fa-setup">
              {busy ? "Preparing..." : "Set Up Two-Factor Authentication"}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
              </p>
              {qr && (
                <div className="flex justify-center">
                  <img src={qr} alt="2FA QR code" className="rounded-lg border border-border bg-white p-2" />
                </div>
              )}
              {secret && (
                <p className="text-xs text-muted-foreground text-center">
                  Can't scan? Enter this manually:{" "}
                  <span className="font-mono break-all">{secret}</span>
                </p>
              )}
              <div className="flex justify-center">
                <OtpInput value={code} onChange={setCode} />
              </div>
              <label className="flex items-center gap-2 justify-center text-sm text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={trustDevice}
                  onCheckedChange={(v) => setTrustDevice(v === true)}
                  data-testid="2fa-enroll-trust"
                />
                Trust this device for 30 days
              </label>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setEnrolling(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button onClick={confirmEnrollment} disabled={code.length !== 6 || busy} data-testid="2fa-confirm">
                  {busy ? "Verifying..." : "Confirm and Enable"}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Trusted Devices
            </Label>
            {status.devices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No trusted devices. You'll be asked for a code at each sign-in.
              </p>
            ) : (
              status.devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3"
                >
                  <div className="text-sm">
                    <div>{device.label || "Trusted device"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Added {new Date(device.createdAt).toLocaleDateString()}
                      {device.lastUsedAt
                        ? ` · last used ${new Date(device.lastUsedAt).toLocaleDateString()}`
                        : ""}
                      {" · expires "}
                      {new Date(device.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeDevice(device.id)}
                    aria-label="Revoke device"
                    data-testid={`2fa-revoke-${device.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-border/50 space-y-3">
            {!disabling ? (
              <Button variant="outline" onClick={() => setDisabling(true)} data-testid="2fa-start-disable">
                <ShieldOff className="h-4 w-4 mr-2" />
                Turn Off 2FA
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter a code from your authenticator app to turn off 2FA. All trusted devices will
                  be forgotten.
                </p>
                <div className="flex justify-center">
                  <OtpInput value={disableCode} onChange={setDisableCode} />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setDisabling(false)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={disable}
                    disabled={disableCode.length !== 6 || busy}
                    data-testid="2fa-confirm-disable"
                  >
                    {busy ? "Verifying..." : "Turn Off"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
