import { Swords, Trophy, User, Target, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  username?: string;
  elo?: number;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  isAuthenticated?: boolean;
  profileImageUrl?: string | null;
}

export default function Header({ 
  username = "Player", 
  elo = 1200, 
  onNavigate, 
  currentPage = "duel",
  isAuthenticated = false,
  profileImageUrl
}: HeaderProps) {
  const navItems = [
    { id: "duel", label: "Duel", icon: Swords },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-card-border z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-tight">LangDuel</h1>
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
            <Badge variant="outline" className="font-mono font-semibold" data-testid="badge-elo">
              {elo} Elo
            </Badge>
          </div>
          <Avatar className="w-9 h-9 border border-border" data-testid="avatar-user">
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
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
