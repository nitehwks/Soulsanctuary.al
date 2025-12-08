import { useState, useEffect, useRef } from "react";
import { Send, Cpu, Lock, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  isObfuscated?: boolean;
  originalContent?: string;
  learningStatus?: "processing" | "learned" | "none";
}

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "SecureAI Nexus initialized. I am ready to process sensitive data with advanced obfuscation protocols. How can I assist you today?",
      timestamp: new Date().toISOString(),
      learningStatus: "none"
    }
  ]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      learningStatus: "none"
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate AI processing and obfuscation
    setTimeout(() => {
      // Check for sensitive data simulation (email, phone, etc)
      const hasSensitive = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b|\d{3}-\d{3}-\d{4}/.test(input);
      
      if (hasSensitive) {
         setMessages(prev => prev.map(m => 
           m.id === userMessage.id 
             ? { ...m, isObfuscated: true, originalContent: m.content, content: m.content.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g, "[EMAIL_REDACTED]").replace(/\d{3}-\d{3}-\d{4}/g, "[PHONE_REDACTED]") }
             : m
         ));
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: hasSensitive 
          ? "I have detected sensitive information in your request. It has been automatically redacted before processing. I have updated my knowledge base with the generalized context."
          : "I've processed that information and updated the central knowledge graph. Is there anything else you'd like to analyze?",
        timestamp: new Date().toISOString(),
        learningStatus: "learned"
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      <Card className="flex-1 bg-background/50 backdrop-blur border-border/50 overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-sm text-muted-foreground">Secure Channel: ENCRYPTED (AES-256)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-mono">
            <Cpu className="h-3 w-3" />
            <span>LEARNING MODE: ACTIVE</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-4 max-w-[80%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <Avatar className={cn("h-8 w-8 border border-border", msg.role === "ai" ? "border-primary/50" : "border-white/10")}>
                    <AvatarFallback className={msg.role === "ai" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>
                      {msg.role === "ai" ? "AI" : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "flex flex-col gap-1",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-lg text-sm leading-relaxed shadow-sm",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted/50 border border-border/50 text-foreground rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                    
                    {msg.isObfuscated && (
                      <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-mono mt-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                        <Lock className="h-3 w-3" />
                        <span>DATA OBFUSCATED FOR PRIVACY</span>
                      </div>
                    )}
                    
                    {msg.learningStatus === "learned" && (
                      <div className="flex items-center gap-1 text-[10px] text-primary font-mono mt-1 opacity-70">
                        <RefreshCw className="h-3 w-3" />
                        <span>KNOWLEDGE UPDATED</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isProcessing && (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }}
                 className="flex items-center gap-2 text-xs text-muted-foreground font-mono ml-12"
               >
                 <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
                 <span className="ml-2">Analyzing & Redacting...</span>
               </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background/50 border-t border-border/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="bg-muted/30 border-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 font-sans"
            />
            <Button type="submit" size="icon" disabled={isProcessing} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_10px_rgba(0,255,255,0.2)]">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 text-[10px] text-muted-foreground text-center font-mono">
             Disclaimer: All inputs are monitored for PII and automatically redacted before storage.
          </div>
        </div>
      </Card>
    </div>
  );
}
