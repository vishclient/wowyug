const mongoose = require("mongoose");

const ChatroomSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chatroom", ChatroomSchema);
