import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  connect(userId) {
    this.userId = userId;
    this.socket = io(SOCKET_URL);

    // Add user to online users list
    this.socket.emit("addUser", userId);

    console.log("Socket connected");
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log("Socket disconnected");
    }
  }

  sendMessage(message) {
    if (this.socket) {
      this.socket.emit("sendMessage", message);
    }
  }

  onGetMessage(callback) {
    if (this.socket) {
      this.socket.on("getMessage", (message) => {
        // Make sure the message has a senderUsername
        const enhancedMessage = {
          ...message,
          senderUsername: message.senderUsername || "Unknown User",
        };
        callback(enhancedMessage);
      });
    }
  }

  onGetUsers(callback) {
    if (this.socket) {
      this.socket.on("getUsers", (users) => {
        callback(users);
      });
    }
  }

  removeListeners() {
    if (this.socket) {
      this.socket.off("getMessage");
      this.socket.off("getUsers");
    }
  }
}

export default new SocketService();
