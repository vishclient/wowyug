const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatroomId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", MessageSchema);
