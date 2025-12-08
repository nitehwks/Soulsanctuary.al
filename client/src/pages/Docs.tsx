import { Layout } from "@/components/layout/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Docs() {
  return (
    <Layout>
       <div className="flex h-full">
         <div className="w-64 hidden lg:block border-r border-border/50 bg-card/20">
            <div className="p-6">
                <h4 className="font-bold mb-4 text-primary font-heading uppercase tracking-wider text-xs">Navigation</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="text-foreground font-medium cursor-pointer border-l-2 border-primary pl-3 -ml-3">System Overview</li>
                    <li className="hover:text-foreground cursor-pointer transition-colors pl-3">AI Engine Specs</li>
                    <li className="hover:text-foreground cursor-pointer transition-colors pl-3">Database Architecture</li>
                    <li className="hover:text-foreground cursor-pointer transition-colors pl-3">Security & Compliance</li>
                    <li className="hover:text-foreground cursor-pointer transition-colors pl-3">API Reference</li>
                </ul>
            </div>
         </div>
         <div className="flex-1 overflow-auto bg-background">
            <div className="max-w-4xl mx-auto p-8 space-y-12">
                
                {/* Header */}
                <div className="border-b border-border pb-8">
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Technical Specifications</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Comprehensive documentation for the TrustHub Secure AI Platform, including model parameters, infrastructure constraints, and security protocols.
                    </p>
                    <div className="flex gap-2 mt-4">
                        <Badge variant="outline" className="font-mono">v2.4.0-beta</Badge>
                        <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-primary/5">Enterprise Edition</Badge>
                    </div>
                </div>

                {/* AI Specs */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
                        <span className="w-2 h-8 bg-primary rounded-sm"></span>
                        AI Engine Specifications
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="font-bold mb-4 flex items-center justify-between">
                                Model Architecture
                                <Badge>Dolphin 3.0</Badge>
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex justify-between border-b border-border/50 pb-2">
                                    <span>Parameter Count</span>
                                    <span className="font-mono text-foreground">8 Billion</span>
                                </li>
                                <li className="flex justify-between border-b border-border/50 pb-2">
                                    <span>Context Window</span>
                                    <span className="font-mono text-foreground">16k Tokens</span>
                                </li>
                                <li className="flex justify-between border-b border-border/50 pb-2">
                                    <span>Quantization</span>
                                    <span className="font-mono text-foreground">Q4_K_M (4-bit)</span>
                                </li>
                                <li className="flex justify-between pt-2">
                                    <span>Inference Backend</span>
                                    <span className="font-mono text-foreground">ONNX Runtime</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-6">
                             <h3 className="font-bold mb-4">Capabilities</h3>
                             <p className="text-sm text-muted-foreground mb-4">
                                The model is fine-tuned on the "Cognitive Compliance" dataset to ensure adherence to strict enterprise guidelines while maintaining conversational fluidity.
                             </p>
                             <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">Schema Generation</Badge>
                                <Badge variant="secondary">PII Detection</Badge>
                                <Badge variant="secondary">Sentiment Analysis</Badge>
                                <Badge variant="secondary">Code Synthesis</Badge>
                             </div>
                        </div>
                    </div>
                </section>

                {/* Infrastructure */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
                        <span className="w-2 h-8 bg-secondary rounded-sm"></span>
                        Infrastructure & Storage
                    </h2>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[200px]">Component</TableHead>
                                    <TableHead>Specification</TableHead>
                                    <TableHead className="text-right">Capacity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Primary Database</TableCell>
                                    <TableCell className="font-mono text-xs">PlanetScale (Vitess/MySQL)</TableCell>
                                    <TableCell className="text-right font-mono text-xs">Unlimited Horizontal Scale</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Vector Index</TableCell>
                                    <TableCell className="font-mono text-xs">HNSW (Hierarchical Navigable Small World)</TableCell>
                                    <TableCell className="text-right font-mono text-xs">20M Vectors</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Embedding Model</TableCell>
                                    <TableCell className="font-mono text-xs">text-embedding-3-small</TableCell>
                                    <TableCell className="text-right font-mono text-xs">1536 Dimensions</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Real-time Bus</TableCell>
                                    <TableCell className="font-mono text-xs">WebSocket / gRPC</TableCell>
                                    <TableCell className="text-right font-mono text-xs">10k concurrent/node</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* Operating Costs */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
                        <span className="w-2 h-8 bg-yellow-500 rounded-sm"></span>
                        Projected Operating Costs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card border border-border rounded-lg p-6">
                             <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Compute & Hosting</div>
                             <div className="text-3xl font-bold font-heading mb-1">$25<span className="text-sm font-sans font-normal text-muted-foreground">/mo</span></div>
                             <p className="text-xs text-muted-foreground mb-4">Replit Core Subscription</p>
                             <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    Includes 50GB Storage
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    Unlimited Bandwidth
                                </li>
                             </ul>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-6">
                             <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">AI Inference</div>
                             <div className="text-3xl font-bold font-heading mb-1">$0<span className="text-sm font-sans font-normal text-muted-foreground">/mo</span></div>
                             <p className="text-xs text-muted-foreground mb-4">OpenRouter Free Tier</p>
                             <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    50 reqs/day (Dolphin 3.0 Free)
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                                    Paid tier: ~$0.04/1M tokens
                                </li>
                             </ul>
                        </div>
                         <div className="bg-card border border-border rounded-lg p-6">
                             <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Database</div>
                             <div className="text-3xl font-bold font-heading mb-1">$0<span className="text-sm font-sans font-normal text-muted-foreground">/mo</span></div>
                             <p className="text-xs text-muted-foreground mb-4">PlanetScale Hobby Tier</p>
                             <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    5GB Storage Included
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    1 Billion Row Reads/mo
                                </li>
                             </ul>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
                        <span className="w-2 h-8 bg-green-500 rounded-sm"></span>
                        Security Protocols
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                            <h4 className="font-bold text-green-500 mb-2 font-mono text-sm uppercase">Encryption</h4>
                            <p className="text-xs text-muted-foreground">
                                Data at rest is encrypted using AES-256-GCM. TLS 1.3 is enforced for all transit layers.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                            <h4 className="font-bold text-green-500 mb-2 font-mono text-sm uppercase">Redaction</h4>
                            <p className="text-xs text-muted-foreground">
                                Pre-processing layer strips US SSNs, Credit Cards, and Email addresses via regex + NER models.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                            <h4 className="font-bold text-green-500 mb-2 font-mono text-sm uppercase">Audit Logs</h4>
                            <p className="text-xs text-muted-foreground">
                                Immutable ledger of all system access and query patterns stored in cold storage for 7 years.
                            </p>
                        </div>
                    </div>
                </section>

                 {/* Disclaimer */}
                 <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <strong>Note:</strong> These specifications represent the full enterprise deployment configuration. The current interface is running in a prototype environment with simulated backend connections.
                    </p>
                 </div>

            </div>
         </div>
       </div>
    </Layout>
  );
}
