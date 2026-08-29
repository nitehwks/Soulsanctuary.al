import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div>
           <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-settings-title">{t('settings.title')}</h1>
           <p className="text-muted-foreground mt-2">{t('settings.subtitle')}</p>
        </div>

        <Tabs defaultValue="language" className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="language" data-testid="tab-language">{t('settings.language')}</TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">{t('settings.privacyTab')}</TabsTrigger>
            <TabsTrigger value="learning" data-testid="tab-learning">{t('settings.learningTab')}</TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">{t('settings.integrationsTab')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="language" className="space-y-6 mt-6">
            <Card className="p-6 space-y-6 bg-card/40 border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-base">{t('settings.language')}</Label>
                  <p className="text-sm text-muted-foreground">{t('settings.languageDescription')}</p>
                </div>
                <LanguageSwitcher />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card className="p-6 space-y-6 bg-card/40 border-border/50">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <Label className="text-base">{t('settings.piiRedaction')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.piiRedactionDesc')}</p>
                  </div>
                  <Switch defaultChecked />
               </div>
               
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <Label className="text-base">{t('settings.encryption')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.encryptionDesc')}</p>
                  </div>
                  <Switch defaultChecked disabled />
               </div>

               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <Label className="text-base">{t('settings.ephemeral')}</Label>
                      <p className="text-sm text-muted-foreground">{t('settings.ephemeralDesc')}</p>
                  </div>
                  <Switch />
               </div>

               <div className="pt-4 border-t border-border/50">
                  <Button variant="destructive" className="w-full sm:w-auto">{t('settings.purgeData')}</Button>
               </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="learning">
            <Card className="p-6 bg-card/40 border-border/50">
                <div className="text-center py-12 text-muted-foreground">
                    {t('settings.learningManaged')}
                </div>
            </Card>
          </TabsContent>
          
           <TabsContent value="integrations">
            <Card className="p-6 bg-card/40 border-border/50">
                 <div className="text-center py-12 text-muted-foreground">
                    {t('settings.integrationsManaged')}
                </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
