import { Switch, Route } from "wouter";
import { useAuth as useClerkAuth, SignIn, SignUp } from "@clerk/clerk-react";
import { queryClient, setClerkTokenGetter } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { applyPlatformClasses } from "@/lib/platform";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import SettingsPage from "@/pages/Settings";
import Docs from "@/pages/Docs";
import Landing from "@/pages/Landing";
import PremiumAddons from "@/pages/PremiumAddons";
import Groups from "@/pages/Groups";
import Analytics from "@/pages/Analytics";
import ClinicianDashboard from "@/pages/ClinicianDashboard";
import FeatureFlags from "@/pages/FeatureFlags";
import Sales from "@/pages/Sales";
import { OAuthCallback } from "@/components/auth/OAuthCallback";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

function resolveHttpBaseUrl(): string {
  const runtimeConfig =
    (typeof window !== "undefined" && (window as any).SOULSANCTUARY_CONFIG) || {};
  const runtimeApiUrl = runtimeConfig.API_URL as string | undefined;
  const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const origin = typeof window !== "undefined" ? window.location.origin : undefined;

  const candidates = [origin, runtimeApiUrl, envApiUrl];
  for (const candidate of candidates) {
    if (candidate && /^https?:\/\//i.test(candidate)) {
      return candidate.replace(/\/$/, "");
    }
  }

  return "https://localhost";
}

function toAbsoluteUrl(path: string): string {
  const base = resolveHttpBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

const AUTH_HOME_REDIRECT = toAbsoluteUrl("/");

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { getToken } = useClerkAuth();

  // Give the API layer direct access to Clerk's getToken so every request
  // uses a fresh session token. getToken auto-refreshes expired tokens,
  // which is essential on mobile where the app stays open for long periods
  // and a token cached at sign-in expires after ~60 seconds.
  useEffect(() => {
    setClerkTokenGetter(() => getToken());
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  // OAuth callback route must be reachable regardless of current auth state.
  const authCallbackPath = window.location.pathname;
  if (
    authCallbackPath === "/oauth/callback" ||
    authCallbackPath === "/sso-callback" ||
    authCallbackPath.endsWith("/oauth/callback") ||
    authCallbackPath.endsWith("/sso-callback")
  ) {
    return <OAuthCallback />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/sign-in/*?">
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 gap-4">
            <SignIn
              routing="path"
              path="/sign-in"
              oauthFlow="redirect"
              signUpUrl={toAbsoluteUrl("/sign-up")}
              withSignUp={true}
              transferable={true}
              fallbackRedirectUrl={AUTH_HOME_REDIRECT}
              forceRedirectUrl={AUTH_HOME_REDIRECT}
              signUpFallbackRedirectUrl={AUTH_HOME_REDIRECT}
              signUpForceRedirectUrl={AUTH_HOME_REDIRECT}
            />
            <div id="clerk-captcha" />
          </div>
        </Route>
        <Route path="/sign-up/*?">
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 gap-4">
            <SignUp
              routing="path"
              path="/sign-up"
              oauthFlow="redirect"
              signInUrl={toAbsoluteUrl("/sign-in")}
              fallbackRedirectUrl={AUTH_HOME_REDIRECT}
              forceRedirectUrl={AUTH_HOME_REDIRECT}
              signInFallbackRedirectUrl={AUTH_HOME_REDIRECT}
              signInForceRedirectUrl={AUTH_HOME_REDIRECT}
            />
            <div id="clerk-captcha" />
          </div>
        </Route>
        <Route path="/sales" component={Sales} />
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/docs" component={Docs} />
      <Route path="/addons" component={PremiumAddons} />
      <Route path="/groups" component={Groups} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/clinician" component={ClinicianDashboard} />
      <Route path="/feature-flags" component={FeatureFlags} />
      <Route path="/sales" component={Sales} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    applyPlatformClasses();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
