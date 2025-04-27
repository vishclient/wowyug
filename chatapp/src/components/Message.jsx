import { forwardRef } from "react";
import { format } from "timeago.js";

// Material UI imports
import { Box, Typography, Paper } from "@mui/material";

const Message = forwardRef(({ message, own }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: own ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          maxWidth: "70%",
          backgroundColor: own ? "primary.light" : "background.paper",
          color: own ? "primary.contrastText" : "text.primary",
        }}
      >
        {/* Display username for messages not sent by current user */}
        {!own && message.senderUsername && (
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              mb: 0.5,
              color: own ? "inherit" : "primary.main",
            }}
          >
            {message.senderUsername}
          </Typography>
        )}
        <Typography variant="body1">{message.text}</Typography>
        {message.fileUrl && (
          <Box sx={{ mt: 1 }}>
            {message.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
              <img
                src={`${process.env.REACT_APP_API_URL}${message.fileUrl}`}
                alt="attachment"
                style={{ maxWidth: "100%", borderRadius: 4 }}
              />
            ) : (
              <Box
                component="a"
                href={`${process.env.REACT_APP_API_URL}${message.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "block",
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: "action.hover",
                  textDecoration: "none",
                  color: "text.primary",
                }}
              >
                Download Attachment
              </Box>
            )}
          </Box>
        )}
      </Paper>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, mx: 1 }}
      >
        {format(message.createdAt)}
        {own && (
          <Box
            component="span"
            sx={{
              ml: 1,
              fontSize: "0.7rem",
              color: message.read ? "primary.main" : "text.secondary",
            }}
          >
            {message.read ? "✓✓" : "✓"}
          </Box>
        )}
      </Typography>
    </Box>
  );
});

export default Message;
