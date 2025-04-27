import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (formData) => api.post("/api/auth/signup", formData),
  login: (credentials) => api.post("/api/auth/signin", credentials),
};

// Users API
export const usersAPI = {
  getUser: (userId) => api.get(`/api/users/${userId}`),
  searchUsers: (username) => api.get(`/api/users/search/${username}`),
};

// Chatrooms API
export const chatroomsAPI = {
  createChatroom: (senderId, receiverId) =>
    api.post("/api/chatrooms", { senderId, receiverId }),
  getUserChatrooms: (userId) => api.get(`/api/chatrooms/${userId}`),
  getChatroom: (firstUserId, secondUserId) =>
    api.get(`/api/chatrooms/find/${firstUserId}/${secondUserId}`),
};

// Messages API
export const messagesAPI = {
  sendMessage: (message) => api.post("/api/messages", message),
  getMessages: (chatroomId) => api.get(`/api/messages/${chatroomId}`),
  markAsRead: (chatroomId, userId) =>
    api.put(`/api/messages/read/${chatroomId}`, { userId }),
};

export default api;
