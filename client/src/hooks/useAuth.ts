import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { establishBackendSession } from "@/lib/firebaseAuth";
import type { User } from "@shared/schema";

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  
  // Wait for Firebase auth to initialize and get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('[useAuth] Firebase auth state changed:', user ? user.email : 'null');
      setFirebaseUser(user);
      
      // If user exists on app start, establish backend session
      if (user) {
        console.log('[useAuth] User found on app start, establishing backend session');
        await establishBackendSession();
      }
      
      setFirebaseReady(true);
    });
    return () => unsubscribe();
  }, []);
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    // Only fetch when Firebase is ready AND has a user
    enabled: firebaseReady && !!firebaseUser,
  });

  return {
    user: user ?? null,
    isLoading: isLoading || !firebaseReady,
    isAuthenticated: !!user,
    firebaseUser, // Expose Firebase user for debugging
  };
}
