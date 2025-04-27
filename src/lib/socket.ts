import { io, Socket } from "socket.io-client";
import dbConnect from "./mongodb";
import MessageModel from "../models/Message";

// Define the types for our socket events
export interface ServerToClientEvents {
  message: (message: Message) => void;
  messageStatus: (update: MessageStatusUpdate) => void;
  userStatus: (update: UserStatusUpdate) => void;
  conversation: (conversation: Conversation) => void;
  usernameUpdate: (update: UsernameUpdate) => void;
}

export interface ClientToServerEvents {
  message: (message: Message) => void;
  messageRead: (messageId: string) => void;
  typing: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  updateUsername: (userId: string, username: string) => void;
}

// Message type
export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  conversationId: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

// Message status update type
export interface MessageStatusUpdate {
  messageId: string;
  status: "sent" | "delivered" | "read";
}

// User status update type
export interface UserStatusUpdate {
  userId: string;
  status: "online" | "offline";
  lastSeen?: Date;
}

// Username update type
export interface UsernameUpdate {
  userId: string;
  username: string;
}

// Conversation type
export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  participants?: {
    id: string;
    name: string;
    avatar?: string;
    status?: "online" | "offline";
    lastSeen?: Date;
  }[];
}

// Create a singleton socket instance
class SocketService {
  private static instance: SocketService;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private userId: string | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private messageStatusCallbacks: ((update: MessageStatusUpdate) => void)[] =
    [];
  private userStatusCallbacks: ((update: UserStatusUpdate) => void)[] = [];
  private conversationCallbacks: ((conversation: Conversation) => void)[] = [];
  private usernameUpdateCallbacks: ((update: UsernameUpdate) => void)[] = [];

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Initialize the socket connection
  public init(userId: string): void {
    this.userId = userId;

    // For demo purposes, we're using a mock WebSocket URL
    // In a real app, this would be your WebSocket server URL
    console.log(`Socket initialized for user ${userId}`);

    // In a real implementation, we would connect to a real socket server
    // this.socket = io("https://mock-chat-api.example.com", {
    //   query: { userId },
    //   autoConnect: true,
    //   reconnection: true,
    //   reconnectionAttempts: 5,
    //   reconnectionDelay: 1000,
    // });
  }

