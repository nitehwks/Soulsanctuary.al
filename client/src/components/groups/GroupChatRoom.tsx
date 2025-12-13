import { useState, useEffect, useRef } from "react";
import { Send, Users, ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group, GroupMember, GroupMessage } from "@shared/schema";

interface GroupChatRoomProps {
  group: Group;
  anonUserHash: string;
  displayName: string;
  onLeave: () => void;
}

export function GroupChatRoom({ group, anonUserHash, displayName, onLeave }: GroupChatRoomProps) {
  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages = [], isLoading: messagesLoading } = useQuery<GroupMessage[]>({
    queryKey: ['/api/groups', group.id, 'messages'],
    refetchInterval: 5000,
  });

  const { data: members = [] } = useQuery<GroupMember[]>({
    queryKey: ['/api/groups', group.id, 'members'],
    refetchInterval: 10000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', `/api/groups/${group.id}/messages`, {
        anonUserHash,
        message
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups', group.id, 'messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

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
    if (!input.trim() || sendMessageMutation.isPending) return;
    const messageText = input.trim();
    setInput("");
    sendMessageMutation.mutate(messageText);
  };

  const getMemberName = (hash: string) => {
    const member = members.find(m => m.anonUserHash === hash);
    return member?.displayName || 'Anonymous';
  };

  const getAvatarColor = (hash: string) => {
    const colors = [
      'bg-rose-500/20 text-rose-400',
      'bg-blue-500/20 text-blue-400',
      'bg-emerald-500/20 text-emerald-400',
      'bg-amber-500/20 text-amber-400',
      'bg-purple-500/20 text-purple-400',
      'bg-cyan-500/20 text-cyan-400',
    ];
    const index = hash.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            data-testid="button-leave-group"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate" data-testid="text-group-name">
              {group.name}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {group.memberCount} members
            </p>
          </div>
          <Button
            variant={showMembers ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowMembers(!showMembers)}
            data-testid="button-toggle-members"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">No messages yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Be the first to start the conversation</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isOwn = msg.anonUserHash === anonUserHash;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                        data-testid={`message-group-${msg.id}`}
                      >
                        {!isOwn && (
                          <Avatar className={cn("h-8 w-8 border", getAvatarColor(msg.anonUserHash))}>
                            <AvatarFallback className="text-[10px] font-bold">
                              {getMemberName(msg.anonUserHash).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn(
                          "max-w-[70%]",
                          isOwn ? "text-right" : "text-left"
                        )}>
                          {!isOwn && (
                            <span className="text-xs text-muted-foreground mb-1 block">
                              {getMemberName(msg.anonUserHash)}
                            </span>
                          )}
                          <div className={cn(
                            "px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap",
                            isOwn 
                              ? "bg-primary text-primary-foreground rounded-br-sm" 
                              : "bg-muted text-foreground rounded-bl-sm"
                          )}>
                            {msg.message}
                          </div>
                          <span className="text-[10px] text-muted-foreground/50 mt-1 block">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>

          <AnimatePresence>
            {showMembers && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-border bg-card/30 overflow-hidden"
              >
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                    Members ({members.length})
                  </h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center gap-2"
                        data-testid={`member-${member.id}`}
                      >
                        <Avatar className={cn("h-6 w-6", getAvatarColor(member.anonUserHash))}>
                          <AvatarFallback className="text-[8px]">
                            {(member.displayName || 'AN').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate">
                          {member.displayName}
                          {member.anonUserHash === anonUserHash && (
                            <span className="text-muted-foreground ml-1">(you)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-3 border-t border-border bg-card/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
              data-testid="input-group-message"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || sendMessageMutation.isPending}
              data-testid="button-send-group-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface GroupListProps {
  onSelectGroup: (group: Group, anonUserHash: string, displayName: string) => void;
}

export function GroupList({ onSelectGroup }: GroupListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("general");
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const { toast } = useToast();

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; description: string | null; category: string }) => {
      const response = await apiRequest('POST', '/api/groups', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setShowCreateDialog(false);
      setNewGroupName("");
      setNewGroupDescription("");
      toast({
        title: "Group Created",
        description: "Your group has been created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive"
      });
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async ({ groupId, anonUserHash, displayName }: { groupId: number; anonUserHash: string; displayName: string }) => {
      const response = await apiRequest('POST', `/api/groups/${groupId}/join`, {
        anonUserHash,
        displayName
      });
      return response.json();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join group",
        variant: "destructive"
      });
    }
  });

  const generateAnonHash = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  };

  const getStoredAnonHash = () => {
    let hash = localStorage.getItem('groupAnonHash');
    if (!hash) {
      hash = generateAnonHash();
      localStorage.setItem('groupAnonHash', hash);
    }
    return hash;
  };

  const getStoredDisplayName = () => {
    return localStorage.getItem('groupDisplayName') || '';
  };

  const setStoredDisplayName = (name: string) => {
    localStorage.setItem('groupDisplayName', name);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroupMutation.mutate({
      name: newGroupName.trim(),
      description: newGroupDescription.trim() || null,
      category: newGroupCategory
    });
  };

  const handleJoinGroup = async (group: Group) => {
    const anonHash = getStoredAnonHash();
    const storedName = getStoredDisplayName();
    
    if (!storedName && !displayNameInput.trim()) {
      setJoiningGroupId(group.id);
      return;
    }

    const displayName = storedName || displayNameInput.trim();
    if (displayNameInput.trim()) {
      setStoredDisplayName(displayNameInput.trim());
    }

    try {
      const result = await joinGroupMutation.mutateAsync({
        groupId: group.id,
        anonUserHash: anonHash,
        displayName
      });
      setJoiningGroupId(null);
      setDisplayNameInput("");
      onSelectGroup(group, anonHash, result.member.displayName);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const categories = [
    { value: "general", label: "General" },
    { value: "anxiety", label: "Anxiety Support" },
    { value: "depression", label: "Depression Support" },
    { value: "grief", label: "Grief & Loss" },
    { value: "faith", label: "Faith & Spirituality" },
    { value: "recovery", label: "Recovery" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-groups-title">Support Groups</h1>
          <p className="text-muted-foreground text-sm">
            Join anonymous peer support groups
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-group">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {showCreateDialog && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Create New Group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name..."
                data-testid="input-new-group-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (optional)</label>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="What is this group about?"
                data-testid="input-new-group-description"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={newGroupCategory}
                onChange={(e) => setNewGroupCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="select-new-group-category"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end flex-wrap">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup} 
                disabled={!newGroupName.trim() || createGroupMutation.isPending} 
                data-testid="button-confirm-create-group"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No groups available</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Create the first group to get started
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => handleJoinGroup(group)}
              data-testid={`card-group-${group.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate" data-testid={`text-group-name-${group.id}`}>
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.memberCount} members
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {group.messageCount} messages
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {categories.find(c => c.value === group.category)?.label || group.category}
                  </Badge>
                </div>

                {joiningGroupId === group.id && (
                  <div className="mt-4 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm font-medium mb-2 block">
                      Choose your display name
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        placeholder="Anonymous name..."
                        className="flex-1"
                        data-testid="input-display-name"
                      />
                      <Button 
                        onClick={() => handleJoinGroup(group)}
                        disabled={!displayNameInput.trim() || joinGroupMutation.isPending}
                        data-testid="button-confirm-join"
                      >
                        {joinGroupMutation.isPending ? "Joining..." : "Join"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your identity remains private
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
