import dbConnect from "./mongodb";
import User from "../models/User";
import Conversation from "../models/Conversation";
import Message from "../models/Message";

// User API functions
export const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
  name: string;
}) => {
  await dbConnect();
  const user = await User.create(userData);
  return user;
};

export const findUserByUsername = async (username: string) => {
  await dbConnect();
  const user = await User.findOne({ username });
  return user;
};

export const findUserByEmail = async (email: string) => {
  await dbConnect();
  const user = await User.findOne({ email });
  return user;
};

export const updateUserStatus = async (
  userId: string,
  status: "online" | "offline",
) => {
  await dbConnect();
  const user = await User.findByIdAndUpdate(
    userId,
    { status, lastSeen: status === "offline" ? new Date() : undefined },
    { new: true },
  );
  return user;
};

export const updateUsername = async (userId: string, username: string) => {
  await dbConnect();
  const user = await User.findByIdAndUpdate(
    userId,
    { username },
    { new: true },
  );
  return user;
};

// Conversation API functions
export const createConversation = async (conversationData: {
  name: string;
  isGroup: boolean;
  participants: Array<{ userId: string; username: string; avatar?: string }>;
}) => {
  await dbConnect();
  const conversation = await Conversation.create(conversationData);
  return conversation;
};

export const findConversationsByUserId = async (userId: string) => {
  await dbConnect();
  const conversations = await Conversation.find({
    "participants.userId": userId,
  });
  return conversations;
};

export const findDirectConversation = async (userIds: string[]) => {
  await dbConnect();
  const conversation = await Conversation.findOne({
    isGroup: false,
    participants: {
      $all: userIds.map((id) => ({ $elemMatch: { userId: id } })),
      $size: userIds.length,
    },
  });
  return conversation;
};

export const updateConversationLastMessage = async (
  conversationId: string,
  lastMessage: string,
) => {
  await dbConnect();
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { lastMessage, lastMessageTime: new Date() },
    { new: true },
  );
  return conversation;
};

// Message API functions
export const getMessagesByConversationId = async (conversationId: string) => {
  await dbConnect();
  const messages = await Message.find({ conversationId }).sort({
    timestamp: 1,
  });
  return messages;
};

export const createMessage = async (messageData: {
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  conversationId: string;
  status: "sent" | "delivered" | "read";
}) => {
  await dbConnect();
  const message = await Message.create({
    ...messageData,
    timestamp: new Date(),
  });

  // Update the conversation's last message
  await updateConversationLastMessage(
    messageData.conversationId,
    messageData.content,
  );

  return message;
};

export const updateMessageStatus = async (
  messageId: string,
  status: "sent" | "delivered" | "read",
) => {
  await dbConnect();
  const message = await Message.findByIdAndUpdate(
    messageId,
    { status },
    { new: true },
  );
  return message;
};
