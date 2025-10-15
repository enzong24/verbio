import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get Firebase auth token for API requests
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {};
  
  try {
    // Wait for Firebase to be ready if needed
    let currentUser = auth.currentUser;
    
    // If currentUser is null, wait a bit for Firebase to initialize
    if (!currentUser) {
      await new Promise(resolve => setTimeout(resolve, 100));
      currentUser = auth.currentUser;
    }
    
    console.log('[QueryClient] Getting auth headers, currentUser:', currentUser ? currentUser.email : 'null');
    
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      console.log('[QueryClient] Got token from currentUser, length:', idToken.length);
      headers['Authorization'] = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.error('[QueryClient] Failed to get Firebase token:', error);
  }
  
  console.log('[QueryClient] Returning headers with auth:', !!headers['Authorization']);
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  
  const res = await fetch(url, {
    method,
    headers: {
      ...authHeaders,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = await getAuthHeaders();
    
    const res = await fetch(queryKey.join("/") as string, {
      headers: authHeaders,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
