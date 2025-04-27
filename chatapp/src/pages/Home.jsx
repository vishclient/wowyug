import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { chatroomsAPI, messagesAPI } from "../services/api";
import socketService from "../services/socket";

// Components
import SidebarChat from "../components/SidebarChat";
import Message from "../components/Message";
import AddAmigo from "../components/AddAmigo";

// Material UI imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  Avatar,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Picker from "emoji-picker-react";

const Home = () => {
  const { user, dispatch: authDispatch } = useContext(AuthContext);
  const {
    chatrooms,
    currentChat,
    messages,
    onlineUsers,
    isFetching,
    dispatch: chatDispatch,
  } = useContext(ChatContext);

  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddAmigo, setShowAddAmigo] = useState(false);

  const scrollRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawerWidth = 320;

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const socket = socketService.connect(user._id);

      // Listen for incoming messages
      socketService.onGetMessage((message) => {
        chatDispatch({
          type: "ADD_MESSAGE",
          payload: {
            senderId: message.senderId,
            senderUsername: message.senderUsername,
            text: message.text,
            createdAt: message.createdAt,
          },
        });
      });

      // Listen for online users updates
      socketService.onGetUsers((users) => {
        chatDispatch({
          type: "SET_ONLINE_USERS",
          payload: users,
        });
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user, chatDispatch]);

  // Fetch user's chatrooms
  useEffect(() => {
    const fetchChatrooms = async () => {
      if (!user) return;

      try {
        chatDispatch({ type: "FETCH_START" });
        const res = await chatroomsAPI.getUserChatrooms(user._id);
        chatDispatch({ type: "SET_CHATROOMS", payload: res.data });
      } catch (err) {
        console.error("Error fetching chatrooms:", err);
        chatDispatch({
          type: "FETCH_ERROR",
          payload: "Failed to load chatrooms",
        });
      }
    };

    fetchChatrooms();
  }, [user, chatDispatch]);

  // Fetch messages when current chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;

      try {
        chatDispatch({ type: "FETCH_START" });
        const res = await messagesAPI.getMessages(currentChat._id);
        chatDispatch({ type: "SET_MESSAGES", payload: res.data });

        // Mark messages as read
        await messagesAPI.markAsRead(currentChat._id, user._id);
      } catch (err) {
        console.error("Error fetching messages:", err);
        chatDispatch({
          type: "FETCH_ERROR",
          payload: "Failed to load messages",
        });
      }
    };

    fetchMessages();
  }, [currentChat, user, chatDispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    const receiverId = currentChat.members.find(
      (member) => member !== user._id,
    );

    // Emit socket event
    socketService.sendMessage({
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      // Save message to database
      const res = await messagesAPI.sendMessage({
        chatroomId: currentChat._id,
        senderId: user._id,
        text: newMessage,
      });

      // Make sure the message has the sender's username
      const messageWithUsername = {
        ...res.data,
        senderUsername: user.username || "You",
      };

      chatDispatch({ type: "ADD_MESSAGE", payload: messageWithUsername });
      setNewMessage("");
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  // Handle logout
  const handleLogout = () => {
    socketService.disconnect();
    authDispatch({ type: "LOGOUT" });
  };

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            {currentChat && (
              <>
                <Avatar
                  src={currentChat.profilePicture}
                  alt="Chat"
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6" noWrap component="div">
                  {currentChat.name || "Chat"}
                </Typography>
                {onlineUsers.some(
                  (u) =>
                    u.userId ===
                    currentChat.members.find((m) => m !== user._id),
                ) && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "success.main",
                      ml: 1,
                    }}
                  />
                )}
              </>
            )}
          </Box>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <Toolbar>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={user?.profilePicture}
                  alt={user?.username}
                  sx={{ mr: 2 }}
                />
                <Typography variant="subtitle1" noWrap>
                  {user?.username}
                </Typography>
              </Box>
              <Button
                startIcon={<PersonAddIcon />}
                onClick={() => setShowAddAmigo(true)}
                size="small"
              >
                Add
              </Button>
            </Box>
          </Toolbar>
          <Divider />

          {/* Chatroom list */}
          <Box sx={{ overflow: "auto", flexGrow: 1 }}>
            {isFetching && !chatrooms.length ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  p: 3,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              chatrooms.map((chatroom) => (
                <SidebarChat
                  key={chatroom._id}
                  chatroom={chatroom}
                  currentUser={user}
                  onlineUsers={onlineUsers}
                  selected={currentChat?._id === chatroom._id}
                  onClick={() => {
                    chatDispatch({
                      type: "SET_CURRENT_CHAT",
                      payload: chatroom,
                    });
                    if (isMobile) setMobileOpen(false);
                  }}
                />
              ))
            )}
            {!isFetching && chatrooms.length === 0 && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No conversations yet. Add a friend to start chatting!
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          pt: { xs: 8, sm: 10 },
        }}
      >
        {currentChat ? (
          <>
            {/* Messages */}
            <Paper
              elevation={3}
              sx={{
                flexGrow: 1,
                overflow: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                mb: 2,
              }}
            >
              {messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  own={message.senderId === user._id}
                  ref={index === messages.length - 1 ? scrollRef : null}
                />
              ))}
              {messages.length === 0 && !isFetching && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography color="text.secondary">
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              )}
              {isFetching && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    p: 3,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Paper>

            {/* Message input */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <EmojiEmotionsIcon />
                </IconButton>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  sx={{ mr: 1 }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
              {showEmojiPicker && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "100%",
                    right: 0,
                    zIndex: 1,
                  }}
                >
                  <Picker onEmojiClick={onEmojiClick} />
                </Box>
              )}
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Select a conversation or start a new one
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setShowAddAmigo(true)}
            >
              Add Friend
            </Button>
          </Box>
        )}
      </Box>

      {/* Add Friend Dialog */}
      <AddAmigo open={showAddAmigo} onClose={() => setShowAddAmigo(false)} />
    </Box>
  );
};

export default Home;
