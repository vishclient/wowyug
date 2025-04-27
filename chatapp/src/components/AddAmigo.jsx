import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { usersAPI, chatroomsAPI } from "../services/api";

// Material UI imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const AddAmigo = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const { user } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  // Handle search for users
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      const res = await usersAPI.searchUsers(searchTerm);
      setSearchResults(res.data);
      if (res.data.length === 0) {
        setError("No users found");
      }
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle starting a chat with a user
  const handleStartChat = async (userId) => {
    try {
      const res = await chatroomsAPI.createChatroom(user._id, userId);
      dispatch({ type: "ADD_CHATROOM", payload: res.data });
      dispatch({ type: "SET_CURRENT_CHAT", payload: res.data });
      onClose();
    } catch (err) {
      console.error("Error creating chatroom:", err);
      setError("Failed to start chat");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Find Friends</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", mb: 2 }}>
          <TextField
            fullWidth
            label="Search by username"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            sx={{ ml: 1 }}
          >
            {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <List sx={{ width: "100%" }}>
          {searchResults.map((result) => (
            <ListItem
              key={result._id}
              secondaryAction={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleStartChat(result._id)}
                >
                  Chat
                </Button>
              }
            >
              <ListItemAvatar>
                <Avatar src={result.profilePicture} alt={result.username} />
              </ListItemAvatar>
              <ListItemText
                primary={result.username}
                secondary={result.email}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAmigo;
