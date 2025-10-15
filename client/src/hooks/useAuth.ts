import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import type { User } from "@shared/schema";

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  
  // Wait for Firebase auth to initialize and get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('[useAuth] Firebase auth state changed:', user ? user.email : 'null');
      setFirebaseUser(user as any);
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
    firebaseUser, // Expose Firebase user for debugging
  };
}
