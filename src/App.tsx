import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { ChatProvider } from "./components/chat/ChatContext";
import AuthForms from "./components/auth/AuthForms";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("3");
  const [userName, setUserName] = useState("Current User");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for saved login state on app load
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedUserName = localStorage.getItem("userName");

    if (savedUserId && savedUserName) {
      setUserId(savedUserId);
      setUserName(savedUserName);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (data: any) => {
    setIsLoading(true);
    setAuthError(null);

    // Simulate API call with timeout
    setTimeout(() => {
      // For demo purposes, accept any credentials
      const newUserId = `user_${Date.now()}`;

      // Save to localStorage
      localStorage.setItem("userId", newUserId);
      localStorage.setItem("userName", data.email.split("@")[0]);

      setUserId(newUserId);
      setUserName(data.email.split("@")[0]);
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = (data: any) => {
    setIsLoading(true);
    setAuthError(null);

    // Simulate API call with timeout
    setTimeout(() => {
      const newUserId = `user_${Date.now()}`;

      // Save to localStorage
      localStorage.setItem("userId", newUserId);
      localStorage.setItem("userName", data.username);

      setUserId(newUserId);
      setUserName(data.username);
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
  };

  return (
    <ChatProvider currentUserId={userId}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <p className="text-lg">Loading...</p>
          </div>
        }
      >
        <>
          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Home onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to="/" />
                ) : (
                  <AuthForms
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    isLoading={isLoading}
                    error={authError}
                  />
                )
              }
            />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </ChatProvider>
  );
}

export default App;
