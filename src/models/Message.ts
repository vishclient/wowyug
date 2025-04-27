import mongoose from "mongoose";

// Define the Message schema
const MessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    sender: {
      id: {
        type: String,
        required: [true, "Sender ID is required"],
      },
      name: {
        type: String,
        required: [true, "Sender name is required"],
      },
      avatar: {
        type: String,
        default: "",
      },
    },
    conversationId: {
      type: String,
      required: [true, "Conversation ID is required"],
      index: true, // Index for faster queries by conversationId
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Create indexes for common queries
MessageSchema.index({ conversationId: 1, timestamp: 1 });

// Export the Message model
let Message;
try {
  // Check if the model is already defined
  Message = mongoose.models.Message;
} catch {
  // If not, define it
  Message = mongoose.model("Message", MessageSchema);
}

export default Message;
