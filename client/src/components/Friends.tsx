import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check, X, Users, Inbox, Swords, Copy } from "lucide-react";
import type { Friend, User } from "@shared/schema";

interface FriendWithUser extends Friend {
  friendUser: User;
  friendStats?: {
    elo: number;
    wins: number;
    losses: number;
  };
}

interface FriendRequest extends Friend {
  requesterUser: User;
}

export default function Friends() {
  const [friendUsername, setFriendUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createdInvite, setCreatedInvite] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch friends list
  const { data: friends = [], isLoading: friendsLoading } = useQuery<FriendWithUser[]>({
    queryKey: ["/api/friends"],
  });

  // Fetch pending friend requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (username: string) => {
      return await apiRequest("POST", "/api/friends/request", {
        friendUsername: username,
      });
    },
    onSuccess: () => {
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });
      setFriendUsername("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send request",
        description: error.message || "Could not send friend request",
        variant: "destructive",
      });
    },
  });

  // Accept friend request mutation
  const acceptMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      return await apiRequest("POST", `/api/friends/accept/${friendshipId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Friend request accepted!",
        description: "You are now friends.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to accept request",
        variant: "destructive",
      });
    },
  });

  // Reject friend request mutation
  const rejectMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      return await apiRequest("POST", `/api/friends/reject/${friendshipId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Friend request rejected",
      });
    },
    onError: () => {
      toast({
        title: "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  // Remove friend mutation
  const removeMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      return await apiRequest("DELETE", `/api/friends/${friendshipId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend removed",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove friend",
        variant: "destructive",
      });
    },
  });

  const handleSendRequest = () => {
    if (!friendUsername.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }
    sendRequestMutation.mutate(friendUsername);
  };

  // Create private match invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/private-match/create", {
        language: "Chinese",
        difficulty: "Medium",
        topic: null,
      });
    },
    onSuccess: (data: any) => {
      setCreatedInvite(data.inviteCode);
      toast({
        title: "Invite created!",
        description: `Share code: ${data.inviteCode}`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to create invite",
        variant: "destructive",
      });
    },
  });

  const copyInviteCode = () => {
    if (createdInvite) {
      navigator.clipboard.writeText(createdInvite);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Friends</h1>
        <p className="text-muted-foreground">Connect with other language learners</p>
      </div>

      {/* Add Friend Section */}
      <Card className="mb-6 border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Friend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
              data-testid="input-friend-username"
            />
            <Button
              onClick={handleSendRequest}
              disabled={sendRequestMutation.isPending}
              data-testid="button-send-friend-request"
            >
              {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Private Match Section */}
      <Card className="mb-6 border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Private Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Create a private match invite and share the code with a friend
            </p>
            <Button
              onClick={() => createInviteMutation.mutate()}
              disabled={createInviteMutation.isPending}
              data-testid="button-create-invite"
            >
              {createInviteMutation.isPending ? "Creating..." : "Create Invite Code"}
            </Button>
            {createdInvite && (
              <div className="mt-3 p-3 rounded-md bg-muted flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Invite Code:</div>
                  <div className="font-mono font-bold text-lg" data-testid="text-invite-code">
                    {createdInvite}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyInviteCode}
                  data-testid="button-copy-invite"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-card-border">
            <p className="text-sm text-muted-foreground mb-3">
              Enter a friend's invite code to join their match
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                data-testid="input-join-code"
              />
              <Button
                onClick={() => {
                  if (joinCode.trim()) {
                    toast({
                      title: "Join functionality",
                      description: "Private match joining will be integrated with matchmaking system",
                    });
                  }
                }}
                data-testid="button-join-match"
              >
                Join Match
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Friend Requests */}
      {requests.length > 0 && (
        <Card className="mb-6 border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Pending Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  data-testid={`friend-request-${request.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(request.requesterUser.firstName || request.requesterUser.email || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {request.requesterUser.firstName || request.requesterUser.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.requesterUser.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => acceptMutation.mutate(request.id)}
                      disabled={acceptMutation.isPending}
                      data-testid={`button-accept-${request.id}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                      data-testid={`button-reject-${request.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friendsLoading && <div className="text-center py-8">Loading friends...</div>}
          
          {!friendsLoading && friends.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No friends yet. Send a friend request to get started!
            </div>
          )}

          {!friendsLoading && friends.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 rounded-md border border-card-border hover-elevate"
                  data-testid={`friend-card-${friend.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(friend.friendUser.firstName || friend.friendUser.email || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {friend.friendUser.firstName || friend.friendUser.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {friend.friendUser.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeMutation.mutate(friend.id)}
                    disabled={removeMutation.isPending}
                    data-testid={`button-remove-${friend.id}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
