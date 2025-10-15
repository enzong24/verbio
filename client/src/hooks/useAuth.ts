import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import type { User } from "@shared/schema";

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  
  // Wait for Firebase auth to initialize
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setFirebaseReady(true);
    });
    return () => unsubscribe();
  }, []);
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    enabled: firebaseReady, // Only fetch when Firebase is ready
  });

  return {
    user: user ?? null,
    isLoading: isLoading || !firebaseReady,
    isAuthenticated: !!user,
  };
}
