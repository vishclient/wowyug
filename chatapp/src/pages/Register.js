import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authAPI } from "../services/api";

// Material UI imports
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { isFetching, dispatch } = useContext(AuthContext);

  // Handle profile picture change
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      dispatch({ type: "LOGIN_START" });

      // Create form data for file upload
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const res = await authAPI.register(formData);
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg =
        err.response?.data?.message || "Registration failed. Please try again.";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMsg });
      setErrorMessage(errorMsg);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              borderRadius: "50%",
              padding: 1,
              marginBottom: 1,
            }}
          >
            <PersonAddIcon />
          </Box>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={previewUrl}
                sx={{ width: 80, height: 80 }}
                alt="Profile Preview"
              />
              <input
                accept="image/*"
                type="file"
                id="profile-picture-input"
                onChange={handlePictureChange}
                style={{ display: "none" }}
                disabled={isFetching}
              />
              <label htmlFor="profile-picture-input">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                  }}
                  disabled={isFetching}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </label>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 3, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isFetching}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isFetching}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isFetching}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isFetching}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isFetching}
            >
              {isFetching ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
