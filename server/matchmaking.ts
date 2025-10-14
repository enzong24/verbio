import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface Player {
  id: string;
  ws: WebSocket;
  username: string;
  elo: number;
  language: string;
  difficulty: string;
  topic?: string;
}

interface Match {
  id: string;
  player1: Player;
  player2: Player;
  topic: string;
  vocabulary: any[];
  createdAt: number;
  player1Registered: boolean;
  player2Registered: boolean;
}

class MatchmakingQueue {
  private queue: Player[] = [];
  private matches: Map<string, Match> = new Map();
  private playerSockets: Map<WebSocket, Player> = new Map();
  private activeMatches: Map<string, Match> = new Map();
  private playerToMatch: Map<string, string> = new Map();
  
  addToQueue(player: Player) {
    this.queue.push(player);
    this.playerSockets.set(player.ws, player);
    console.log(`Player ${player.username} (${player.elo} Elo) joined queue. Queue size: ${this.queue.length}`);
    
    // Try to find a match immediately
    this.tryMatch(player);
  }

  getPlayerBySocket(ws: WebSocket): Player | undefined {
    return this.playerSockets.get(ws);
  }

  updatePlayerSocket(playerId: string, matchId: string, ws: WebSocket) {
    const match = this.activeMatches.get(matchId);
    if (!match) {
      console.error(`Match ${matchId} not found for socket update`);
      return;
    }

    // Remove old socket mappings for this player to prevent stale disconnect triggers
    for (const [socket, player] of Array.from(this.playerSockets.entries())) {
      if (player.id === playerId) {
        this.playerSockets.delete(socket);
        console.log(`Removed old WebSocket mapping for player ${playerId}`);
      }
    }

    // Update the player's WebSocket reference and mark as registered
    if (match.player1.id === playerId) {
      match.player1.ws = ws;
      match.player1Registered = true;
      this.playerSockets.set(ws, match.player1);
      console.log(`Updated WebSocket for player1 ${playerId} in match ${matchId}`);
    } else if (match.player2.id === playerId) {
      match.player2.ws = ws;
      match.player2Registered = true;
      this.playerSockets.set(ws, match.player2);
      console.log(`Updated WebSocket for player2 ${playerId} in match ${matchId}`);
    }
  }

  removeFromQueue(ws: WebSocket) {
    const player = this.playerSockets.get(ws);
    if (player) {
      this.queue = this.queue.filter(p => p.id !== player.id);
      this.playerSockets.delete(ws);
      console.log(`Player ${player.username} removed from queue. Queue size: ${this.queue.length}`);
    }
  }

  private tryMatch(newPlayer: Player) {
    // Find an opponent with similar Elo (+/- 200) and same language/difficulty
    const potentialOpponents = this.queue.filter(p => 
      p.id !== newPlayer.id &&
      p.language === newPlayer.language &&
      p.difficulty === newPlayer.difficulty &&
      Math.abs(p.elo - newPlayer.elo) <= 200
    );

    if (potentialOpponents.length > 0) {
      // Find the closest Elo match
      const opponent = potentialOpponents.reduce((closest, current) => {
        const closestDiff = Math.abs(closest.elo - newPlayer.elo);
        const currentDiff = Math.abs(current.elo - newPlayer.elo);
        return currentDiff < closestDiff ? current : closest;
      });

      // Create a match
      this.createMatch(newPlayer, opponent);
    } else {
      // No match found - wait 10 seconds then assign AI bot
      setTimeout(() => {
        // Check if player is still in queue (not matched with someone else)
        if (this.queue.some(p => p.id === newPlayer.id)) {
          this.assignAIBot(newPlayer);
        }
      }, 10000); // 10 second wait time
    }
  }

