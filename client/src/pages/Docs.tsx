import { Layout } from "@/components/layout/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Docs() {
  return (
    <Layout>
       <div className="flex h-full">
         <div className="w-64 hidden lg:block border-r border-border/50 p-6">
            <h4 className="font-bold mb-4 text-primary">Documentation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="text-foreground font-medium cursor-pointer">Introduction</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Architecture</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Privacy Model</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Data Obfuscation</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Integration Guide</li>
            </ul>
         </div>
         <div className="flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto p-8 space-y-8">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-4">SecureAI Nexus Documentation</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        SecureAI Nexus is a privacy-first artificial intelligence platform designed for enterprise environments where data security is paramount. It employs advanced obfuscation techniques to learn from user interactions without compromising sensitive information.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-heading text-primary">System Architecture</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The system operates on a decentralized node architecture. The central learning core aggregates insights from various application endpoints but never stores raw data.
                    </p>
                    <div className="p-4 bg-muted/30 rounded border border-border/50 font-mono text-sm">
                        User Input -&gt; <span className="text-yellow-500">Obfuscation Layer</span> -&gt; Vector Embedding -&gt; Knowledge Graph
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-heading text-primary">Privacy Measures</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We implement a multi-layered approach to privacy:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li><strong className="text-foreground">PII Redaction:</strong> Regex and NLP-based detection of personally identifiable information.</li>
                        <li><strong className="text-foreground">Differential Privacy:</strong> Noise injection to prevent reverse-engineering of training data.</li>
                        <li><strong className="text-foreground">Access Control:</strong> Role-based access to the knowledge graph visualization.</li>
                    </ul>
                </div>
            </div>
         </div>
       </div>
    </Layout>
  );
}
