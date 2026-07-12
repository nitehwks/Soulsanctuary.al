import { Switch, Route } from "wouter";
import { useAuth as useClerkAuth, SignIn, SignUp } from "@clerk/clerk-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuth, signInWithLocalAccount } from "@/hooks/useAuth";
import { initDeepLinkHandler } from "@/lib/deepLink";
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
import { Loader2 } from "lucide-react";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkConfigured = !!clerkKey && !clerkKey.includes("your_clerk") && !clerkKey.includes("...");
const clerkSignInRedirectUrl = import.meta.env.VITE_CLERK_SIGN_IN_REDIRECT_URL as string | undefined;
const clerkSignUpRedirectUrl = import.meta.env.VITE_CLERK_SIGN_UP_REDIRECT_URL as string | undefined;

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isSignedIn, getToken } = useClerkAuth();

  // Whenever Clerk signs in, stash the session token so API calls can use it.
  useEffect(() => {
    if (!isSignedIn) {
      localStorage.removeItem("clerkSessionToken");
      return;
    }
    getToken()
      .then((token) => {
        if (token) localStorage.setItem("clerkSessionToken", token);
      })
      .catch(() => {});
  }, [isSignedIn, getToken]);

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
        <Route path="/sign-in/:rest*">
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 gap-4">
            <SignIn
              routing="path"
              path="/sign-in"
              fallbackRedirectUrl={clerkSignInRedirectUrl || "/"}
              forceRedirectUrl={clerkSignInRedirectUrl || undefined}
              signUpFallbackRedirectUrl={clerkSignUpRedirectUrl || "/"}
              signUpForceRedirectUrl={clerkSignUpRedirectUrl || undefined}
            />
            <Button variant="secondary" onClick={signInWithLocalAccount}>
              Use Local Account
            </Button>
          </div>
        </Route>
        <Route path="/sign-up/:rest*">
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 gap-4">
            <SignUp
              routing="path"
              path="/sign-up"
              fallbackRedirectUrl={clerkSignUpRedirectUrl || "/"}
              forceRedirectUrl={clerkSignUpRedirectUrl || undefined}
              signInFallbackRedirectUrl={clerkSignInRedirectUrl || "/"}
              signInForceRedirectUrl={clerkSignInRedirectUrl || undefined}
            />
            <Button variant="secondary" onClick={signInWithLocalAccount}>
              Use Local Account
            </Button>
          </div>
        </Route>
        <Route path="/" component={Landing} />
        <Route path="/sales" component={Sales} />
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
    initDeepLinkHandler();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
