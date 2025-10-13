import { Trophy, Users, Zap, Mic } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-md bg-primary/10 flex items-center justify-center">
                <Mic className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">LangDuel</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Master languages through competitive duels. Track your progress with Elo ratings.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg font-semibold"
                onClick={handleSignIn}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg"
                onClick={handleGuestPlay}
                data-testid="button-guest-play"
              >
                Play as Guest
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="border-card-border">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Competitive Ranking</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Track your progress with Elo ratings. Compete against players at your skill level.
                </p>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">AI-Powered Feedback</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Get instant grading on grammar, fluency, vocabulary, and naturalness.
                </p>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Multiple Languages</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Practice Chinese, Spanish, or Italian with themed conversation topics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
