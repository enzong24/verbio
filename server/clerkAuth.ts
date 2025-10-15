import { type Request, Response, NextFunction } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { storage } from "./storage";

// Extend Express Request type to include Clerk auth
declare global {
  namespace Express {
    interface Request {
      clerkUser?: {
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
      };
    }
  }
}

// Middleware to verify Clerk session and sync user to database
export async function verifyClerkAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  // Skip auth check for public endpoints
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    // Use Clerk's built-in Express middleware to verify the session token
    const clerkMiddleware = ClerkExpressRequireAuth();
    
    await new Promise<void>((resolve, reject) => {
      clerkMiddleware(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get Clerk user from the authenticated request
    const clerkAuth = (req as any).auth;
    if (!clerkAuth?.userId) {
      return next();
    }

    // Fetch user details from Clerk
    const { clerkClient } = await import("@clerk/clerk-sdk-node");
    const clerkUser = await clerkClient.users.getUser(clerkAuth.userId);

    // Sync user to our database (create or update)
    const email = clerkUser.emailAddresses[0]?.emailAddress || null;
    const firstName = clerkUser.firstName || null;
    const lastName = clerkUser.lastName || null;
    const imageUrl = clerkUser.imageUrl || null;

    // Create or update user in database
    await storage.upsertUser({
      id: clerkAuth.userId,
      email,
      firstName,
      lastName,
      profileImageUrl: imageUrl,
    });

    // Attach user info to request for downstream use
    (req as any).clerkUser = {
      id: clerkAuth.userId,
      email,
      firstName,
      lastName,
      imageUrl,
    };

    next();
  } catch (error) {
    console.error('[Clerk Auth] Error verifying token:', error);
    next(); // Continue without auth - let routes handle authorization
  }
}
