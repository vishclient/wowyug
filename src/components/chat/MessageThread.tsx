import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, CheckCheck, Send, Paperclip, Smile, User } from "lucide-react";
import { useChatContext } from "./ChatContext";
import { Message as MessageType } from "@/lib/socket";

interface MessageThreadProps {
  conversationId?: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversationId,
    messages,
    loading,
    error,
    sendMessage,
    selectConversation,
    markMessageAsRead,
    currentUserId,
  } = useChatContext();

  // Find the active conversation
  const conversation = conversations.find(
    (c) => c.id === (conversationId || activeConversationId),
  );

  // Get messages for the active conversation
  const conversationMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  // Set the active conversation when the conversationId prop changes
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId, activeConversationId, selectConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [conversationMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageStatus = (status: MessageType["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="h-4 w-4 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // If no conversation is selected, show a placeholder
  if (!conversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background border rounded-lg">
        <p className="text-muted-foreground">
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background border rounded-lg">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background border rounded-lg">
        <p className="text-red-500 mb-2">{error}</p>
        <Button
          onClick={() => selectConversation(conversation.id)}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 md:p-4 border-b flex items-center justify-between bg-card">
        <div className="flex items-center space-x-3">
          {conversation.isGroup ? (
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={conversation.participants?.[0]?.avatar} />
                <AvatarFallback>
                  {conversation.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              {conversation.participants &&
                conversation.participants.length > 1 && (
                  <Avatar className="h-6 w-6 absolute -bottom-1 -right-1 border-2 border-background">
                    <AvatarImage src={conversation.participants[1]?.avatar} />
                    <AvatarFallback>
                      +{conversation.participants.length - 1}
                    </AvatarFallback>
                  </Avatar>
                )}
            </div>
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  conversation.participants?.find((p) => p.id !== currentUserId)
                    ?.avatar
                }
              />
              <AvatarFallback>
                {conversation.participants
                  ?.find((p) => p.id !== currentUserId)
                  ?.name.substring(0, 2) || "UN"}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <h3 className="font-medium">{conversation.name}</h3>
            <p className="text-xs text-muted-foreground">
              {conversation.isGroup
                ? `${conversation.participants?.length || 0} participants`
                : conversation.participants?.find((p) => p.id !== currentUserId)
                      ?.status === "online"
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {conversationMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">
                Send a message to start the conversation
              </p>
            </div>
          ) : (
            conversationMessages.map((message) => {
              const isOwn = message.sender.id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                    {!isOwn && (
                      <Avatar className="h-8 w-8 hidden sm:block">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback>
                          {message.sender.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-medium mb-1 sm:hidden">
                          {message.sender.name}
                        </p>
                      )}
                      <p className="text-sm break-words">{message.content}</p>
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {isOwn && renderMessageStatus(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Message Input */}
      <div className="p-3 md:p-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hidden sm:flex"
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 focus:ring-2 focus:ring-primary/20"
        />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hidden sm:flex"
        >
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90"
          disabled={!newMessage.trim() || !activeConversationId}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageThread;
