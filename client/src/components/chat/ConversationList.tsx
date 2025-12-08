import { useState, useEffect } from "react";
import { MessageSquare, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/contexts/UserContext";

interface Conversation {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConversationListProps {
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  mode?: "chat" | "therapist";
}

export function ConversationList({ 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  mode = "chat"
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();
  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setConversations([]);
      return;
    }
    
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/conversations?userId=${userId}&mode=${mode}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [currentConversationId, userId, mode]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <Button 
          onClick={onNewConversation}
          className="w-full justify-start gap-2"
          variant="outline"
          size="sm"
          data-testid="button-new-conversation"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-2 group",
                  currentConversationId === conv.id 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-foreground"
                )}
                data-testid={`conversation-item-${conv.id}`}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {conv.title || "New Conversation"}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
