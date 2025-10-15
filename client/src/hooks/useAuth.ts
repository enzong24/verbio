import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import type { User } from "@shared/schema";

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    // Only fetch when Clerk is loaded AND has a user
    enabled: isLoaded && !!clerkUser,
  });

  return {
    user: user ?? null,
    isLoading: isLoading || !isLoaded,
    isAuthenticated: !!user,
    clerkUser, // Expose Clerk user for debugging
  };
}
