import { Switch, Route } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
import { queryClient, setClerkTokenGetter } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { applyPlatformClasses, isCapacitorNativeApp, isNativeApp } from "@/lib/platform";
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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import { useEffect, lazy, Suspense, useRef } from "react";
import { useAppAuth } from "./lib/auth";

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ClerkQueryClientCacheInvalidator() {
  const { user } = useAppAuth();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      queryClient.clear();
    }
    prevUserIdRef.current = userId;
  }, [queryClient, user?.id]);

  return null;
}

function AppRouter() {
  const { getToken, isLoaded, isSignedIn, startHostedAuth, error } = useAppAuth();

  // Native API calls are cross-origin and need a fresh Clerk bearer token.
  // Web API calls use Clerk's same-origin session cookies instead.
  useEffect(() => {
    if (!isNativeApp()) return;
    setClerkTokenGetter(() => getToken());
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    if (isCapacitorNativeApp()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="w-full max-w-sm space-y-4 text-center">
            <h1 className="text-xl font-semibold text-foreground">Welcome</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue.</p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <button
              type="button"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => void startHostedAuth("signIn")}
            >
              Sign in
            </button>
            <button
              type="button"
              className="w-full rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground"
              onClick={() => void startHostedAuth("signUp")}
            >
              Create account
            </button>
          </div>
        </div>
      );
    }
    return (
      <Switch>
        <Route path="/sign-in/*?">
          <SignIn
            routing="path"
            path={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            fallbackRedirectUrl={basePath || "/"}
          />
        </Route>
        <Route path="/sign-up/*?">
          <SignUp
            routing="path"
            path={`${basePath}/sign-up`}
            signInUrl={`${basePath}/sign-in`}
            fallbackRedirectUrl={basePath || "/"}
          />
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
      <Route path="/admin">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }
        >
          <AdminDashboard />
        </Suspense>
      </Route>
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
      <ClerkQueryClientCacheInvalidator />
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
