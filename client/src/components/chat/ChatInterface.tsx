import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, StopCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Web Speech API Types
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  isObfuscated?: boolean;
}

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "TrustHub connected. I'm running on Dolphin 3 with enhanced privacy protocols. How can I assist you?",
      timestamp: new Date().toISOString(),
    }
  ]);

  useEffect(() => {
    // Initialize Speech Recognition
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate Dolphin 3 AI processing
    setTimeout(() => {
      const hasSensitive = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b|\d{3}-\d{3}-\d{4}/.test(userMessage.content);
      
      let responseContent = "I've processed your request using the Dolphin 3 8B parameter model.";
      if (hasSensitive) {
          responseContent = "I noticed some sensitive contact information in your message. Per TrustHub protocols, this has been redacted from my long-term memory store.";
      } else if (userMessage.content.toLowerCase().includes("database") || userMessage.content.toLowerCase().includes("planetscale")) {
          responseContent = "I can structure that data for PlanetScale. Would you like me to generate the schema for this interaction?";
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: responseContent,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <ScrollArea className="flex-1 px-4 py-8" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-8 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "ai" && (
                  <Avatar className="h-8 w-8 border border-border bg-background">
                    <AvatarFallback className="text-[10px] font-bold text-primary">D3</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[80%]",
                  msg.role === "user" ? "text-right" : "text-left"
                )}>
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 opacity-50">
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                {msg.role === "user" && (
                   <Avatar className="h-8 w-8 border border-border bg-muted">
                    <AvatarFallback className="text-[10px]">ME</AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="flex items-center gap-2 text-xs text-muted-foreground ml-12"
             >
               <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-75"></span>
               <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-150"></span>
             </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-background/80 backdrop-blur-sm sticky bottom-0 z-10 border-t border-border/40">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 items-center bg-card border border-input rounded-full px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring"
          >
             <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className={cn("rounded-full h-8 w-8 ml-1", isListening && "text-red-500 animate-pulse bg-red-500/10")}
              onClick={toggleListening}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dolphin 3..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none px-2 font-medium"
            />
            
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isProcessing} 
              className="rounded-full h-8 w-8 mr-1 bg-primary hover:bg-primary/90 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">TrustHub Secure Environment • Dolphin 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
