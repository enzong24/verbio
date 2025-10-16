import { useState, useEffect, useRef } from "react";
import { Send, Flag, Clock, HelpCircle, Swords, Type, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import VocabularyBadge from "@/components/VocabularyBadge";
import TextWithPinyin from "@/components/TextWithPinyin";
import AccentKeyboard from "@/components/AccentKeyboard";
import { useToast } from "@/hooks/use-toast";
import type { Message, GradingResult } from "@shared/schema";

interface VocabWord {
  word: string;
  romanization: string;
  definition?: string;
}

interface DuelInterfaceProps {
  topic?: string;
  vocabulary?: VocabWord[];
  opponentName?: string;
  opponentElo?: number;
  userElo?: number;
  isBot?: boolean;
  isPracticeMode?: boolean;
  language?: string;
  difficulty?: string;
  onComplete?: (result: GradingResult, messages?: Message[]) => void;
  onForfeit?: () => void;
  startsFirst?: boolean;
  matchId?: string;
  playerId?: string;
  multiplayerWsRef?: React.MutableRefObject<WebSocket | null>;
}

type TurnPhase = "bot-question" | "user-answer" | "user-question" | "bot-answer";

export default function DuelInterface({
  topic = "Travel & Tourism",
  vocabulary = [
    { word: "旅行", romanization: "lǚxíng" },
    { word: "目的地", romanization: "mùdìdì" },
    { word: "探索", romanization: "tànsuǒ" }
  ],
  opponentName = "AI Bot",
  opponentElo = 1520,
  userElo = 1000,
  isBot = true,
  isPracticeMode = false,
  language = "Chinese",
  difficulty = "Medium",
  onComplete,
  onForfeit,
  startsFirst = false,
  matchId,
  playerId,
  multiplayerWsRef
}: DuelInterfaceProps) {
  const { toast } = useToast();

  // Get timer duration based on difficulty
  const getTimerDuration = () => {
    switch (difficulty) {
      case "Beginner": return 120; // 2 minutes (very generous)
      case "Easy": return 90;      // 1.5 minutes
      case "Medium": return 60;    // 1 minute
      case "Hard": return 30;      // 30 seconds
      default: return 60;
    }
  };

  // Get max rounds based on difficulty
  const getMaxRounds = () => {
    switch (difficulty) {
      case "Beginner": return 2;   // Only 2 rounds for beginners
      case "Easy": return 3;
      case "Medium": return 4;
      case "Hard": return 5;
      default: return 3;
    }
  };

  // Determine initial turn phase based on who starts first
  const initialTurnPhase: TurnPhase = startsFirst ? "user-question" : "bot-question";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(getTimerDuration());
  const [round, setRound] = useState(1);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>(initialTurnPhase);
  const [isGrading, setIsGrading] = useState(false);
  const [botQuestions, setBotQuestions] = useState<string[]>([]);
  const [skippedQuestions, setSkippedQuestions] = useState(0);
  const [inactivityTimeLeft, setInactivityTimeLeft] = useState(60);
  const [validationError, setValidationError] = useState("");
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [showExample, setShowExample] = useState(false);
  const [exampleText, setExampleText] = useState("");
  const [helpPenalty, setHelpPenalty] = useState(0);
  const [helpUsedThisTurn, setHelpUsedThisTurn] = useState(false);
  const [usedVocabulary, setUsedVocabulary] = useState<Set<string>>(new Set());
  const [showAccentKeyboard, setShowAccentKeyboard] = useState(false);
  const [showTopicHeader, setShowTopicHeader] = useState(true);
  const [showHelpArea, setShowHelpArea] = useState(false); // Default to collapsed for mobile
  const maxRounds = getMaxRounds();
  
  // Refs to avoid recreating timer interval
  const shouldCountRef = useRef(false);
  const currentRoundRef = useRef(1);
  const currentTurnPhaseRef = useRef<TurnPhase>(initialTurnPhase);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityCountRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollLockActiveRef = useRef(false);

  const botQuestionMutation = useMutation({
    mutationFn: async () => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/bot-question", {
        topic,
        vocabulary: vocabStrings,
        language,
        difficulty,
        previousQuestions: botQuestions,
        isPracticeMode
      });
      return await response.json();
    },
  });

  const translateMutation = useMutation({
    mutationFn: async ({ text, fromLanguage }: { text: string; fromLanguage: string }) => {
      const response = await apiRequest("POST", "/api/translate", {
        text,
        fromLanguage,
        toLanguage: "English"
      });
      return await response.json();
    },
  });

  const exampleMutation = useMutation({
    mutationFn: async () => {
      // Prevent duplicate requests during the same turn
      if (helpUsedThisTurn) {
        throw new Error("Help already used this turn");
      }

      const vocabStrings = vocabulary.map(v => v.word);
      const currentBotQuestion = messages.filter(m => m.sender === "opponent").slice(-1)[0]?.text || "";
      const requestedRound = round; // Capture round when request is made
      const requestedPhase = turnPhase; // Capture phase when request is made
      
      const response = await apiRequest("POST", "/api/generate-example", {
        language,
        difficulty,
        topic,
        vocabulary: vocabStrings,
        phase: turnPhase === "user-question" ? "user-question" : "user-answer",
        context: turnPhase === "user-answer" ? currentBotQuestion : undefined
      });
      const result = await response.json();
      return { ...result, requestedRound, requestedPhase }; // Return with round and phase markers
    },
    onSuccess: (data) => {
      // Only apply help if we're still on the same round and phase
      if (data.requestedRound === round && data.requestedPhase === turnPhase) {
        setExampleText(data.example);
        setShowExample(true);
        setHelpUsedThisTurn(true);
        setHelpPenalty(prev => prev + 15); // 15 point penalty for using help
      }
      // Otherwise, ignore stale response from a previous turn
    },
    onError: (error: any) => {
      console.error("Failed to generate example:", error);
      toast({
        title: "Failed to generate example",
        description: "Please try again or continue without help.",
        variant: "destructive"
      });
    }
  });

  const botAnswerMutation = useMutation({
    mutationFn: async (userQuestion: string) => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/bot-answer", {
        userQuestion,
        topic,
        vocabulary: vocabStrings,
        language,
        difficulty,
        isPracticeMode
      });
      return await response.json();
    },
  });

  const validateQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/validate-question", {
        question,
        topic,
        vocabulary: vocabStrings,
        language
      });
      return await response.json();
    },
  });

  const gradingMutation = useMutation({
    mutationFn: async (messagesToGrade: Message[]) => {
      const response = await apiRequest("POST", "/api/grade", {
        messages: messagesToGrade,
        topic,
        vocabulary: vocabulary.map(v => v.word),
        language,
        difficulty,
        skippedQuestions
      });
      return await response.json();
    },
  });

  // Setup WebSocket message handlers for human vs human matches
  useEffect(() => {
    if (!isBot && matchId && playerId && multiplayerWsRef?.current) {
      const ws = multiplayerWsRef.current;
      
      // Set up message handlers on the existing WebSocket from App.tsx
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'opponent_message') {
            // Receive opponent's message
            setMessages(prev => [...prev, { 
              sender: "opponent", 
              text: data.text, 
              timestamp: data.timestamp 
            }]);
          }
          
          if (data.type === 'opponent_turn_complete') {
            // Opponent completed their turn, now it's our turn
            setTurnPhase(data.turnPhase);
            currentTurnPhaseRef.current = data.turnPhase;
            shouldCountRef.current = true;
            setTimeLeft(getTimerDuration());
            resetInactivity();
          }
          
          if (data.type === 'opponent_disconnected') {
            // Opponent disconnected, you win by forfeit
            handleOpponentForfeit();
          }
          
          if (data.type === 'opponent_forfeit') {
            // Opponent forfeited, you win!
            handleOpponentForfeit();
          }
          
          // opponent_grading_result is handled by App.tsx
        } catch (error) {
          console.error('DuelInterface: WebSocket message error:', error);
        }
      };
      
      ws.addEventListener('message', messageHandler);
      
      return () => {
        // Remove our message handler but don't close the WebSocket
        ws.removeEventListener('message', messageHandler);
      };
    }
  }, [isBot, matchId, playerId, multiplayerWsRef?.current]);

  // Initialize with bot question only if bot starts first (only for AI opponents)
  useEffect(() => {
    if (isBot && !startsFirst) {
      botQuestionMutation.mutate();
    } else if (startsFirst || !isBot) {
      // User starts first or human match, enable timer and inactivity tracking immediately
      shouldCountRef.current = true;
      inactivityCountRef.current = true;
      setTimeLeft(getTimerDuration());
      setInactivityTimeLeft(60);
    }
  }, []);

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      // Restore body styles and scroll position if component unmounts while scroll is locked
      if (scrollLockActiveRef.current) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        scrollLockActiveRef.current = false;
      }
    };
  }, []);

  // Update when bot question is ready
  useEffect(() => {
    if (botQuestionMutation.isSuccess && botQuestionMutation.data) {
      const botQuestion = botQuestionMutation.data.question;
      setBotQuestions(prev => [...prev, botQuestion]);
      setMessages(prev => [...prev, { sender: "opponent", text: botQuestion, timestamp: Date.now() }]);
      setTurnPhase("user-answer");
      currentTurnPhaseRef.current = "user-answer";
      shouldCountRef.current = true;
      setTimeLeft(getTimerDuration());
      resetInactivity();
    }
  }, [botQuestionMutation.isSuccess, botQuestionMutation.data]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update when bot answer is ready
  useEffect(() => {
    if (botAnswerMutation.isSuccess && botAnswerMutation.data) {
      const newMessage = { sender: "opponent" as const, text: botAnswerMutation.data.answer, timestamp: Date.now() };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      if (round >= maxRounds) {
        shouldCountRef.current = false;
        setIsGrading(true);
        gradingMutation.mutate(updatedMessages);
      } else {
        setRound(prev => prev + 1);
        currentRoundRef.current = round + 1;
        setTimeout(() => {
          botQuestionMutation.mutate();
        }, 500);
      }
    }
  }, [botAnswerMutation.isSuccess, botAnswerMutation.data]);

  // Update when grading is complete
  useEffect(() => {
    if (gradingMutation.isSuccess && gradingMutation.data) {
      // Apply help penalty to the grading result
      const adjustedResult = {
        ...gradingMutation.data,
        overall: Math.max(0, gradingMutation.data.overall - helpPenalty)
      };

      // Send grading result to opponent if multiplayer
      if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN && matchId && playerId) {
        console.log('DuelInterface: Sending player grading result to opponent');
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_grading_result',
          playerId,
          matchId,
          gradingResult: {
            grammar: adjustedResult.grammar,
            fluency: adjustedResult.fluency,
            vocabulary: adjustedResult.vocabulary,
            naturalness: adjustedResult.naturalness,
            overall: adjustedResult.overall
          }
        }));
      }
      
      onComplete?.(adjustedResult, messages);
    }
  }, [gradingMutation.isSuccess, gradingMutation.data, multiplayerWsRef, helpPenalty]);

  // Reset example when turn phase changes
  useEffect(() => {
    setShowExample(false);
    setExampleText("");
    setHelpUsedThisTurn(false);
  }, [turnPhase]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldCountRef.current && timeLeft > 0) {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          console.log(`Timer counting: ${prev} -> ${newTime}`);
          if (newTime === 0) {
            handleTimeUp();
          }
          return newTime;
        });
      }

      if (inactivityCountRef.current && inactivityTimeLeft > 0) {
        setInactivityTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime === 0) {
            handleInactivityTimeout();
          }
          return newTime;
        });
      }
    }, 1000);

    return () => {
      console.log("Cleaning up timer interval");
      clearInterval(interval);
    };
  }, [timeLeft, inactivityTimeLeft]);

  const resetInactivity = () => {
    setInactivityTimeLeft(60);
    inactivityCountRef.current = true;
  };

  const handleInactivityTimeout = () => {
    inactivityCountRef.current = false;
    handleForfeit();
  };

  const handleTimeUp = () => {
    shouldCountRef.current = false;
    
    if (currentTurnPhaseRef.current === "user-answer") {
      handleDontKnow();
    } else if (currentTurnPhaseRef.current === "user-question") {
      handleDontKnow();
    }
  };

  // Helper function to mark vocabulary as used in a message (case-insensitive)
  const markVocabularyAsUsed = (text: string) => {
    const lowerText = text.toLowerCase();
    const newUsedVocab = new Set(usedVocabulary);
    
    vocabulary.forEach((vocabItem) => {
      if (lowerText.includes(vocabItem.word.toLowerCase())) {
        newUsedVocab.add(vocabItem.word);
      }
    });
    
    setUsedVocabulary(newUsedVocab);
  };

  const handleSend = async () => {
    // Prevent sending during any loading state
    if (!input.trim() || !isUserTurn || isGrading || 
        validateQuestionMutation.isPending || 
        botQuestionMutation.isPending || 
        botAnswerMutation.isPending) return;

    const messageToSend = input;
    const timestamp = Date.now();

    if (turnPhase === "user-answer") {
      shouldCountRef.current = false;
      setMessages(prev => [...prev, { sender: "user", text: messageToSend, timestamp }]);
      setInput("");
      
      // Mark vocabulary as permanently used
      markVocabularyAsUsed(messageToSend);
      
      // Send message to opponent if multiplayer
      if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN) {
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_message',
          playerId,
          text: messageToSend,
          sender: "user",
          timestamp
        }));
      }
      
      setTurnPhase("user-question");
      currentTurnPhaseRef.current = "user-question";
      setTimeLeft(getTimerDuration());
      shouldCountRef.current = true;
      resetInactivity();
    } else if (turnPhase === "user-question") {
      const validation = await validateQuestionMutation.mutateAsync(messageToSend);
      
      if (!validation.isValid) {
        setValidationError(validation.message || "Invalid question. Please try asking something related to the topic.");
        return;
      }

      shouldCountRef.current = false;
      setMessages(prev => [...prev, { sender: "user", text: messageToSend, timestamp }]);
      setInput("");
      
      // Mark vocabulary as permanently used
      markVocabularyAsUsed(messageToSend);
      
      // For multiplayer: send message and wait for opponent's answer
      if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN) {
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_message',
          playerId,
          text: messageToSend,
          sender: "user",
          timestamp
        }));
        
        // Notify opponent that it's their turn to answer
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_turn_complete',
          playerId,
          turnPhase: "user-answer"
        }));
        
        // Wait for opponent's answer
        setTurnPhase("bot-answer");
        currentTurnPhaseRef.current = "bot-answer";
        shouldCountRef.current = false;
      } else {
        // For AI: use bot answer mutation
        setTurnPhase("bot-answer");
        currentTurnPhaseRef.current = "bot-answer";
        botAnswerMutation.mutate(messageToSend);
      }
      resetInactivity();
    }
  };

  const handleDontKnow = () => {
    shouldCountRef.current = false;
    setSkippedQuestions(prev => prev + 1);
    
    if (turnPhase === "user-answer") {
      setMessages(prev => [...prev, { sender: "user", text: "(Skipped)", timestamp: Date.now() }]);
      setTurnPhase("user-question");
      currentTurnPhaseRef.current = "user-question";
      setTimeLeft(getTimerDuration());
      shouldCountRef.current = true;
      resetInactivity();
    } else if (turnPhase === "user-question") {
      setMessages(prev => [...prev, { sender: "user", text: "(Skipped)", timestamp: Date.now() }]);
      setTurnPhase("bot-answer");
      currentTurnPhaseRef.current = "bot-answer";
      const defaultQuestion = language === "Chinese" ? "请告诉我更多" : 
                             language === "Spanish" ? "Cuéntame más" : 
                             "Raccontami di più";
      botAnswerMutation.mutate(defaultQuestion);
      resetInactivity();
    }
  };

  const handleForfeit = () => {
    shouldCountRef.current = false;
    inactivityCountRef.current = false;
    
    // Notify opponent if multiplayer
    if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN && matchId && playerId) {
      multiplayerWsRef.current.send(JSON.stringify({
        type: 'player_forfeit',
        playerId,
        matchId
      }));
    }
    
    onForfeit?.();
  };

  const handleOpponentForfeit = () => {
    shouldCountRef.current = false;
    inactivityCountRef.current = false;
    
    // When opponent forfeits, complete the match with a win for the current player
    // Set opponent scores to 0 and user scores high to ensure a win
    onComplete?.({
      grammar: 90,
      fluency: 90,
      vocabulary: 90,
      naturalness: 90,
      overall: 90,
      botGrammar: 0,
      botFluency: 0,
      botVocabulary: 0,
      botNaturalness: 0,
      botOverall: 0,
      botElo: opponentElo,
      feedback: ["Opponent forfeited. You win!"],
      isForfeit: true // Match ended by forfeit, show forfeit message for both players
    });
  };

  const handleAccentClick = (accent: string) => {
    const cursorPosition = inputRef.current?.selectionStart || input.length;
    const newInput = input.slice(0, cursorPosition) + accent + input.slice(cursorPosition);
    setInput(newInput);
    
    // Focus input and set cursor position after the inserted accent
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursorPosition + accent.length, cursorPosition + accent.length);
    }, 0);
  };

  const progress = (round / maxRounds) * 100;
  const isUserTurn = turnPhase === "user-answer" || turnPhase === "user-question";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-env(safe-area-inset-top))]" style={{ marginTop: '4rem' }}>
      {/* Desktop Header - opponent info, timer, forfeit */}
      <div className="border-b bg-card p-2 md:p-4 shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-primary flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs md:text-sm">
                {opponentName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold flex items-center gap-1 md:gap-2 text-sm md:text-base truncate" data-testid="text-opponent-name">
                <span className="truncate">{opponentName}</span>
                {isBot && <Badge className="text-xs flex-shrink-0 bg-accent/20 text-accent border-accent/30">Bot</Badge>}
              </div>
              {!isPracticeMode && difficulty !== "Beginner" ? (
                <div className="text-xs text-muted-foreground font-mono">{opponentElo} Fluency</div>
              ) : isPracticeMode || difficulty === "Beginner" ? (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Hover over bot messages for translations
                </div>
              ) : (
                <div className="text-xs text-muted-foreground font-mono">{opponentElo} Fluency</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="flex items-center gap-1 md:gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`} data-testid="text-timer">
                  {timeLeft}s
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Round: {round}/{maxRounds}
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={handleForfeit}
              disabled={isGrading}
              data-testid="button-forfeit"
              className="flex-shrink-0 min-h-[48px] md:min-h-[40px] px-4"
            >
              <Flag className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Forfeit</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile-only compact header with timer and forfeit */}
      <div className="md:hidden border-b bg-card px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-primary" />
          <span className={`font-mono font-bold text-sm ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`}>
            {timeLeft}s
          </span>
          <span className="text-xs text-muted-foreground">R{round}/{maxRounds}</span>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleForfeit}
          disabled={isGrading}
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <Flag className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Topic Header */}
            <div className="border-b bg-card">
              <button 
                className="w-full p-2 md:p-4 flex items-center justify-between cursor-pointer hover-elevate text-left"
                onClick={() => setShowTopicHeader(!showTopicHeader)}
                data-testid="button-toggle-topic-header"
                aria-expanded={showTopicHeader}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent items-center justify-center hidden md:flex">
                    <Swords className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs md:text-base">Topic:</span>
                    <Badge className="ml-1 md:ml-2 text-[10px] md:text-sm bg-accent/20 text-accent border-accent/30">{topic}</Badge>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {showTopicHeader ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              
              {showTopicHeader && (
                <>
                  <div className="px-2 md:px-4 pb-2 flex flex-wrap gap-1 md:gap-2">
                    {vocabulary.map((vocabItem) => {
                      const isUsed = usedVocabulary.has(vocabItem.word);
                      return (
                        <div 
                          key={vocabItem.word}
                          className={`transition-all ${isUsed ? 'opacity-40 line-through' : ''}`}
                          data-testid={`vocab-badge-${vocabItem.word}`}
                          aria-label={isUsed ? 'used' : 'unused'}
                        >
                          <VocabularyBadge 
                            chinese={vocabItem.word}
                            pinyin={vocabItem.romanization}
                            language={language}
                            className="text-[10px] md:text-xs"
                            definition={vocabItem.definition}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-2 md:px-4 pb-2 text-[10px] md:text-sm font-medium">
                    {turnPhase === "user-answer" && (
                      <>
                        <span className="md:hidden text-primary">⏳ Answer</span>
                        <span className="hidden md:inline text-primary">⏳ Your turn to answer the question</span>
                      </>
                    )}
                    {turnPhase === "user-question" && (
                      <>
                        <span className="md:hidden text-accent">❓ Ask</span>
                        <span className="hidden md:inline text-accent">❓ Your turn to ask a question using vocabulary</span>
                      </>
                    )}
                    {turnPhase === "bot-question" && (
                      <span className="text-muted-foreground">
                        <span className="md:hidden">{isBot ? "🤖" : "⏳"}</span>
                        <span className="hidden md:inline">{isBot ? "🤖 Bot is thinking..." : "⏳ Opponent is thinking..."}</span>
                      </span>
                    )}
                    {turnPhase === "bot-answer" && (
                      <span className="text-success">
                        <span className="md:hidden">{isBot ? "🤖" : "💬"}</span>
                        <span className="hidden md:inline">{isBot ? "🤖 Bot is answering..." : "💬 Opponent is answering..."}</span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 md:p-6 space-y-2 md:space-y-4" data-testid="chat-messages">
              {messages.map((msg, idx) => {
                const isBotMessage = msg.sender === "opponent";
                const shouldShowTranslation = isBotMessage && (isPracticeMode || difficulty === "Beginner");
                const isHovered = hoveredMessageIndex === idx;
                const translation = translations[idx];

                return (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`inline-block max-w-[85%] md:max-w-2xl px-2 py-2 md:px-4 md:py-3 rounded-md text-sm md:text-base ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } ${shouldShowTranslation ? "cursor-help transition-all" : ""}`}
                      onMouseEnter={() => {
                        if (shouldShowTranslation && msg.text !== "(Skipped)") {
                          setHoveredMessageIndex(idx);
                          // Fetch translation if not already cached
                          if (!translations[idx]) {
                            translateMutation.mutate(
                              { text: msg.text, fromLanguage: language },
                              {
                                onSuccess: (data) => {
                                  setTranslations(prev => ({ ...prev, [idx]: data.translation }));
                                }
                              }
                            );
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        if (shouldShowTranslation) {
                          setHoveredMessageIndex(null);
                        }
                      }}
                    >
                      {msg.text === "(Skipped)" ? (
                        <span className="italic opacity-60">Skipped question</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div>
                            <TextWithPinyin text={msg.text} language={language} />
                          </div>
                          {shouldShowTranslation && isHovered && translation && (
                            <div className="pt-2 border-t border-primary/20 text-sm italic opacity-80">
                              {translation}
                            </div>
                          )}
                          {shouldShowTranslation && isHovered && !translation && translateMutation.isPending && (
                            <div className="pt-2 border-t border-primary/20 text-sm italic opacity-60">
                              Translating...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isGrading && (
                <div className="flex justify-center">
                  <Badge className="animate-pulse text-xs md:text-sm bg-accent/20 text-accent border-accent/30">
                    AI is grading your performance...
                  </Badge>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Sticky to bottom */}
            <div className="sticky bottom-0 border-t bg-card pb-safe-bottom z-10">
              {/* Help Area Toggle */}
              <button 
                className="w-full p-2 md:p-3 flex items-center justify-between border-b cursor-pointer hover-elevate text-left"
                onClick={() => setShowHelpArea(!showHelpArea)}
                data-testid="button-toggle-help-area"
                aria-expanded={showHelpArea}
              >
                <span className="text-xs text-muted-foreground">Help & Tools</span>
                <div className="flex-shrink-0">
                  {showHelpArea ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </div>
              </button>

              {showHelpArea && (
                <div className="p-3 md:p-4 border-b">
                  {/* Buttons row - Accent keyboard toggle and Need help side by side */}
                  <div className="flex gap-2 mb-2">
                    {/* Accent Keyboard Toggle - Now available on mobile */}
                    {(language === "Spanish" || language === "Italian") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAccentKeyboard(!showAccentKeyboard)}
                        data-testid="button-toggle-accent-keyboard"
                        className="h-9 flex-1"
                      >
                        <Type className="w-3 h-3 mr-1" />
                        <span className="text-xs">{showAccentKeyboard ? "Hide" : "Show"} accents</span>
                      </Button>
                    )}
                    
                    {/* Need Help Button */}
                    {isUserTurn && !isGrading && !showExample && !helpUsedThisTurn && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exampleMutation.mutate()}
                        disabled={exampleMutation.isPending || helpUsedThisTurn}
                        data-testid="button-need-help"
                        className="h-9 flex-1"
                      >
                        <HelpCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">{exampleMutation.isPending ? "Generating..." : "Need help? (-15pts)"}</span>
                      </Button>
                    )}
                  </div>
                  
                  {/* Accent Keyboard - Now available on mobile when toggled */}
                  {showAccentKeyboard && (
                    <div>
                      <AccentKeyboard language={language} onAccentClick={handleAccentClick} />
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 md:p-4">
                {/* Example Display */}
                {showExample && exampleText && (
                  <Card className="mb-3 border-highlight/30 bg-highlight/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Example {turnPhase === "user-question" ? "Question" : "Answer"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-foreground">
                        <TextWithPinyin text={exampleText} language={language} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Use this as inspiration! (-15 points applied)
                      </p>
                    </CardContent>
                  </Card>
                )}

                {validationError && (
                  <div className="mb-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-xs md:text-sm" data-testid="validation-error">
                    {validationError}
                  </div>
                )}
                <div className="flex gap-2 items-end">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    const newInput = e.target.value;
                    setInput(newInput);
                    resetInactivity();
                    if (validationError) setValidationError("");
                    
                    // Check for vocabulary words in real-time (case-insensitive)
                    const newUsedVocab = new Set(usedVocabulary); // Start with already used words
                    const lowerInput = newInput.toLowerCase();
                    
                    vocabulary.forEach((vocabItem) => {
                      // Case-insensitive check
                      if (lowerInput.includes(vocabItem.word.toLowerCase())) {
                        newUsedVocab.add(vocabItem.word);
                      }
                    });
                    
                    setUsedVocabulary(newUsedVocab);
                  }}
                  onFocus={() => {
                    // Lock scroll position when keyboard opens (only if not already locked)
                    if (!scrollLockActiveRef.current) {
                      const scrollY = window.scrollY;
                      document.body.style.position = 'fixed';
                      document.body.style.top = `-${scrollY}px`;
                      document.body.style.width = '100%';
                      document.body.style.overflow = 'hidden';
                      scrollLockActiveRef.current = true;
                    }
                  }}
                  onBlur={() => {
                    // Restore scroll position when keyboard closes
                    if (scrollLockActiveRef.current) {
                      const scrollY = document.body.style.top;
                      document.body.style.position = '';
                      document.body.style.top = '';
                      document.body.style.width = '';
                      document.body.style.overflow = '';
                      if (scrollY) {
                        window.scrollTo(0, parseInt(scrollY || '0') * -1);
                      }
                      scrollLockActiveRef.current = false;
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    turnPhase === "user-answer" 
                      ? `Answer in ${language}...` 
                      : `Ask a question in ${language}...`
                  }
                  className="flex-1 text-base min-h-[48px] md:min-h-[40px]"
                  disabled={!isUserTurn || isGrading || validateQuestionMutation.isPending || botQuestionMutation.isPending || botAnswerMutation.isPending}
                  data-testid="input-message"
                />
                {turnPhase === "user-answer" && (
                  <Button 
                    variant="outline"
                    onClick={handleDontKnow} 
                    disabled={isGrading || validateQuestionMutation.isPending || botQuestionMutation.isPending || botAnswerMutation.isPending}
                    data-testid="button-dont-know"
                    className="flex-shrink-0 min-h-[48px] md:min-h-[40px] px-3 md:px-4"
                  >
                    <HelpCircle className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">Skip (-20pts)</span>
                  </Button>
                )}
                <Button 
                  onClick={handleSend} 
                  disabled={!isUserTurn || isGrading || validateQuestionMutation.isPending || botQuestionMutation.isPending || botAnswerMutation.isPending}
                  data-testid="button-send"
                  className="flex-shrink-0 min-h-[48px] md:min-h-[40px] px-4"
                >
                  <Send className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Send</span>
                </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel - Progress */}
          <div className="hidden md:block md:w-64 md:border-l bg-card p-3 md:p-4">
            <div className="mb-4 hidden md:block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Match Progress</span>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="border-accent/30 bg-accent/5 hidden md:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`
                  ${difficulty === 'Easy' ? 'bg-success/20 text-success border-success/30' : ''}
                  ${difficulty === 'Medium' ? 'bg-highlight/20 text-highlight-foreground border-highlight/30' : ''}
                  ${difficulty === 'Hard' ? 'bg-destructive/20 text-destructive border-destructive/30' : ''}
                `}>
                  {difficulty}
                </Badge>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <div>• {getTimerDuration()}s per turn</div>
                  <div>• {maxRounds} rounds total</div>
                  <div>• {skippedQuestions} questions skipped</div>
                </div>
              </CardContent>
            </Card>

            {!isPracticeMode && (
              <Card className="mt-3 border-primary/30 bg-primary/5 hidden md:block">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Fluency Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">{userElo}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
