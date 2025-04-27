const router = require("express").Router();
const Chatroom = require("../models/Chatroom");
const Message = require("../models/Message");
const { verifyToken } = require("../middleware/auth");

// Create a new chatroom or get existing one
router.post("/", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if chatroom already exists
    const existingChatroom = await Chatroom.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingChatroom) {
      return res.status(200).json(existingChatroom);
    }

    // Create new chatroom
    const newChatroom = new Chatroom({
      members: [senderId, receiverId],
    });

    const savedChatroom = await newChatroom.save();
    res.status(201).json(savedChatroom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all chatrooms for a user
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const chatrooms = await Chatroom.find({
      members: { $in: [req.params.userId] },
    }).sort({ updatedAt: -1 });

    // Populate with last messages
    const chatroomsWithLastMessage = await Promise.all(
      chatrooms.map(async (chatroom) => {
        const lastMessage = await Message.findOne({
          chatroomId: chatroom._id,
        }).sort({ createdAt: -1 });

        return {
          ...chatroom._doc,
          lastMessage: lastMessage || null,
        };
      }),
    );

    res.status(200).json(chatroomsWithLastMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get a specific chatroom
router.get(
  "/find/:firstUserId/:secondUserId",
  verifyToken,
  async (req, res) => {
    try {
      const chatroom = await Chatroom.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });

      if (!chatroom) {
        return res.status(404).json({ message: "Chatroom not found" });
      }

      res.status(200).json(chatroom);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

module.exports = router;
