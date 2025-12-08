import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface Message {
  id: number;
  role: string;
  content: string;
  timestamp: string;
  wasObfuscated?: boolean;
}

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
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

  useEffect(() => {
    const initConversation = async () => {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'anonymous',
            title: 'New Conversation'
          })
        });
        
        if (!response.ok) throw new Error('Failed to create conversation');
        
        const conversation = await response.json();
        setConversationId(conversation.id);
        
        const messagesResponse = await fetch(`/api/messages/${conversation.id}`);
        if (messagesResponse.ok) {
          const loadedMessages = await messagesResponse.json();
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        toast({
          title: "Error",
          description: "Failed to initialize chat session",
          variant: "destructive"
        });
      }
    };
    
    initConversation();
  }, [toast]);

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
    if (!input.trim() || !conversationId) return;

    const optimisticUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticUserMessage]);
    const currentInput = input;
    setInput("");
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: currentInput,
          userId: 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      setMessages(prev => {
        const withoutOptimistic = prev.filter(m => m.id !== optimisticUserMessage.id);
        return [...withoutOptimistic, data.userMessage, data.aiMessage];
      });

      if (data.wasRedacted) {
        toast({
          title: "Privacy Protection Active",
          description: "Sensitive information was detected and redacted from storage",
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
      
      setMessages(prev => prev.filter(m => m.id !== optimisticUserMessage.id));
      setInput(currentInput);
    } finally {
      setIsProcessing(false);
    }
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
                data-testid={`message-${msg.role}-${msg.id}`}
              >
                {msg.role === "assistant" && (
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
                    {msg.wasObfuscated && (
                      <span className="ml-2 text-[10px] opacity-60">[redacted]</span>
                    )}
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
               className="flex flex-col items-start gap-2 ml-12"
               data-testid="processing-indicator"
             >
               <div className="flex items-center gap-2 text-xs text-primary font-mono bg-primary/5 px-2 py-1 rounded border border-primary/10">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  Processing with Venice AI...
               </div>
               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-150"></span>
               </div>
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
              data-testid="button-voice"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none px-2 font-medium"
              data-testid="input-message"
            />
            
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isProcessing} 
              className="rounded-full h-8 w-8 mr-1 bg-primary hover:bg-primary/90 shrink-0"
              data-testid="button-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">TrustHub Secure Environment • Venice AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
