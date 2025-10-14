import { useState, useEffect, useRef, useCallback } from 'react';

interface MatchFoundData {
  matchId: string;
  opponent: {
    username: string;
    elo: number;
  };
  topic: string;
  language: string;
  difficulty: string;
  isAI: boolean;
  startsFirst?: boolean;
  vocabulary?: any[];
}

interface UseMatchmakingOptions {
  playerId: string;
  username: string;
  elo: number;
  onMatchFound: (data: MatchFoundData) => void;
}

export function useMatchmaking({ playerId, username, elo, onMatchFound }: UseMatchmakingOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const isSearchingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate connections in StrictMode
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Get WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/matchmaking`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'match_found') {
          setIsSearching(false);
          isSearchingRef.current = false;
          onMatchFound({
            matchId: data.matchId,
            opponent: data.opponent,
            topic: data.topic,
            language: data.language,
            difficulty: data.difficulty,
            isAI: data.isAI,
            startsFirst: data.startsFirst,
            vocabulary: data.vocabulary, // Pass vocabulary from server
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsSearching(false);
      isSearchingRef.current = false;
    };

    wsRef.current = ws;

    return () => {
      // Send leave_queue before closing if currently searching
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        if (isSearchingRef.current) {
          wsRef.current.send(JSON.stringify({ type: 'leave_queue' }));
        }
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [onMatchFound]);

  const findMatch = useCallback((language: string, difficulty: string, topic?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsSearching(true);
      isSearchingRef.current = true;
      wsRef.current.send(JSON.stringify({
        type: 'join_queue',
        playerId,
        username,
        elo,
        language,
        difficulty,
        topic, // Optional - only for practice mode
      }));
    }
  }, [playerId, username, elo]);

  const cancelSearch = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsSearching(false);
      isSearchingRef.current = false;
      wsRef.current.send(JSON.stringify({
        type: 'leave_queue',
      }));
    }
  }, []);

  return {
    isConnected,
    isSearching,
    findMatch,
    cancelSearch,
  };
}