  private async createMatch(player1: Player, player2: Player) {
    // Remove both players from queue
    this.queue = this.queue.filter(p => p.id !== player1.id && p.id !== player2.id);

    // Randomly select topic (or use player's selected topic for practice mode)
    const topic = player1.topic || this.getRandomTopic();

    // Randomly decide who starts first
    const player1StartsFirst = Math.random() < 0.5;

    const matchId = `${player1.id}-${player2.id}-${Date.now()}`;
    
    // Generate vocabulary once for both players
    const { generateVocabulary } = await import('./openai.js');
    const { vocabularyCache } = await import('./vocabularyCache.js');
    
    let vocabulary: any[] = [];
    try {
      // Check cache first
      const cachedVocabulary = vocabularyCache.get({ 
        topic, 
        language: player1.language, 
        difficulty: player1.difficulty 
      });
      
      if (cachedVocabulary) {
        vocabulary = cachedVocabulary;
        console.log(`Cache hit for vocabulary: ${topic}/${player1.language}/${player1.difficulty}`);
      } else {
        // Generate new vocabulary
        vocabulary = await generateVocabulary(topic, player1.language, player1.difficulty as "Beginner" | "Easy" | "Medium" | "Hard");
        vocabularyCache.set({ 
          topic, 
          language: player1.language, 
          difficulty: player1.difficulty 
        }, vocabulary);
        console.log(`Generated new vocabulary: ${topic}/${player1.language}/${player1.difficulty}`);
      }
    } catch (error) {
      console.error('Failed to generate vocabulary for match:', error);
      // Continue with empty vocabulary - frontend will handle fallback
    }
    
    const match: Match = {
      id: matchId,
      player1,
      player2,
      topic,
      vocabulary,
      createdAt: Date.now(),
      player1Registered: false,
      player2Registered: false,
    };

    this.matches.set(matchId, match);
    this.activeMatches.set(matchId, match);
    this.playerToMatch.set(player1.id, matchId);
    this.playerToMatch.set(player2.id, matchId);

    // Notify both players with the SAME vocabulary, language, and difficulty
    // Both players get player1's language/difficulty since that's what the vocabulary was generated for
    player1.ws.send(JSON.stringify({
      type: 'match_found',
      matchId,
      opponent: {
        username: player2.username,
        elo: player2.elo,
      },
      topic,
      vocabulary,
      language: player1.language,
      difficulty: player1.difficulty,
      isAI: false,
      startsFirst: player1StartsFirst,
    }));

    player2.ws.send(JSON.stringify({
      type: 'match_found',
      matchId,
      opponent: {
        username: player1.username,
        elo: player1.elo,
      },
      topic,
      vocabulary,
      language: player1.language,  // Use player1's language (matches vocabulary)
      difficulty: player1.difficulty,  // Use player1's difficulty (matches vocabulary)
      isAI: false,
      startsFirst: !player1StartsFirst,
    }));

    console.log(`Match created: ${player1.username} (${player1.elo}) vs ${player2.username} (${player2.elo}) - ${player1StartsFirst ? player1.username : player2.username} starts first`);
  }

  relayMessage(playerId: string, message: any) {
    const matchId = this.playerToMatch.get(playerId);
    if (!matchId) {
      console.error(`No active match found for player ${playerId}`);
      return;
    }

    const match = this.activeMatches.get(matchId);
    if (!match) {
      console.error(`Match ${matchId} not found in active matches`);
      return;
    }

    // Determine opponent
    const isPlayer1 = match.player1.id === playerId;
    const opponent = isPlayer1 ? match.player2 : match.player1;

    // Relay message to opponent
    if (opponent.ws.readyState === WebSocket.OPEN) {
      opponent.ws.send(JSON.stringify(message));
    }
  }

  handlePlayerDisconnect(playerId: string, disconnectedWs: WebSocket) {
    const matchId = this.playerToMatch.get(playerId);
    if (!matchId) return;

    const match = this.activeMatches.get(matchId);
    if (!match) return;

    const isPlayer1 = match.player1.id === playerId;
    const playerRegistered = isPlayer1 ? match.player1Registered : match.player2Registered;
    const currentPlayerWs = isPlayer1 ? match.player1.ws : match.player2.ws;
    
    // Priority 1: If player hasn't registered yet and we're within grace period,
    // defer the forfeit to give them time to register their duel socket
    if (!playerRegistered) {
      const matchAge = Date.now() - match.createdAt;
      const GRACE_PERIOD = 5000; // 5 seconds
      
      if (matchAge < GRACE_PERIOD) {
        console.log(`Scheduling deferred forfeit check for unregistered player ${playerId} in match ${matchId}`);
        setTimeout(() => {
          const stillExists = this.activeMatches.get(matchId);
          if (!stillExists) {
            console.log(`Match ${matchId} already cleaned up, skipping deferred forfeit`);
            return;
          }
          
          const stillUnregistered = isPlayer1 ? !stillExists.player1Registered : !stillExists.player2Registered;
          if (stillUnregistered) {
            console.log(`Player ${playerId} never registered, executing deferred forfeit for match ${matchId}`);
            this.executeForfeit(matchId, playerId);
          } else {
            console.log(`Player ${playerId} registered successfully, canceling deferred forfeit`);
          }
        }, GRACE_PERIOD);
        return;
      }
    }
    
    // Priority 2: If disconnecting socket is not the active socket and player is registered,
    // this is a stale socket closing - ignore it
    if (currentPlayerWs !== disconnectedWs && playerRegistered) {
      console.log(`Ignoring disconnect from stale socket for registered player ${playerId} in match ${matchId}`);
      return;
    }

    // Priority 3: Active socket disconnecting (or unregistered after grace period) - execute forfeit
    this.executeForfeit(matchId, playerId);
  }

  private executeForfeit(matchId: string, playerId: string) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    const isPlayer1 = match.player1.id === playerId;
    const opponent = isPlayer1 ? match.player2 : match.player1;

    if (opponent.ws.readyState === WebSocket.OPEN) {
      opponent.ws.send(JSON.stringify({
        type: 'opponent_disconnected',
        reason: 'Player disconnected'
      }));
    }

    // Clean up match
    this.activeMatches.delete(matchId);
    this.playerToMatch.delete(match.player1.id);
    this.playerToMatch.delete(match.player2.id);

