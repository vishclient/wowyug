import { useState, useEffect } from "react";
import { useChatContext } from "./chat/ChatContext";
import ConversationList from "./chat/ConversationList";
import MessageThread from "./chat/MessageThread";
import UpdateUsername from "./auth/UpdateUsername";
import { Button } from "@/components/ui/button";
import { LogOut, UserIcon, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HomeProps {
  onLogout?: () => void;
}

function Home({ onLogout }: HomeProps) {
  const { activeConversationId, currentUserId } = useChatContext();
  const [isUpdateUsernameOpen, setIsUpdateUsernameOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if onLogout prop is not provided
      navigate("/login");
    }
  };

  const userName = localStorage.getItem("userName") || "User";

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex justify-between items-center p-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Chat App</h1>
          <div className="flex gap-2">
            <Dialog
              open={isUpdateUsernameOpen}
              onOpenChange={setIsUpdateUsernameOpen}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <UserIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Your Username</DialogTitle>
                </DialogHeader>
                <UpdateUsername />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${isMobile ? (isMobileMenuOpen ? "block absolute z-10 left-0 top-14 h-[calc(100%-3.5rem)] w-full md:w-80 bg-background" : "hidden") : "block"} md:w-80 md:h-full border-r`}
      >
        <div className="flex flex-col h-full">
          {!isMobile && (
            <div className="p-3 flex justify-between items-center border-b">
              <div className="flex flex-col">
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground">
                  ID: {currentUserId.substring(0, 8)}
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={isUpdateUsernameOpen}
                  onOpenChange={setIsUpdateUsernameOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <UserIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Your Username</DialogTitle>
                    </DialogHeader>
                    <UpdateUsername />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <ConversationList />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full md:p-4 p-2 overflow-hidden">
        <MessageThread conversationId={activeConversationId || undefined} />
      </div>
    </div>
  );
}

export default Home;
