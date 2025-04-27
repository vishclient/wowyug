import React from "react";
import { Info, MessageSquare, Users, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoBannerProps {
  onClose?: () => void;
}

const InfoBanner = ({ onClose = () => {} }: InfoBannerProps) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 relative">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <h3 className="font-medium text-sm">About Chat App</h3>
          <p className="text-sm text-muted-foreground">
            Welcome to our real-time messaging platform! Connect with friends
            and colleagues instantly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium">Real-time Messaging</p>
                <p className="text-xs text-muted-foreground">
                  Instant message delivery with read receipts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium">Group Conversations</p>
                <p className="text-xs text-muted-foreground">
                  Create groups with multiple participants
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Bell className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Stay updated with unread message counts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium">Secure Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Protected login and registration system
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-7 px-2"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
