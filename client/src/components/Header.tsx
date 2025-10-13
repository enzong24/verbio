import { Swords, Trophy, User, Target, LogOut, Menu, Languages, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  onLanguageChange
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: "duel", label: "Duel", icon: Swords },
  ];

  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Fetch recent matches for authenticated users
  const { data: matches } = useQuery<Match[]>({
    queryKey: [`/api/user/matches?language=${currentLanguage}`, currentLanguage],
    enabled: isAuthenticated,
  });

  // Fetch skill progress for authenticated users
  const { data: skillProgress } = useQuery<{
    grammar: number;
    fluency: number;
    vocabulary: number;
    naturalness: number;
  }>({
    queryKey: [`/api/user/skill-progress?language=${currentLanguage}`, currentLanguage],
    enabled: isAuthenticated,
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-card-border z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
              className="text-xl font-bold tracking-tight md:cursor-default cursor-pointer hover-elevate md:hover:bg-transparent px-3 py-1.5 rounded-md md:px-0 md:py-0" 
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              LangDuel
            </h1>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.(item.id)}
                  className={`gap-2 ${isActive ? 'border-b-2 border-primary rounded-none' : ''}`}
                  data-testid={`button-nav-${item.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
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
              {elo} Elo
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
                  {elo} Elo
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
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
                        <div className="w-8 h-8 rounded-md bg-success/10 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <div className="text-lg font-bold font-mono">{winRate}%</div>
                          <div className="text-xs text-muted-foreground">Win Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-card-border">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-warning/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <div className="text-lg font-bold font-mono">{totalMatches}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                              <div className="font-medium text-sm truncate">vs {match.opponent}</div>
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
              </div>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-4">
              <div className="text-sm text-muted-foreground text-center py-4">
                Leaderboard content will be shown here
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
