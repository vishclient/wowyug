import React, { useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useChatContext } from "./ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  participants?: {
    id: string;
    name: string;
    avatar?: string;
  }[];
}

interface ConversationListProps {
  conversations?: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (conversationId: string) => void;
  onCreateConversation?: (
    type: "direct" | "group",
    participants: string[],
    groupName?: string,
  ) => void;
}

const ConversationList = ({
  conversations = defaultConversations,
  activeConversationId,
  onSelectConversation = () => {},
  onCreateConversation = () => {},
}: ConversationListProps) => {
  const { selectConversation, createConversation } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [usernameToFind, setUsernameToFind] = useState("");

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (conversation.participants &&
        conversation.participants.some((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  const handleCreateConversation = (type: "direct" | "group") => {
    createConversation(
      type,
      selectedUsers,
      type === "group" ? groupName : undefined,
    );
    setSelectedUsers([]);
    setGroupName("");
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-3 md:p-4 border-b">
        <h2 className="text-xl font-bold mb-3">Conversations</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8 focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="flex-shrink-0">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="direct">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direct">Direct Message</TabsTrigger>
                  <TabsTrigger value="group">Group Chat</TabsTrigger>
                </TabsList>
                <TabsContent value="direct" className="mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Find User by Username
                      </h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter username"
                          value={usernameToFind}
                          onChange={(e) => setUsernameToFind(e.target.value)}
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => {
                            // In a real app, this would search for users by username
                            console.log("Searching for user:", usernameToFind);
                            // If found, add to selectedUsers
                            const foundUser = mockUsers.find(
                              (u) =>
                                u.name.toLowerCase() ===
                                usernameToFind.toLowerCase(),
                            );
                            if (foundUser) {
                              setSelectedUsers([foundUser.id]);
                            }
                          }}
                        >
                          Find
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Select User</h4>
                      <ScrollArea className="h-[200px] border rounded-md p-2">
                        {mockUsers
                          .filter((user) =>
                            usernameToFind
                              ? user.name
                                  .toLowerCase()
                                  .includes(usernameToFind.toLowerCase())
                              : true,
                          )
                          .map((user) => (
                            <div
                              key={user.id}
                              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? "bg-accent" : "hover:bg-muted"}`}
                              onClick={() => setSelectedUsers([user.id])}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          ))}
                      </ScrollArea>
                    </div>
                    <Button
                      className="w-full"
                      disabled={selectedUsers.length !== 1}
                      onClick={() => handleCreateConversation("direct")}
                    >
                      Start Conversation
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="group" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="group-name"
                        className="text-sm font-medium"
                      >
                        Group Name
                      </label>
                      <Input
                        id="group-name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="mt-1 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Select Members</h4>
                      <ScrollArea className="h-[200px] border rounded-md p-2">
                        {mockUsers.map((user) => (
                          <div
                            key={user.id}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? "bg-accent" : "hover:bg-muted"}`}
                            onClick={() => {
                              if (selectedUsers.includes(user.id)) {
                                setSelectedUsers(
                                  selectedUsers.filter((id) => id !== user.id),
                                );
                              } else {
                                setSelectedUsers([...selectedUsers, user.id]);
                              }
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    <Button
                      className="w-full"
                      disabled={selectedUsers.length < 2 || !groupName.trim()}
                      onClick={() => handleCreateConversation("group")}
                    >
                      Create Group
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeConversationId === conversation.id ? "bg-accent" : "hover:bg-muted"}`}
                onClick={() => selectConversation(conversation.id)}
              >
                <Avatar>
                  <AvatarImage
                    src={conversation.avatar}
                    alt={conversation.name}
                  />
                  <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="rounded-full px-2 py-0.5 text-xs"
                  >
                    {conversation.unreadCount}
                  </Badge>
                )}
                {conversation.isGroup && (
                  <Badge variant="outline" className="text-xs">
                    Group
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No conversations found
              </p>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Start a new conversation
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Mock data for demonstration
const defaultConversations: Conversation[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    lastMessage: "Hey, how are you doing?",
    timestamp: "10:30 AM",
    unreadCount: 2,
    isGroup: false,
  },
  {
    id: "2",
    name: "Project Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=team",
    lastMessage: "Bob: I just pushed the latest changes",
    timestamp: "Yesterday",
    unreadCount: 0,
    isGroup: true,
    participants: [
      {
        id: "u2",
        name: "Bob Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "u3",
        name: "Charlie Davis",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
      },
      {
        id: "u4",
        name: "Diana Evans",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diana",
      },
    ],
  },
  {
    id: "3",
    name: "Charlie Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    lastMessage: "Can we meet tomorrow?",
    timestamp: "Yesterday",
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: "4",
    name: "Family Group",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=family",
    lastMessage: "Mom: Don't forget about Sunday dinner",
    timestamp: "Monday",
    unreadCount: 5,
    isGroup: true,
  },
  {
    id: "5",
    name: "Diana Evans",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diana",
    lastMessage: "The documents are ready for review",
    timestamp: "Monday",
    unreadCount: 0,
    isGroup: false,
  },
];

const mockUsers = [
  {
    id: "u1",
    name: "Alice Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
  },
  {
    id: "u2",
    name: "Bob Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
  },
  {
    id: "u3",
    name: "Charlie Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
  },
  {
    id: "u4",
    name: "Diana Evans",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diana",
  },
  {
    id: "u5",
    name: "Ethan Foster",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ethan",
  },
  {
    id: "u6",
    name: "Fiona Grant",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fiona",
  },
  {
    id: "u7",
    name: "George Harris",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=george",
  },
  {
    id: "u8",
    name: "Hannah Irving",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hannah",
  },
];

export default ConversationList;
