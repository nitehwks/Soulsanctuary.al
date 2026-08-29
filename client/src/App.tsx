import { Switch, Route } from "wouter";
import { useAuth as useClerkAuth, SignIn, SignUp } from "@clerk/react";
import { queryClient, setClerkTokenGetter } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { applyPlatformClasses, isNativeApp } from "@/lib/platform";
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

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { getToken } = useClerkAuth();

  // Native API calls are cross-origin and need a fresh Clerk bearer token.
  // Web API calls use Clerk's same-origin session cookies instead.
  useEffect(() => {
    if (!isNativeApp()) return;
    setClerkTokenGetter(() => getToken());
    return () => setClerkTokenGetter(null);
  }, [getToken]);

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
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
            />
          </div>
        </Route>
        <Route path="/sign-up/*?">
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 gap-4">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/"
            />
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
