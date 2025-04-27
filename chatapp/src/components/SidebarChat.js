import { useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import { format } from "timeago.js";

// Material UI imports
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Badge,
} from "@mui/material";

const SidebarChat = ({
  chatroom,
  currentUser,
  onlineUsers,
  selected,
  onClick,
}) => {
  const [friend, setFriend] = useState(null);

  // Get the friend's info
  useEffect(() => {
    const friendId = chatroom.members.find((m) => m !== currentUser._id);

    const getFriend = async () => {
      try {
        const res = await usersAPI.getUser(friendId);
        setFriend(res.data);
      } catch (err) {
        console.error("Error fetching friend:", err);
      }
    };

    if (friendId) getFriend();
  }, [chatroom, currentUser]);

  // Check if friend is online
  const isOnline = onlineUsers.some(
    (user) => friend && user.userId === friend._id,
  );

  return (
    <ListItem
      button
      onClick={onClick}
      selected={selected}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        "&.Mui-selected": {
          backgroundColor: "action.selected",
        },
      }}
    >
      <ListItemAvatar>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: isOnline ? "success.main" : "text.disabled",
              boxShadow: `0 0 0 2px white`,
            },
          }}
        >
          <Avatar src={friend?.profilePicture} alt={friend?.username} />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight:
                chatroom.lastMessage && !chatroom.lastMessage.read ? 600 : 400,
            }}
          >
            {friend?.username || "User"}
          </Typography>
        }
        secondary={
          <Box
            component="span"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "150px",
                fontWeight:
                  chatroom.lastMessage &&
                  !chatroom.lastMessage.read &&
                  chatroom.lastMessage.senderId !== currentUser._id
                    ? 600
                    : 400,
              }}
            >
              {chatroom.lastMessage
                ? chatroom.lastMessage.text || "Attachment"
                : "Start a conversation"}
            </Typography>
            {chatroom.lastMessage && (
              <Typography variant="caption" color="text.secondary">
                {format(chatroom.lastMessage.createdAt)}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

export default SidebarChat;
