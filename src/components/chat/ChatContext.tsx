import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  socketService,
  Message,
  Conversation,
  UserStatusUpdate,
  MessageStatusUpdate,
  UsernameUpdate,
} from "@/lib/socket";

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  currentUserId: string;
  sendMessage: (content: string) => void;
  selectConversation: (conversationId: string) => void;
  createConversation: (
    type: "direct" | "group",
    participants: string[],
    groupName?: string,
  ) => void;
  markMessageAsRead: (messageId: string) => void;
  updateUsername: (username: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Export the hook as a named constant
const useChatContextHook = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export { useChatContextHook as useChatContext };

interface ChatProviderProps {
  children: ReactNode;
  initialConversations?: Conversation[];
  currentUserId?: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  initialConversations = [],
  currentUserId = "3", // Default user ID for demo
}) => {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    socketService.init(currentUserId);

    // Subscribe to socket events
    const messageUnsubscribe = socketService.onMessage(handleNewMessage);
    const messageStatusUnsubscribe = socketService.onMessageStatus(
      handleMessageStatusUpdate,
    );
    const userStatusUnsubscribe = socketService.onUserStatus(
      handleUserStatusUpdate,
    );
    const conversationUnsubscribe = socketService.onConversation(
      handleConversationUpdate,
    );
    const usernameUpdateUnsubscribe =
      socketService.onUsernameUpdate(handleUsernameUpdate);

    // Load initial messages for each conversation
    initialConversations.forEach((conversation) => {
      // In a real app, you would fetch messages from an API
      // For demo, we'll use empty arrays
      setMessages((prev) => ({
        ...prev,
        [conversation.id]: [],
      }));
    });

    return () => {
      messageUnsubscribe();
      messageStatusUnsubscribe();
      userStatusUnsubscribe();
      conversationUnsubscribe();
      usernameUpdateUnsubscribe();
      socketService.disconnect();
    };
  }, [currentUserId]);

  // Handle new messages
  const handleNewMessage = (message: Message) => {
    // Add message to the appropriate conversation
    setMessages((prev) => {
      const conversationMessages = prev[message.conversationId] || [];
      return {
        ...prev,
        [message.conversationId]: [...conversationMessages, message],
      };
    });

    // Update conversation last message and unread count
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === message.conversationId) {
          const isActive = activeConversationId === conv.id;
          return {
            ...conv,
            lastMessage: message.content,
            timestamp: new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            unreadCount: isActive
              ? 0
              : conv.unreadCount +
                (message.sender.id !== currentUserId ? 1 : 0),
          };
        }
        return conv;
      });
    });

    // If the message is for the active conversation and not from the current user, mark it as read
    if (
      message.conversationId === activeConversationId &&
      message.sender.id !== currentUserId
    ) {
      socketService.markMessageAsRead(message.id);
    }
  };

  // Handle message status updates
  const handleMessageStatusUpdate = (update: MessageStatusUpdate) => {
    setMessages((prev) => {
      const newMessages = { ...prev };

      // Find the conversation that contains this message
      Object.keys(newMessages).forEach((convId) => {
        newMessages[convId] = newMessages[convId].map((msg) => {
          if (msg.id === update.messageId) {
            return { ...msg, status: update.status };
          }
          return msg;
        });
      });

      return newMessages;
    });
  };

  // Handle user status updates
  const handleUserStatusUpdate = (update: UserStatusUpdate) => {
    setConversations((prev) => {
      return prev.map((conv) => {
        if (
          !conv.isGroup &&
          conv.participants?.some((p) => p.id === update.userId)
        ) {
          return {
            ...conv,
            participants: conv.participants.map((p) => {
              if (p.id === update.userId) {
                return {
                  ...p,
                  status: update.status,
                  lastSeen: update.lastSeen,
                };
              }
              return p;
            }),
          };
        }
        return conv;
      });
    });
  };

  // Handle username updates
  const handleUsernameUpdate = (update: UsernameUpdate) => {
    // Update conversations where the user is a participant
    setConversations((prev) => {
      return prev.map((conv) => {
        // Update participants array if it exists
        if (conv.participants) {
          const updatedParticipants = conv.participants.map((p) => {
            if (p.id === update.userId) {
              return { ...p, name: update.username };
            }
            return p;
          });

          // Update conversation name for direct chats with the updated user
          let updatedName = conv.name;
          if (
            !conv.isGroup &&
            conv.participants.some((p) => p.id === update.userId)
          ) {
            // If this is a direct chat where the updated user is a participant
            // and the conversation name matches the old username, update it
            const userParticipant = conv.participants.find(
              (p) => p.id === update.userId,
            );
            if (userParticipant && conv.name === userParticipant.name) {
              updatedName = update.username;
            }
          }

          return {
            ...conv,
            participants: updatedParticipants,
            name: updatedName,
          };
        }
        return conv;
      });
    });

    // Update messages sent by the user
    setMessages((prev) => {
      const newMessages = { ...prev };

      Object.keys(newMessages).forEach((convId) => {
        newMessages[convId] = newMessages[convId].map((msg) => {
          if (msg.sender.id === update.userId) {
            return {
              ...msg,
              sender: {
                ...msg.sender,
                name: update.username,
              },
            };
          }
          return msg;
        });
      });

      return newMessages;
    });
  };

  // Handle conversation updates
  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some((conv) => conv.id === updatedConversation.id);
      if (exists) {
        return prev.map((conv) => {
          if (conv.id === updatedConversation.id) {
            return updatedConversation;
          }
          return conv;
        });
      } else {
        return [...prev, updatedConversation];
      }
    });
  };

  // Select a conversation
  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setLoading(true);
    setError(null);

    // Join the conversation room
    socketService.joinConversation(conversationId);

    // Reset unread count for this conversation
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      });
    });

    // Fetch messages for this conversation from MongoDB
    // For now, we'll use the existing messages in state
    // In a real implementation, you would make an API call here
    setTimeout(() => {
      setLoading(false);
    }, 500);

    // Mark all unread messages in this conversation as read
    if (messages[conversationId]) {
      messages[conversationId].forEach((msg) => {
        if (msg.status !== "read" && msg.sender.id !== currentUserId) {
          socketService.markMessageAsRead(msg.id);
        }
      });
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!activeConversationId || !content.trim()) return;

    const conversation = conversations.find(
      (c) => c.id === activeConversationId,
    );
    if (!conversation) return;

    try {
      // Get the current user's name from the conversations
      let userName = "Current User";
      const currentConversation = conversations.find(
        (c) => c.id === activeConversationId,
      );
      if (currentConversation && currentConversation.participants) {
        const currentUserParticipant = currentConversation.participants.find(
          (p) => p.id === currentUserId,
        );
        if (currentUserParticipant) {
          userName = currentUserParticipant.name;
        }
      }

      await socketService.sendMessage({
        content,
        sender: {
          id: currentUserId,
          name: userName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`,
        },
        conversationId: activeConversationId,
      });
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error sending message:", err);
    }
  };

  // Create a new conversation
  const createConversation = (
    type: "direct" | "group",
    participantIds: string[],
    groupName?: string,
  ) => {
    // In a real app, this would make an API call to create the conversation
    // For demo purposes, we'll create a mock conversation

    const mockUsers = [
      {
        id: "u1",
        name: "Alice Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      },
      {
        id: "u2",
        name: "Bob Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "u3",
        name: "Charlie Davis",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
      },
    ];

    const participants = participantIds.map((id) => {
      const user = mockUsers.find((u) => u.id === id);
      return (
        user || {
          id,
          name: `User ${id}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        }
      );
    });

    // Add current user to participants
    if (!participants.some((p) => p.id === currentUserId)) {
      participants.push({
        id: currentUserId,
        name: "Current User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current",
      });
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      name:
        type === "group"
          ? groupName || "New Group"
          : participants.find((p) => p.id !== currentUserId)?.name || "Chat",
      avatar:
        type === "group"
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
          : participants.find((p) => p.id !== currentUserId)?.avatar,
      lastMessage: "",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unreadCount: 0,
      isGroup: type === "group",
      participants,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setMessages((prev) => ({ ...prev, [newConversation.id]: [] }));
    selectConversation(newConversation.id);
  };

  // Mark a message as read
  const markMessageAsRead = (messageId: string) => {
    socketService.markMessageAsRead(messageId);
  };

  // Update username
  const updateUsername = async (username: string): Promise<void> => {
    try {
      // In a real app, this would make an API call to update the username
      // For demo purposes, we'll update it locally

      // Update conversations where the current user is a participant
      setConversations((prev) => {
        return prev.map((conv) => {
          // Update participants array if it exists
          if (conv.participants) {
            const updatedParticipants = conv.participants.map((p) => {
              if (p.id === currentUserId) {
                return { ...p, name: username };
              }
              return p;
            });

            // Update conversation name for direct chats with the current user
            let updatedName = conv.name;
            if (
              !conv.isGroup &&
              conv.participants.some((p) => p.id === currentUserId)
            ) {
              // If this is a direct chat where the current user is a participant
              // and the conversation name matches the old username, update it
              const currentUserParticipant = conv.participants.find(
                (p) => p.id === currentUserId,
              );
              if (
                currentUserParticipant &&
                conv.name === currentUserParticipant.name
              ) {
                updatedName = username;
              }
            }

            return {
              ...conv,
              participants: updatedParticipants,
              name: updatedName,
            };
          }
          return conv;
        });
      });

      // Update messages sent by the current user
      setMessages((prev) => {
        const newMessages = { ...prev };

        Object.keys(newMessages).forEach((convId) => {
          newMessages[convId] = newMessages[convId].map((msg) => {
            if (msg.sender.id === currentUserId) {
              return {
                ...msg,
                sender: {
                  ...msg.sender,
                  name: username,
                },
              };
            }
            return msg;
          });
        });

        return newMessages;
      });

      // Simulate updating the username in the backend
      await socketService.updateUsername(currentUserId, username);

      return Promise.resolve();
    } catch (error) {
      console.error("Error updating username:", error);
      return Promise.reject(error);
    }
  };

  const value = {
    conversations,
    activeConversationId,
    messages,
    loading,
    error,
    currentUserId,
    sendMessage,
    selectConversation,
    createConversation,
    markMessageAsRead,
    updateUsername,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
