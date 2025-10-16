import { Trophy, User, Target, LogOut, Menu, Languages, TrendingUp, Calendar, Crown, Medal, Users, Flame, Zap, Volume2, VolumeX, Eye, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, endOfMonth, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MatchDetails from "@/components/MatchDetails";
import { getFluencyLevel } from "@shared/fluencyLevels";

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
  isPremium?: boolean;
  hideProfile?: boolean;
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
  bestDailyLoginStreak = 0,
  isPremium = false,
  hideProfile = false
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fluencyLevel = getFluencyLevel(elo);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { setEnabled, isEnabled } = useSound();
  const [soundEnabled, setSoundEnabled] = useState(isEnabled());
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Calculate time until end of month
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const monthEnd = endOfMonth(now);
      const days = differenceInDays(monthEnd, now);
      const hours = differenceInHours(monthEnd, now) % 24;
      const minutes = differenceInMinutes(monthEnd, now) % 60;

      if (days > 0) {
        setTimeUntilReset(`Resets in ${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeUntilReset(`Resets in ${hours}h ${minutes}m`);
      } else {
        setTimeUntilReset(`Resets in ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
      <header className="fixed left-0 right-0 h-16 bg-card border-b border-card-border z-50" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
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
          {!hideProfile && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-profile-dropdown">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        {profileImageUrl && <img src={profileImageUrl} alt={username} />}
                        <AvatarFallback className="text-xs">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {isPremium && (
                        <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" data-testid="icon-premium-crown-avatar" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{username}</p>
                  {isPremium && (
                    <Badge 
                      variant="default" 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5 font-bold"
                      data-testid="badge-premium-dropdown"
                    >
                      <Crown className="w-3 h-3" />
                      PRO
                    </Badge>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{currentLanguage}</p>
                    <Badge 
                      variant="outline" 
                      className="font-bold text-xs"
                      data-testid="badge-fluency-level-dropdown"
                    >
                      {fluencyLevel.level}
                    </Badge>
                  </div>
                  <div className="bg-primary/5 rounded-md p-2.5 border border-primary/10">
                    <p className="text-xs font-semibold text-primary mb-1">CEFR {fluencyLevel.level}: {fluencyLevel.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{fluencyLevel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-mono font-semibold" data-testid="text-fluency-score-dropdown">{elo} Fluency Score</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = "/api/logout";
                }}
                data-testid="menu-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
          )}
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{username}</p>
                      {isPremium && (
                        <Badge 
                          variant="default" 
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] px-1.5 py-0 h-4 flex items-center gap-0.5 font-bold"
                          data-testid="badge-premium-mobile"
                        >
                          <Crown className="w-3 h-3" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{currentLanguage}</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Badge 
                            variant="outline" 
                            className="font-bold text-xs cursor-pointer hover-elevate"
                            data-testid="badge-fluency-level-mobile"
                          >
                            {fluencyLevel.level}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-xs" data-testid="popover-fluency-level">
                          <p className="font-semibold mb-1">CEFR Level: {fluencyLevel.level}</p>
                          <p className="text-xs text-muted-foreground mb-2">Common European Framework of Reference for Languages</p>
                          <p className="text-sm">{fluencyLevel.description}</p>
                        </PopoverContent>
                      </Popover>
                    </div>
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
                            {matches.filter(m => !m.isPracticeMode).slice(0, 5).map((match) => (
                              <div
                                key={match.id}
                                className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setMobileMenuOpen(false);
                                }}
                                data-testid={`match-card-${match.id}`}
                              >
                                <Badge
                                  variant={match.result === "win" ? "default" : "destructive"}
                                  className="w-10 justify-center font-semibold text-xs"
                                >
                                  {match.result === "win" ? "W" : "L"}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate flex items-center gap-1">
                                    <span>vs {match.opponent}</span>
                                    {(match.isForfeit === 1 || (match as any).is_forfeit === 1) && (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-3">
                                        Forfeit
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {match.createdAt ? formatDistanceToNow(new Date(match.createdAt), { addSuffix: true }) : "Unknown"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`font-mono font-bold text-sm ${
                                    match.result === "win" ? "text-success" : "text-destructive"
                                  }`}>
                                    {match.result === "win" ? "+" : ""}{match.eloChange}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMatch(match);
                                      setMobileMenuOpen(false);
                                    }}
                                    data-testid={`button-view-match-${match.id}`}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
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
                <div className="pt-4 border-t border-card-border space-y-3">
                  <Button
                    variant={currentPage === "analytics" ? "default" : "outline"}
                    className="w-full gap-2"
                    onClick={() => {
                      onNavigate?.("analytics");
                      setMobileMenuOpen(false);
                    }}
                    data-testid="button-nav-analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </Button>
                  
                  {isAuthenticated && (
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
                  )}
                  
                  {isAuthenticated && (
                    <>
                    {/* Subscription Management */}
                    {!isPremium ? (
                      <Button
                        variant="default"
                        className="w-full gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                        onClick={() => {
                          window.location.href = "/subscribe";
                        }}
                        data-testid="button-mobile-upgrade"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade to Premium</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={async () => {
                          if (confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
                            try {
                              const res = await fetch('/api/cancel-subscription', { method: 'POST' });
                              const data = await res.json();
                              if (res.ok) {
                                alert(data.message);
                                window.location.reload();
                              } else {
                                alert(data.message || 'Failed to cancel subscription');
                              }
                            } catch (error) {
                              alert('Failed to cancel subscription');
                            }
                          }
                        }}
                        data-testid="button-mobile-cancel-subscription"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Cancel Subscription</span>
                      </Button>
                    )}
                    </>
                  )}
                </div>
                
                {/* Sign Out Button - Always visible */}
                <div className="pt-4 border-t border-card-border">
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive hover:text-destructive border-destructive/30"
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = "/api/logout";
                    }}
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-4">
              <div className="mb-3 text-center">
                <p className="text-xs text-muted-foreground">{timeUntilReset}</p>
              </div>
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

      {selectedMatch && (
        <MatchDetails
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          language={currentLanguage}
        />
      )}
    </>
  );
}
