import { Trophy, User, Target, LogOut, Menu, Languages, TrendingUp, Calendar, Crown, Medal, Users, Flame, Zap, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Match } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeaderboardEntry {
  rank?: number;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  isCurrentUser?: boolean;
}

interface HeaderProps {
  username?: string;
  elo?: number;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  isAuthenticated?: boolean;
  profileImageUrl?: string | null;
  currentLanguage?: string;
  wins?: number;
  losses?: number;
  onLanguageChange?: (language: string) => void;
  winStreak?: number;
  bestWinStreak?: number;
  dailyLoginStreak?: number;
  bestDailyLoginStreak?: number;
}

export default function Header({ 
  username = "Player", 
  elo = 1200, 
  onNavigate, 
  currentPage = "duel",
  isAuthenticated = false,
  profileImageUrl,
  currentLanguage = "Chinese",
  wins = 0,
  losses = 0,
  onLanguageChange,
  winStreak = 0,
  bestWinStreak = 0,
  dailyLoginStreak = 0,
  bestDailyLoginStreak = 0
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setEnabled, isEnabled } = useSound();
  const [soundEnabled, setSoundEnabled] = useState(isEnabled());

  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setEnabled(newState);
  };

  // Fetch recent matches for authenticated users
  const { data: matches } = useQuery<Match[]>({
    queryKey: [`/api/user/matches?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  // Fetch skill progress for authenticated users
  const { data: skillProgress } = useQuery<{
    grammar: number;
    fluency: number;
    vocabulary: number;
    naturalness: number;
  }>({
    queryKey: [`/api/user/skill-progress?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboard?language=${currentLanguage}`],
    refetchOnWindowFocus: false,
  });

  const leaderboardEntries = leaderboardData?.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  })) || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <>
      <header className="app-header fixed left-0 right-0 h-16 bg-card border-b border-card-border z-50" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <button 
              onClick={() => onNavigate?.("duel")}
              className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
              data-testid="button-logo"
            >
              Verbio
            </button>
          </div>

        <div className="flex items-center gap-4">
          <Select value={currentLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[120px] md:w-[140px] h-9" data-testid="select-language-header">
              <Languages className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Chinese" data-testid="option-chinese-header">中文</SelectItem>
              <SelectItem value="Spanish" data-testid="option-spanish-header">Español</SelectItem>
              <SelectItem value="Italian" data-testid="option-italian-header">Italiano</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden sm:flex">
            <Badge variant="outline" className="font-mono font-semibold" data-testid="badge-elo">
              {elo} Fluency
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.clear();
              if (isAuthenticated) {
                window.location.href = "/api/logout";
              } else {
                window.location.href = "/";
              }
            }}
            className="gap-2"
            data-testid="button-sign-out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="button-profile-menu"
              >
                <Avatar className="w-9 h-9 border border-border hover-elevate" data-testid="avatar-user">
                  {profileImageUrl && (
                    <img 
                      src={profileImageUrl} 
                      alt={username} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                    {username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{username}</p>
                <p className="text-xs text-muted-foreground">
                  {elo} Fluency
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
              <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    {profileImageUrl && <img src={profileImageUrl} alt={username} />}
                    <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{username}</p>
                    <p className="text-sm text-muted-foreground">{currentLanguage}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-card-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-lg font-bold font-mono">{wins}</div>
                          <div className="text-xs text-muted-foreground">Wins</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-card-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center">
                          <Target className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <div className="text-lg font-bold font-mono">{losses}</div>
                          <div className="text-xs text-muted-foreground">Losses</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-card-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <div className="text-lg font-bold font-mono" data-testid="text-win-streak">{winStreak}</div>
                          <div className="text-xs text-muted-foreground">Win Streak</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-card-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-lg font-bold font-mono" data-testid="text-daily-streak">{dailyLoginStreak}</div>
                          <div className="text-xs text-muted-foreground">Day Streak</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sound Toggle */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={toggleSound}
                  data-testid="button-toggle-sound"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Sound On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Sound Off</span>
                    </>
                  )}
                </Button>

                {isAuthenticated && (
                  <>
                    <Card className="border-card-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recent Matches</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {matches && matches.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {matches.slice(0, 5).map((match) => (
                              <div
                                key={match.id}
                                className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                              >
                                <Badge
                                  variant={match.result === "win" ? "default" : "destructive"}
                                  className="w-10 justify-center font-semibold text-xs"
                                >
                                  {match.result === "win" ? "W" : "L"}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate flex items-center gap-2">
                                    <span>vs {match.opponent}</span>
                                    {match.isForfeit === 1 && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                        Forfeit
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {match.createdAt ? formatDistanceToNow(new Date(match.createdAt), { addSuffix: true }) : "Unknown"}
                                  </div>
                                </div>
                                <div className={`font-mono font-bold text-sm ${
                                  match.result === "win" ? "text-success" : "text-destructive"
                                }`}>
                                  {match.result === "win" ? "+" : ""}{match.eloChange}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            No matches yet
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-card-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Skill Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {skillProgress ? (
                          <>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Grammar</span>
                                <span className="font-semibold">{skillProgress.grammar}%</span>
                              </div>
                              <Progress value={skillProgress.grammar} className="h-1.5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Fluency</span>
                                <span className="font-semibold">{skillProgress.fluency}%</span>
                              </div>
                              <Progress value={skillProgress.fluency} className="h-1.5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Vocabulary</span>
                                <span className="font-semibold">{skillProgress.vocabulary}%</span>
                              </div>
                              <Progress value={skillProgress.vocabulary} className="h-1.5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Naturalness</span>
                                <span className="font-semibold">{skillProgress.naturalness}%</span>
                              </div>
                              <Progress value={skillProgress.naturalness} className="h-1.5" />
                            </div>
                          </>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-2">
                            Complete matches to see progress
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Navigation Buttons */}
                {isAuthenticated && (
                  <div className="pt-4 border-t border-card-border">
                    <Button
                      variant={currentPage === "friends" ? "default" : "outline"}
                      className="w-full gap-2"
                      onClick={() => {
                        onNavigate?.("friends");
                        setMobileMenuOpen(false);
                      }}
                      data-testid="button-nav-friends"
                    >
                      <Users className="w-4 h-4" />
                      <span>Friends</span>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-4">
              <Card className="border-card-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-gold" />
                    Top {currentLanguage} Learners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingLeaderboard ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Loading leaderboard...
                    </div>
                  ) : leaderboardEntries.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {leaderboardEntries.slice(0, 20).map((entry) => (
                        <div
                          key={entry.rank}
                          className={`flex items-center gap-3 p-2 rounded-md ${
                            entry.username === username
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover-elevate'
                          }`}
                          data-testid={`leaderboard-entry-${entry.rank}`}
                        >
                          <div className="w-8 text-center">
                            {getRankIcon(entry.rank!) || (
                              <span className="font-mono font-bold text-xs text-muted-foreground">
                                #{entry.rank}
                              </span>
                            )}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {entry.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate flex items-center gap-2">
                              {entry.username}
                              {entry.username === username && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.wins}W - {entry.losses}L
                            </div>
                          </div>
                          <div className="font-mono font-bold text-sm">
                            {entry.elo}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      No players ranked yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
