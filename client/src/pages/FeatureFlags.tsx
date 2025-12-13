import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Flag, Percent, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { FeatureFlag } from "@shared/schema";

export default function FeatureFlags() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({
    key: "",
    name: "",
    description: "",
    enabled: false,
    rolloutPercentage: 0,
  });

  const { data: flags = [], isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newFlag) => {
      return await apiRequest("POST", "/api/feature-flags", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      setDialogOpen(false);
      setNewFlag({ key: "", name: "", description: "", enabled: false, rolloutPercentage: 0 });
      toast({ title: t('featureFlags.created') });
    },
    onError: (error: any) => {
      toast({ title: t('featureFlags.errorCreate'), description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<FeatureFlag> }) => {
      return await apiRequest("PATCH", `/api/feature-flags/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      toast({ title: t('featureFlags.updated') });
    },
    onError: (error: any) => {
      toast({ title: t('featureFlags.errorUpdate'), description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/feature-flags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      toast({ title: t('featureFlags.deleted') });
    },
    onError: (error: any) => {
      toast({ title: t('featureFlags.errorDelete'), description: error.message, variant: "destructive" });
    },
  });

  const handleToggle = (flag: FeatureFlag) => {
    updateMutation.mutate({ id: flag.id, updates: { enabled: !flag.enabled } });
  };

  const handleRolloutChange = (flag: FeatureFlag, value: number[]) => {
    updateMutation.mutate({ id: flag.id, updates: { rolloutPercentage: value[0] } });
  };

  const handleCreate = () => {
    if (!newFlag.key || !newFlag.name) {
      toast({ title: t('featureFlags.requiredFields'), variant: "destructive" });
      return;
    }
    createMutation.mutate(newFlag);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
            <Flag className="h-6 w-6" />
            {t('featureFlags.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('featureFlags.subtitle')}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-flag">
              <Plus className="h-4 w-4 mr-2" />
              {t('featureFlags.newFlag')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('featureFlags.createFlag')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="key">{t('featureFlags.key')}</Label>
                <Input
                  id="key"
                  data-testid="input-flag-key"
                  placeholder={t('featureFlags.keyPlaceholder')}
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t('featureFlags.name')}</Label>
                <Input
                  id="name"
                  data-testid="input-flag-name"
                  placeholder={t('featureFlags.namePlaceholder')}
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('featureFlags.description')}</Label>
                <Textarea
                  id="description"
                  data-testid="input-flag-description"
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">{t('featureFlags.enabled')}</Label>
                <Switch
                  id="enabled"
                  data-testid="switch-flag-enabled"
                  checked={newFlag.enabled}
                  onCheckedChange={(checked) => setNewFlag({ ...newFlag, enabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('featureFlags.rollout')}</Label>
                  <span className="text-sm text-muted-foreground">{newFlag.rolloutPercentage}%</span>
                </div>
                <Slider
                  data-testid="slider-rollout"
                  value={[newFlag.rolloutPercentage]}
                  onValueChange={(value) => setNewFlag({ ...newFlag, rolloutPercentage: value[0] })}
                  max={100}
                  step={1}
                />
              </div>
              <Button
                className="w-full"
                data-testid="button-submit-flag"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? t('common.loading') : t('featureFlags.createFlag')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {flags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Flag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('featureFlags.noFlags')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('featureFlags.createFirst')}
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-flag">
              <Plus className="h-4 w-4 mr-2" />
              {t('featureFlags.createFlag')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card key={flag.id} data-testid={`card-flag-${flag.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">{flag.name}</CardTitle>
                    <Badge variant="outline">
                      {flag.key}
                    </Badge>
                    {flag.enabled ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {t('featureFlags.active')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {t('featureFlags.inactive')}
                      </Badge>
                    )}
                  </div>
                  {flag.description && (
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    data-testid={`switch-toggle-${flag.id}`}
                    checked={flag.enabled ?? false}
                    onCheckedChange={() => handleToggle(flag)}
                    disabled={updateMutation.isPending}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    data-testid={`button-delete-${flag.id}`}
                    onClick={() => deleteMutation.mutate(flag.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Percent className="h-4 w-4" />
                    <span>{t('featureFlags.rollout')}: {flag.rolloutPercentage ?? 0}%</span>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <Slider
                      data-testid={`slider-rollout-${flag.id}`}
                      value={[flag.rolloutPercentage ?? 0]}
                      onValueCommit={(value) => handleRolloutChange(flag, value)}
                      max={100}
                      step={1}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  {flag.userSegments && flag.userSegments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{flag.userSegments.length} {t('featureFlags.segments')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
