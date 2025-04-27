import mongoose from "mongoose";

// Define the Conversation schema
const ConversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Conversation name is required"],
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        userId: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
          default: "",
        },
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Create indexes for common queries
ConversationSchema.index({ participants: 1 });

// Export the Conversation model
let Conversation;
try {
  // Check if the model is already defined
  Conversation = mongoose.models.Conversation;
} catch {
  // If not, define it
  Conversation = mongoose.model("Conversation", ConversationSchema);
}

export default Conversation;
