import { Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleGuestPlay = () => {
    window.location.href = "/?guest=true";
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <img src="/favicon.png" alt="Verbio" className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold">Verbio</h2>
              <p className="text-sm text-muted-foreground">Competitive Language Learning</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Welcome to Verbio
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Master languages through competitive duels. Track your progress with Fluency Score ratings and compete against players worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg font-semibold"
                onClick={handleSignIn}
                data-testid="button-sign-in"
              >
                Sign In to Compete
              </Button>
              <Button 
                size="lg"
                className="text-lg font-semibold"
                variant="default"
                style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', borderColor: 'hsl(var(--accent))' }}
                onClick={handleGuestPlay}
                data-testid="button-guest-play"
              >
                Play as Guest
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <Card className="border-primary/20 shadow-md">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Competitive Ranking</h3>
                <p className="text-muted-foreground text-center">
                  Track your progress with Fluency Score ratings. Compete against players at your skill level and climb the leaderboard.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/50 shadow-md">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">AI-Powered Feedback</h3>
                <p className="text-muted-foreground text-center">
                  Get instant grading on grammar, fluency, vocabulary, and naturalness from advanced AI.
                </p>
              </CardContent>
            </Card>

            <Card className="border-success/20 shadow-md">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-success flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Multiple Languages</h3>
                <p className="text-muted-foreground text-center">
                  Practice Chinese, Spanish, or Italian with themed conversation topics and varied difficulty levels.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
