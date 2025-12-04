import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Search, 
  Phone, 
  Video,
  MoreVertical,
  CheckCheck,
  Clock,
  Archive,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation, Message, HealthcareProvider, User } from "@shared/schema";

interface ConversationWithProvider extends Conversation {
  provider?: HealthcareProvider;
}

interface MessageWithSender extends Message {
  senderName?: string;
  senderAvatar?: string;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const typedUser = user as User | undefined;
  const { toast } = useToast();

  // WebSocket connection for real-time messaging
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});

  // Initialize WebSocket connection
  useEffect(() => {
    if (!typedUser?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Construct WebSocket URL with proper fallback for development
    const host = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const wsUrl = `${protocol}//${host}:${port}/ws`;
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('Connected to messaging WebSocket');
        // Authenticate with user ID
        websocket.send(JSON.stringify({
          type: 'authenticate',
          userId: typedUser?.id
        }));
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('Disconnected from messaging WebSocket');
        setWs(null);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        websocket.close();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [typedUser?.id]);

  // Join conversation room when conversation is selected
  useEffect(() => {
    if (ws && selectedConversation) {
      ws.send(JSON.stringify({
        type: 'join_conversation',
        conversationId: selectedConversation
      }));
    }
  }, [ws, selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        // Refresh conversations and messages
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
        if (selectedConversation === data.message.conversationId) {
          queryClient.invalidateQueries({ 
            queryKey: ['/api/conversations', selectedConversation, 'messages'] 
          });
        }
        
        // Show toast notification if message is from another user
        if (data.message.senderId !== typedUser?.id) {
          toast({
            title: "New Message",
            description: data.message.content.substring(0, 100),
          });
        }
        break;
        
      case 'user_typing':
        setIsTyping(prev => ({
          ...prev,
          [data.conversationId]: data.isTyping && data.userId !== typedUser?.id
        }));
        break;
        
      case 'message_read':
        // Update read status
        queryClient.invalidateQueries({ 
          queryKey: ['/api/conversations', data.conversationId, 'messages'] 
        });
        break;
    }
  };

  // Query for user conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationWithProvider[]>({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
  });

  // Query for messages in selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) throw new Error('No conversation selected');
      return apiRequest(`/api/conversations/${selectedConversation}/messages`, 'POST', {
        content,
        messageType: 'text'
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', selectedConversation, 'messages'] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Handle sending typing indicators
  const handleTyping = (isTyping: boolean) => {
    if (ws && selectedConversation) {
      ws.send(JSON.stringify({
        type: isTyping ? 'typing_start' : 'typing_stop',
        conversationId: selectedConversation
      }));
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(messageText.trim());
      handleTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.subject?.toLowerCase().includes(searchLower) ||
      conv.provider?.firstName?.toLowerCase().includes(searchLower) ||
      conv.provider?.lastName?.toLowerCase().includes(searchLower) ||
      conv.lastMessagePreview?.toLowerCase().includes(searchLower)
    );
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Healthcare Messages
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  data-testid="input-conversation-search"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {conversationsLoading ? (
                  <div className="space-y-4 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      {searchTerm ? "No conversations found" : "No conversations yet"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Start a conversation with a healthcare provider
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={cn(
                          "flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          selectedConversation === conversation.id && "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500"
                        )}
                        data-testid={`conversation-item-${conversation.id}`}
                      >
                        <Avatar>
                          <AvatarImage src={conversation.provider?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {conversation.provider 
                              ? `${conversation.provider.firstName[0]}${conversation.provider.lastName[0]}` 
                              : 'HC'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium truncate">
                              {conversation.provider 
                                ? `Dr. ${conversation.provider.firstName} ${conversation.provider.lastName}`
                                : conversation.subject || 'Healthcare Provider'}
                            </p>
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(conversation.lastMessageAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {conversation.lastMessagePreview || conversation.subject}
                          </p>
                          {conversation.provider?.specialization && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {conversation.provider.specialization}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages View */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedConv?.provider?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {selectedConv?.provider 
                            ? `${selectedConv.provider.firstName[0]}${selectedConv.provider.lastName[0]}` 
                            : 'HC'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold" data-testid="text-conversation-title">
                          {selectedConv?.provider 
                            ? `Dr. ${selectedConv.provider.firstName} ${selectedConv.provider.lastName}`
                            : 'Healthcare Provider'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedConv?.provider?.specialization || 'Healthcare Professional'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[calc(100vh-20rem)] p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                            <div className="flex items-end space-x-2 max-w-xs">
                              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                              <Skeleton className="h-16 w-48 rounded-lg" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">
                          Start your conversation
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Send a message to begin your healthcare consultation
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isOwnMessage = message.senderId === typedUser?.id;
                          const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                          
                          return (
                            <div 
                              key={message.id} 
                              className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}
                              data-testid={`message-${message.id}`}
                            >
                              <div className={cn("flex items-end space-x-2 max-w-xs md:max-w-md", isOwnMessage && "flex-row-reverse space-x-reverse")}>
                                {!isOwnMessage && showAvatar && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedConv?.provider?.profileImageUrl || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {selectedConv?.provider 
                                        ? `${selectedConv.provider.firstName[0]}${selectedConv.provider.lastName[0]}` 
                                        : 'HC'}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                {!isOwnMessage && !showAvatar && <div className="h-8 w-8" />}
                                
                                <div className={cn("rounded-lg px-4 py-2", 
                                  isOwnMessage 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                )}>
                                  <p className="text-sm">{message.content}</p>
                                  <div className={cn("flex items-center justify-between mt-1 text-xs opacity-70")}>
                                    <span>
                                      {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      }) : 'Now'}
                                    </span>
                                    {isOwnMessage && (
                                      <div className="flex items-center ml-2">
                                        {message.status === 'read' ? (
                                          <CheckCheck className="h-3 w-3" />
                                        ) : (
                                          <Clock className="h-3 w-3" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Typing indicator */}
                        {isTyping[selectedConversation] && (
                          <div className="flex justify-start">
                            <div className="flex items-end space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedConv?.provider?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {selectedConv?.provider 
                                    ? `${selectedConv.provider.firstName[0]}${selectedConv.provider.lastName[0]}` 
                                    : 'HC'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>

                {/* Message Composer */}
                <div className="border-t p-4">
                  <div className="flex items-end space-x-2">
                    <Button variant="ghost" size="sm" className="mb-2">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Textarea
                        data-testid="input-message"
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          if (e.target.value.length === 1) {
                            handleTyping(true);
                          } else if (e.target.value.length === 0) {
                            handleTyping(false);
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        rows={2}
                        className="resize-none"
                        disabled={sendMessageMutation.isPending}
                      />
                    </div>
                    <Button
                      data-testid="button-send-message"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="mb-2"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No Conversation Selected */
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Choose a conversation from the list to start messaging
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/providers'}>
                    Find Healthcare Providers
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}