import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check, X, Users, Inbox, Swords, Circle } from "lucide-react";
import type { Friend, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

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
  const [selectedFriendForInvite, setSelectedFriendForInvite] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch friends list
  const { data: friends = [], isLoading: friendsLoading } = useQuery<FriendWithUser[]>({
    queryKey: ["/api/friends"],
  });

  // Fetch pending friend requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
  });

  // Fetch pending match challenges
  const { data: challenges = [] } = useQuery<Array<any>>({
    queryKey: ["/api/friends/challenges"],
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

  // Create private match invite mutation for a specific friend
  // Create friend challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return await apiRequest("POST", "/api/friends/challenge", {
        friendId,
        language: "Chinese",
        difficulty: "Medium",
        topic: null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Challenge sent!",
        description: "Your friend will be notified of your challenge.",
      });
      setSelectedFriendForInvite(null);
    },
    onError: () => {
      toast({
        title: "Failed to send challenge",
        variant: "destructive",
      });
      setSelectedFriendForInvite(null);
    },
  });

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest("POST", `/api/friends/challenges/${challengeId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/challenges"] });
      toast({
        title: "Challenge accepted!",
        description: "Redirecting to match...",
      });
    },
    onError: () => {
      toast({
        title: "Failed to accept challenge",
        variant: "destructive",
      });
    },
  });

  // Reject challenge mutation
  const rejectChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest("POST", `/api/friends/challenges/${challengeId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/challenges"] });
      toast({
        title: "Challenge ignored",
      });
    },
    onError: () => {
      toast({
        title: "Failed to reject challenge",
        variant: "destructive",
      });
    },
  });

  const handleChallengeFriend = (friendId: string) => {
    setSelectedFriendForInvite(friendId);
    createChallengeMutation.mutate(friendId);
  };

  const isOnline = (user: User) => {
    if (!user.lastSeenAt) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(user.lastSeenAt) > fiveMinutesAgo && user.isOnline === 1;
  };

  const getLastSeenText = (user: User) => {
    if (isOnline(user)) return "Online";
    if (!user.lastSeenAt) return "Never";
    return `Last seen ${formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}`;
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

      {/* Pending Match Challenges */}
      {challenges.length > 0 && (
        <Card className="mb-6 border-card-border border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Match Challenges ({challenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  data-testid={`challenge-card-${challenge.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(challenge.creatorUser.firstName || challenge.creatorUser.email || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{challenge.creatorUser.firstName || challenge.creatorUser.email}</div>
                      <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{challenge.language}</Badge>
                        <Badge variant="outline" className="text-xs">{challenge.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => acceptChallengeMutation.mutate(challenge.id)}
                      disabled={acceptChallengeMutation.isPending}
                      data-testid={`button-accept-challenge-${challenge.id}`}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectChallengeMutation.mutate(challenge.id)}
                      disabled={rejectChallengeMutation.isPending}
                      data-testid={`button-reject-challenge-${challenge.id}`}
                    >
                      Ignore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
        <CardContent className="max-h-[600px] overflow-y-auto">
          {friendsLoading && <div className="text-center py-8">Loading friends...</div>}
          
          {!friendsLoading && friends.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No friends yet. Send a friend request to get started!
            </div>
          )}

          {!friendsLoading && friends.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {friends.map((friend) => {
                const online = isOnline(friend.friendUser);
                return (
                  <div
                    key={friend.id}
                    className="flex items-start justify-between p-4 rounded-md border border-card-border hover-elevate cursor-pointer transition-all"
                    data-testid={`friend-card-${friend.id}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden">
                      <div className="relative flex-shrink-0">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {(friend.friendUser.firstName || friend.friendUser.email || "?")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Circle 
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                            online ? "fill-success text-success" : "fill-muted-foreground/40 text-muted-foreground/40"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          <span className="truncate">{friend.friendUser.firstName || friend.friendUser.email}</span>
                          {online && (
                            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20 flex-shrink-0">
                              Online
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {friend.friendUser.email}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {getLastSeenText(friend.friendUser)}
                        </div>
                        {friend.friendStats && (
                          <div className="text-xs text-muted-foreground mt-2 flex gap-3 flex-wrap">
                            <span className="truncate">Fluency Score: <span className="font-mono font-semibold text-foreground">{friend.friendStats.elo}</span></span>
                            <span className="text-success flex-shrink-0">{friend.friendStats.wins}W</span>
                            <span className="text-destructive flex-shrink-0">{friend.friendStats.losses}L</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleChallengeFriend(friend.friendUser.id)}
                        disabled={createChallengeMutation.isPending && selectedFriendForInvite === friend.friendUser.id}
                        data-testid={`button-challenge-${friend.id}`}
                      >
                        <Swords className="w-4 h-4 mr-1" />
                        Challenge
                      </Button>
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
