import { Swords, Trophy, User, Target, LogOut, Menu, Languages } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];

  const totalMatches = wins + losses;

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
          <div className="hidden sm:flex items-center gap-2">
            <Select value={currentLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-[140px] h-9" data-testid="select-language-header">
                <Languages className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chinese" data-testid="option-chinese-header">中文</SelectItem>
                <SelectItem value="Spanish" data-testid="option-spanish-header">Español</SelectItem>
                <SelectItem value="Italian" data-testid="option-italian-header">Italiano</SelectItem>
              </SelectContent>
            </Select>
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
                  <div>
                    <p className="font-semibold">{username}</p>
                    <p className="text-sm text-muted-foreground">{currentLanguage}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Elo</p>
                    <p className="text-xl font-mono font-bold">{elo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Wins</p>
                    <p className="text-xl font-bold">{wins}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Losses</p>
                    <p className="text-xl font-bold">{losses}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Matches</span>
                    <span className="font-semibold">{totalMatches}</span>
                  </div>
                  {totalMatches > 0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-semibold">{Math.round((wins / totalMatches) * 100)}%</span>
                    </div>
                  )}
                </div>
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
