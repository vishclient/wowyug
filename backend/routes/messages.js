const router = require("express").Router();
const Message = require("../models/Message");
const Chatroom = require("../models/Chatroom");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

// Add a new message
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    // Get sender information to include username
    const sender = await User.findById(req.body.senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const newMessage = new Message({
      chatroomId: req.body.chatroomId,
      senderId: req.body.senderId,
      senderUsername: sender.username, // Include sender's username
      text: req.body.text || "",
      fileUrl: req.file ? `/images/${req.file.filename}` : "",
    });

    const savedMessage = await newMessage.save();

    // Update the chatroom's lastMessage and updatedAt
    await Chatroom.findByIdAndUpdate(req.body.chatroomId, {
      lastMessage: savedMessage._id,
      updatedAt: new Date(),
    });

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get messages for a chatroom
router.get("/:chatroomId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      chatroomId: req.params.chatroomId,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Mark messages as read
router.put("/read/:chatroomId", verifyToken, async (req, res) => {
  try {
    await Message.updateMany(
      {
        chatroomId: req.params.chatroomId,
        senderId: { $ne: req.body.userId },
        read: false,
      },
      { $set: { read: true } },
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
