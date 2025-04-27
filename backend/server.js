const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Import models and routes
const User = require("./models/User");
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const chatroomsRoute = require("./routes/chatrooms");
const messagesRoute = require("./routes/messages");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "uploads/images")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/chatrooms", chatroomsRoute);
app.use("/api/messages", messagesRoute);

// Socket.io logic
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Add a user to online users
  socket.on("addUser", (userId) => {
    // Remove user if already in the list (in case of reconnection)
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);

    // Add user to online users
    onlineUsers.push({
      userId,
      socketId: socket.id,
    });

    // Broadcast online users to all connected clients
    io.emit("getUsers", onlineUsers);
    console.log("Online users:", onlineUsers);
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      const receiver = onlineUsers.find((user) => user.userId === receiverId);

      // Get sender information to include username in the message
      const sender = await User.findById(senderId);

      if (receiver) {
        io.to(receiver.socketId).emit("getMessage", {
          senderId,
          senderUsername: sender.username,
          text,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error("Error sending message via socket:", err);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", onlineUsers);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
