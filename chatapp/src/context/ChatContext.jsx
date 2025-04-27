import { createContext, useReducer } from "react";

// Initial state
const INITIAL_STATE = {
  chatroom: null,
  chatrooms: [],
  currentChat: null,
  messages: [],
  onlineUsers: [],
  isFetching: false,
  error: null,
};

// Create context
export const ChatContext = createContext(INITIAL_STATE);

// Chat reducer
const ChatReducer = (state, action) => {
  switch (action.type) {
    case "SET_CHATROOMS":
      return {
        ...state,
        chatrooms: action.payload,
        isFetching: false,
      };
    case "SET_CURRENT_CHAT":
      return {
        ...state,
        currentChat: action.payload,
        isFetching: false,
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload,
        isFetching: false,
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "SET_ONLINE_USERS":
      return {
        ...state,
        onlineUsers: action.payload,
      };
    case "FETCH_START":
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    case "UPDATE_CHATROOM":
      return {
        ...state,
        chatrooms: state.chatrooms.map((chatroom) =>
          chatroom._id === action.payload._id ? action.payload : chatroom,
        ),
      };
    case "ADD_CHATROOM":
      return {
        ...state,
        chatrooms: [action.payload, ...state.chatrooms],
      };
    default:
      return state;
  }
};

// Chat context provider
export const ChatContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ChatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider
      value={{
        chatroom: state.chatroom,
        chatrooms: state.chatrooms,
        currentChat: state.currentChat,
        messages: state.messages,
        onlineUsers: state.onlineUsers,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
