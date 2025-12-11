import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, PanelLeftClose, PanelLeft, Heart, Shield, Target, Brain, Paperclip, Camera, X, FileText, Image as ImageIcon, HelpCircle } from "lucide-react";
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
import { AboutDialog } from "../AboutDialog";
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

interface SmartReply {
  id: string;
  text: string;
  type: 'affirmative' | 'negative' | 'question' | 'emotional' | 'action' | 'continue';
}

interface ChatInterfaceProps {
  mode?: "chat" | "therapist";
  onModelsUsed?: (models: string[]) => void;
}

export function ChatInterface({ mode = "chat", onModelsUsed }: ChatInterfaceProps) {
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
  const [smartReplies, setSmartReplies] = useState<SmartReply[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      toast({
        title: "File attached",
        description: `${file.name} ready to send`,
      });
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      toast({
        title: "Photo captured",
        description: "Photo ready to send",
      });
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || !conversationId || !userId) return;

    const fileToSend = selectedFile;
    const filePreviewToSend = filePreview;
    const messageContent = selectedFile 
      ? `${input || ""}${input ? "\n\n" : ""}[Attached: ${selectedFile.name}]`
      : input;

    const optimisticUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticUserMessage]);
    const currentInput = input;
    setInput("");
    clearSelectedFile();
    setIsProcessing(true);

    try {
      let attachmentData = null;
      
      // If there's a file, upload it first (preview may be null for non-image files)
      if (fileToSend) {
        try {
          // For non-image files without preview, read as base64
          let fileData = filePreviewToSend;
          if (!fileData) {
            const reader = new FileReader();
            fileData = await new Promise<string>((resolve, reject) => {
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(fileToSend);
            });
          }

          const uploadResponse = await fetch('/api/attachments/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              fileName: fileToSend.name,
              fileType: fileToSend.type,
              fileSize: fileToSend.size,
              fileData,
            })
          });

          if (uploadResponse.ok) {
            attachmentData = await uploadResponse.json();
          } else {
            toast({
              title: "Upload failed",
              description: "Could not upload the file",
              variant: "destructive"
            });
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          toast({
            title: "Upload error",
            description: "Failed to process the file",
            variant: "destructive"
          });
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: currentInput,
          userId,
          attachment: attachmentData
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

      // Store smart replies for display
      if (data.smartReplies && data.smartReplies.length > 0) {
        setSmartReplies(data.smartReplies);
      } else {
        setSmartReplies([]);
      }

      // Report models used to parent
      if (data.modelsUsed && onModelsUsed) {
        onModelsUsed(data.modelsUsed);
      }

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

  const handleSmartReplyClick = (reply: SmartReply) => {
    setInput(reply.text);
    setSmartReplies([]);
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
            <AboutDialog 
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  data-testid="button-about"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              }
            />
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
                        ? "Welcome to Your Sanctuary" 
                        : "Welcome to SoulSanctuary"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {mode === "therapist" 
                        ? "I'm here to walk alongside you with faith, wisdom, and proven practices. Together, we'll work toward your healing and growth - helping you find strength and independence through life's challenges."
                        : "Your story matters to me. I'm here to truly know you - your joys, struggles, and dreams - so I can serve you better with each conversation."}
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
                    Processing with AI...
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
            {/* Smart Reply Suggestions */}
            <AnimatePresence>
              {smartReplies.length > 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap gap-2 mb-3 justify-center"
                >
                  {smartReplies.map((reply) => (
                    <Button
                      key={reply.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSmartReplyClick(reply)}
                      className={cn(
                        "rounded-full text-xs font-medium transition-all hover:scale-105",
                        reply.type === 'affirmative' && "border-green-500/50 hover:bg-green-500/10 hover:text-green-600",
                        reply.type === 'negative' && "border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-600",
                        reply.type === 'question' && "border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-600",
                        reply.type === 'emotional' && "border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-600",
                        reply.type === 'action' && "border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600",
                        reply.type === 'continue' && "border-gray-500/50 hover:bg-gray-500/10"
                      )}
                      data-testid={`smart-reply-${reply.id}`}
                    >
                      {reply.text}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* File Preview */}
            {selectedFile && (
              <div className="mb-2 p-2 bg-muted/50 rounded-lg flex items-center gap-2">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                ) : (
                  <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={clearSelectedFile}
                  data-testid="button-clear-file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 items-center bg-card border border-input rounded-full px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring"
            >
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
                data-testid="input-camera"
              />

              {/* File upload button */}
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 ml-1 hover:bg-blue-500/10 hover:text-blue-500"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-attach"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {/* Camera button */}
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 hover:bg-purple-500/10 hover:text-purple-500"
                onClick={() => cameraInputRef.current?.click()}
                data-testid="button-camera"
              >
                <Camera className="h-4 w-4" />
              </Button>

              {/* Voice button */}
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className={cn("rounded-full h-8 w-8", isListening && "text-red-500 animate-pulse bg-red-500/10")}
                onClick={toggleListening}
                data-testid="button-voice"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Input 
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.length > 0) setSmartReplies([]);
                }}
                placeholder={selectedFile ? "Add a message about this file..." : "Ask anything..."}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none px-2 font-medium"
                data-testid="input-message"
              />
              
              <Button 
                type="submit" 
                size="icon" 
                disabled={(!input.trim() && !selectedFile) || isProcessing} 
                className="rounded-full h-8 w-8 mr-1 bg-primary hover:bg-primary/90 shrink-0"
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">SoulSanctuary Secure Environment</span>
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
