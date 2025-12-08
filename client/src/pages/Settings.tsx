import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div>
           <h1 className="text-3xl font-heading font-bold text-foreground">Privacy & Controls</h1>
           <p className="text-muted-foreground mt-2">Manage how the AI learns and obfuscates your data.</p>
        </div>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="privacy">Privacy Protocols</TabsTrigger>
            <TabsTrigger value="learning">Learning Modules</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card className="p-6 space-y-6 bg-card/40 border-border/50">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <Label className="text-base">PII Auto-Redaction</Label>
                      <p className="text-sm text-muted-foreground">Automatically replace emails, phone numbers, and addresses with placeholders.</p>
                  </div>
                  <Switch defaultChecked />
               </div>
               
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <Label className="text-base">End-to-End Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt all data at rest and in transit using AES-256.</p>
                  </div>
                  <Switch defaultChecked disabled />
               </div>

               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <Label className="text-base">Ephemeral Session Mode</Label>
                      <p className="text-sm text-muted-foreground">Do not store chat history after the session ends.</p>
                  </div>
                  <Switch />
               </div>

               <div className="pt-4 border-t border-border/50">
                  <Button variant="destructive" className="w-full sm:w-auto">Purge All Learned Data</Button>
               </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="learning">
            <Card className="p-6 bg-card/40 border-border/50">
                <div className="text-center py-12 text-muted-foreground">
                    Learning module configuration is managed by the central administrator.
                </div>
            </Card>
          </TabsContent>
          
           <TabsContent value="integrations">
            <Card className="p-6 bg-card/40 border-border/50">
                 <div className="text-center py-12 text-muted-foreground">
                    Integration settings are managed via the API Gateway.
                </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
