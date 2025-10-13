import { Trophy, Users, Zap, Swords } from "lucide-react";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
                <Swords className="w-14 h-14 text-white" />
              </div>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              LangDuel
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Master languages through competitive duels. Track your progress with Elo ratings and compete against players worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0"
                onClick={handleSignIn}
                data-testid="button-sign-in"
              >
                <Swords className="w-5 h-5 mr-2" />
                Sign In to Compete
              </Button>
              <Button 
                size="lg" 
                className="text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
                onClick={handleGuestPlay}
                data-testid="button-guest-play"
              >
                Play as Guest
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Competitive Ranking</h3>
                <p className="text-muted-foreground text-center">
                  Track your progress with Elo ratings. Compete against players at your skill level and climb the leaderboard.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/30">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">AI-Powered Feedback</h3>
                <p className="text-muted-foreground text-center">
                  Get instant grading on grammar, fluency, vocabulary, and naturalness from advanced AI.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
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
