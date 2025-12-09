import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, PanelLeftClose, PanelLeft, Heart, Shield, Target, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ConversationList } from "./ConversationList";
import { WellnessPanel } from "./WellnessPanel";
import { PrivacyDashboard } from "./PrivacyDashboard";
import { CoachingHighlights } from "./CoachingHighlights";
import { PsychologicalProfileCard } from "./PsychologicalProfileCard";

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

interface ChatInterfaceProps {
  mode?: "chat" | "therapist";
}

export function ChatInterface({ mode = "chat" }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showWellness, setShowWellness] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCoaching, setShowCoaching] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [coachingEligible, setCoachingEligible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useAuth();
  const userId = user?.id;

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

  const createNewConversation = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mode
        })
      });
      
      if (!response.ok) throw new Error('Failed to create conversation');
      
      const conversation = await response.json();
      setConversationId(conversation.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive"
      });
    }
  };

  const loadConversation = async (id: number) => {
    try {
      setConversationId(id);
      const messagesResponse = await fetch(`/api/messages/${id}`);
      if (messagesResponse.ok) {
        const loadedMessages = await messagesResponse.json();
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!userId || isUserLoading) return;
    
    const initConversation = async () => {
      try {
        setMessages([]);
        setConversationId(null);
        
        const response = await fetch(`/api/conversations?userId=${userId}&mode=${mode}`);
        if (response.ok) {
          const conversations = await response.json();
          if (conversations.length > 0) {
            loadConversation(conversations[0].id);
          } else {
            createNewConversation();
          }
        } else {
          createNewConversation();
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
        createNewConversation();
      }
    };
    
    initConversation();
  }, [userId, isUserLoading, mode]);

  useEffect(() => {
    if (!userId || mode !== "therapist") return;
    
    const checkCoachingEligibility = async () => {
      try {
        const response = await fetch(`/api/coaching/eligibility/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCoachingEligible(data.eligible);
          if (data.eligible && messages.length === 0) {
            setShowProfile(true);
            fetchProfile();
          }
        }
      } catch (error) {
        console.error('Failed to check coaching eligibility:', error);
      }
    };
    
    checkCoachingEligibility();
  }, [userId, mode, messages.length]);

  const fetchProfile = async () => {
    if (!userId) return;
    
    setProfileLoading(true);
    try {
      const response = await fetch(`/api/coaching/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleConfirmProfile = () => {
    toast({
      title: "Profile Confirmed",
      description: "Your psychological profile has been saved. Let's choose your coaching approach!",
    });
  };

  const handleSelectModality = (modality: any) => {
    setShowProfile(false);
    const message = `I'd like to work with you using ${modality.name}. ${modality.reasoning}`;
    setInput(message);
    toast({
      title: `${modality.name} Selected`,
      description: "I'll tailor our sessions using this approach.",
    });
  };

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
    if (!input.trim() || !conversationId || !userId) return;

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
          userId
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
    <div className="flex h-full bg-background relative">
      <AnimatePresence initial={false}>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border bg-card/50 h-full overflow-hidden"
          >
            <ConversationList 
              currentConversationId={conversationId}
              onSelectConversation={loadConversation}
              onNewConversation={createNewConversation}
              mode={mode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-10 border-b border-border/50 flex items-center px-2 bg-background/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            className="h-8 w-8"
            data-testid="button-toggle-sidebar"
          >
            {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            {messages.length > 0 ? `${messages.length} messages` : "Start chatting"}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {mode === "therapist" && (
              <Button
                variant={showCoaching ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowCoaching(!showCoaching)}
                className="h-8 w-8"
                data-testid="button-toggle-coaching"
              >
                <Target className={cn("h-4 w-4", showCoaching && "text-purple-400")} />
              </Button>
            )}
            <Button
              variant={showWellness ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowWellness(!showWellness)}
              className="h-8 w-8"
              data-testid="button-toggle-wellness"
            >
              <Heart className={cn("h-4 w-4", showWellness && "text-rose-400")} />
            </Button>
            <Button
              variant={showPrivacy ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="h-8 w-8"
              data-testid="button-toggle-privacy"
            >
              <Shield className={cn("h-4 w-4", showPrivacy && "text-emerald-400")} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-8" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-8 pb-4">
            {messages.length === 0 && (
              <div className="space-y-6">
                {showProfile && mode === "therapist" ? (
                  <div className="max-w-xl mx-auto">
                    <PsychologicalProfileCard
                      profile={profileData}
                      isLoading={profileLoading}
                      onConfirmProfile={handleConfirmProfile}
                      onDismiss={() => setShowProfile(false)}
                      onSelectModality={handleSelectModality}
                    />
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-4xl mb-4">{mode === "therapist" ? "🎯" : "💬"}</div>
                    <h3 className="text-lg font-medium mb-2">
                      {mode === "therapist" 
                        ? "Welcome to Your Coaching Session" 
                        : "Welcome to Insightful AI"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {mode === "therapist" 
                        ? "I'm your performance coach and psychoanalyst. Let's unlock your potential, understand your motivations, and achieve your goals together."
                        : "I remember everything you tell me across conversations. Share something about yourself and I'll remember it for next time!"}
                    </p>
                    {mode === "therapist" && coachingEligible && !showProfile && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowProfile(true);
                            fetchProfile();
                          }}
                          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                          data-testid="button-view-profile"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          View Your Psychological Profile
                        </Button>
                      </div>
                    )}
                    {mode === "therapist" && (
                      <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        {["Set Goals", "Explore Patterns", "Boost Motivation", "Self-Discovery"].map((topic) => (
                          <button
                            key={topic}
                            onClick={() => setInput(`I want to work on: ${topic}`)}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                            data-testid={`button-topic-${topic.toLowerCase().replace(" ", "-")}`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
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
                      <AvatarFallback className="text-[10px] font-bold text-primary">AI</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%]",
                    msg.role === "user" ? "text-right" : "text-left"
                  )}>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
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
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Insightful AI Secure Environment</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWellness && userId && (
          <WellnessPanel 
            isOpen={showWellness} 
            onClose={() => setShowWellness(false)} 
            userId={userId}
          />
        )}
      </AnimatePresence>

      {userId && (
        <PrivacyDashboard
          isOpen={showPrivacy}
          onClose={() => setShowPrivacy(false)}
          userId={userId}
        />
      )}

      <AnimatePresence>
        {showCoaching && mode === "therapist" && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-border bg-card/50 h-full overflow-y-auto"
          >
            <CoachingHighlights 
              userId={userId}
              onSuggestPrompt={(prompt) => setInput(prompt)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