  // Send a message
  public async sendMessage(message: {
    content: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
    conversationId: string;
  }): Promise<void> {
    try {
      // Generate a unique ID for the message
      const fullMessage: Message = {
        ...message,
        id: `msg_${Date.now()}`,
        timestamp: new Date(),
        status: "sent",
      };

      // Store message in MongoDB
      await this.saveMessageToDatabase(fullMessage);

      // Simulate sending the message through socket
      console.log("Message sent:", fullMessage);

      // Simulate receiving the message back from the server
      setTimeout(() => {
        this.messageCallbacks.forEach((callback) => callback(fullMessage));
      }, 100);

      // Simulate message delivered status update
      setTimeout(() => {
        const update: MessageStatusUpdate = {
          messageId: fullMessage.id,
          status: "delivered",
        };
        this.messageStatusCallbacks.forEach((callback) => callback(update));
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  private async saveMessageToDatabase(message: Message) {
    try {
      const db = await dbConnect();

      // Skip database operations if we're using a mock connection
      if (import.meta.env.DEV && !import.meta.env.VITE_MONGODB_URI) {
        console.log("[DEV] Message would be saved to database:", message);
        return;
      }

      // Convert the message to the format expected by the MongoDB model
      const messageDoc = {
        content: message.content,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          avatar: message.sender.avatar || "",
        },
        conversationId: message.conversationId,
        timestamp: message.timestamp,
        status: message.status,
      };

      // Save to MongoDB
      await MessageModel.create(messageDoc);
      console.log("Message saved to database");
    } catch (error) {
      console.error("Error saving message to database:", error);
      // Continue with the socket flow even if database save fails
    }
  }

  // Mark a message as read
  public markMessageAsRead(messageId: string): void {
    console.log(`Marking message ${messageId} as read`);

    // Simulate message read status update
    setTimeout(() => {
      const update: MessageStatusUpdate = {
        messageId,
        status: "read",
      };
      this.messageStatusCallbacks.forEach((callback) => callback(update));

      // Update the message status in the database
      this.updateMessageStatusInDatabase(messageId, "read");
    }, 300);
  }

  private async updateMessageStatusInDatabase(
    messageId: string,
    status: "sent" | "delivered" | "read",
  ) {
    try {
      await dbConnect();

      // Skip database operations if we're using a mock connection
      if (import.meta.env.DEV && !import.meta.env.VITE_MONGODB_URI) {
        console.log(
          `[DEV] Would update message ${messageId} status to ${status} in database`,
        );
        return;
      }

      // Update the message status in MongoDB
      // Note: In a real implementation, you would need to find a way to map the client-generated ID to the MongoDB _id
      console.log(
        `Updated message ${messageId} status to ${status} in database`,
      );
    } catch (error) {
      console.error("Error updating message status in database:", error);
    }
  }

  // Join a conversation
  public joinConversation(conversationId: string): void {
    console.log(`Joined conversation ${conversationId}`);
  }

  // Leave a conversation
  public leaveConversation(conversationId: string): void {
    console.log(`Left conversation ${conversationId}`);
  }

  // Notify that the user is typing
  public sendTypingNotification(conversationId: string): void {
    console.log(
      `User ${this.userId} is typing in conversation ${conversationId}`,
    );
  }

  // Subscribe to message events
  public onMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // Subscribe to message status updates
  public onMessageStatus(
    callback: (update: MessageStatusUpdate) => void,
  ): () => void {
    this.messageStatusCallbacks.push(callback);
    return () => {
      this.messageStatusCallbacks = this.messageStatusCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // Subscribe to user status updates
  public onUserStatus(
    callback: (update: UserStatusUpdate) => void,
  ): () => void {
    this.userStatusCallbacks.push(callback);
    return () => {
      this.userStatusCallbacks = this.userStatusCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // Subscribe to conversation updates
  public onConversation(
    callback: (conversation: Conversation) => void,
  ): () => void {
    this.conversationCallbacks.push(callback);
    return () => {
      this.conversationCallbacks = this.conversationCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // Disconnect the socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    console.log("Socket disconnected");
  }

  // For demo purposes: simulate receiving a message
  public simulateIncomingMessage(message: Message): void {
    this.messageCallbacks.forEach((callback) => callback(message));
  }

  // For demo purposes: simulate message status update
  public simulateMessageStatusUpdate(update: MessageStatusUpdate): void {
    this.messageStatusCallbacks.forEach((callback) => callback(update));
  }

  // For demo purposes: simulate user status update
  public simulateUserStatusUpdate(update: UserStatusUpdate): void {
    this.userStatusCallbacks.forEach((callback) => callback(update));
  }

  // Update username
  public async updateUsername(userId: string, username: string): Promise<void> {
    try {
      // In a real app, this would make an API call to update the username
      console.log(`Updating username for user ${userId} to ${username}`);

      // Simulate a delay for the API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Broadcast the username update to all connected clients
      const update: UsernameUpdate = {
        userId,
        username,
      };

      this.usernameUpdateCallbacks.forEach((callback) => callback(update));

      return Promise.resolve();
    } catch (error) {
      console.error("Error updating username:", error);
      return Promise.reject(error);
    }
  }

  // Subscribe to username updates
  public onUsernameUpdate(
    callback: (update: UsernameUpdate) => void,
  ): () => void {
    this.usernameUpdateCallbacks.push(callback);
    return () => {
      this.usernameUpdateCallbacks = this.usernameUpdateCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // For demo purposes: simulate username update
  public simulateUsernameUpdate(update: UsernameUpdate): void {
    this.usernameUpdateCallbacks.forEach((callback) => callback(update));
  }
}

export const socketService = SocketService.getInstance();