    console.log(`Player ${playerId} disconnected from match ${matchId}`);
  }

  endMatch(matchId: string) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    // Clean up
    this.activeMatches.delete(matchId);
    this.playerToMatch.delete(match.player1.id);
    this.playerToMatch.delete(match.player2.id);

    console.log(`Match ${matchId} ended`);
  }

  private async assignAIBot(player: Player) {
    // Remove from queue
    this.queue = this.queue.filter(p => p.id !== player.id);

    // Use player's topic or random
    const topic = player.topic || this.getRandomTopic();

    // Generate random bot name
    const botName = this.getRandomBotName();

    // Get difficulty-appropriate bot Elo
    const { getBotElo } = await import('./botConfig.js');
    const botElo = getBotElo(player.difficulty);

    // Notify player - they'll play against AI
    player.ws.send(JSON.stringify({
      type: 'match_found',
      matchId: `ai-${player.id}-${Date.now()}`,
      opponent: {
        username: botName,
        elo: botElo, // Bot Elo reflects difficulty level
      },
      topic,
      language: player.language,
      difficulty: player.difficulty,
      isAI: true,
    }));

    console.log(`AI bot (${botName}, ${botElo} Elo) assigned to ${player.username} for ${player.difficulty} difficulty`);
  }

  private getRandomTopic(): string {
    const topics = [
      'Travel', 'Food & Dining', 'Business & Work', 'Family & Relationships',
      'Technology', 'Health & Fitness', 'Education', 'Entertainment',
      'Nature & Environment', 'Shopping', 'Sports', 'Weather',
      'Social Events', 'Music & Arts', 'Hobbies & Leisure', 'Home & Daily Life',
      'Transportation & Commute', 'Animals & Pets', 'Clothing & Fashion',
      'Holidays & Celebrations', 'Emotions & Feelings'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  private getRandomBotName(): string {
    const botNames = [
      'Emma Chen', 'Lucas Rodriguez', 'Sofia Martinez', 'Wei Zhang',
      'Aisha Patel', 'Nikolai Petrov', 'Isabella Rossi', 'Kenji Tanaka',
      'Leila Hassan', 'Marcus Johnson', 'Yuki Yamamoto', 'Fatima Al-Rashid',
      'Diego Silva', 'Amara Okafor', 'Sven Andersson', 'Priya Sharma',
      'Alexandre Dubois', 'Maya Cohen', 'Rashid Ahmed', 'Nina Kowalski',
      'Carlos Mendoza', 'Ingrid Larsson', 'Omar Hassan', 'Valentina Romano',
      'Jin Park', 'Aaliyah Thompson', 'Anton Volkov', 'Zara Ibrahim'
    ];
    return botNames[Math.floor(Math.random() * botNames.length)];
  }
}

export function setupMatchmaking(httpServer: Server) {
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/matchmaking'
  });

  const queue = new MatchmakingQueue();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join_queue') {
          const player: Player = {
            id: message.playerId || `player-${Date.now()}`,
            ws,
            username: message.username || 'Guest',
            elo: message.elo || 1000,
            language: message.language,
            difficulty: message.difficulty,
            topic: message.topic, // Optional - only for practice mode
          };
          queue.addToQueue(player);
        }

        if (message.type === 'leave_queue') {
          queue.removeFromQueue(ws);
        }

        if (message.type === 'register_match_socket') {
          // Update the player's WebSocket reference for this match
          queue.updatePlayerSocket(message.playerId, message.matchId, ws);
        }

        if (message.type === 'player_message') {
          // Relay message to opponent
          queue.relayMessage(message.playerId, {
            type: 'opponent_message',
            text: message.text,
            sender: message.sender,
            timestamp: message.timestamp
          });
        }

        if (message.type === 'player_turn_complete') {
          // Relay turn completion to opponent
          queue.relayMessage(message.playerId, {
            type: 'opponent_turn_complete',
            turnPhase: message.turnPhase
          });
        }

        if (message.type === 'match_end') {
          // End the match
          queue.endMatch(message.matchId);
        }

        if (message.type === 'player_forfeit') {
          // Notify opponent of forfeit
          queue.relayMessage(message.playerId, {
            type: 'opponent_forfeit'
          });
          queue.endMatch(message.matchId);
        }

        if (message.type === 'player_grading_result') {
          // Relay player's grading result to opponent
          queue.relayMessage(message.playerId, {
            type: 'opponent_grading_result',
            gradingResult: message.gradingResult
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Get player info before cleanup
      const player = queue.getPlayerBySocket(ws);
      
      // Clean up player from queue when connection closes
      queue.removeFromQueue(ws);
      
      // Handle active match disconnection (pass the socket to check if it's the active one)
      if (player) {
        queue.handlePlayerDisconnect(player.id, ws);
      }
      
      console.log('WebSocket connection closed - player removed from queue');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      
      // Get player info before cleanup
      const player = queue.getPlayerBySocket(ws);
      
      // Also remove from queue on error
      queue.removeFromQueue(ws);
      
      // Handle active match disconnection (pass the socket to check if it's the active one)
      if (player) {
        queue.handlePlayerDisconnect(player.id, ws);
      }
    });
  });

  console.log('WebSocket matchmaking server initialized on /matchmaking');

  return wss;
}
