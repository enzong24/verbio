// Firebase authentication verification
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// IMPORTANT: This is a simplified JWT decoder for development
// In production, use Firebase Admin SDK to properly verify token signatures
// Install: npm install firebase-admin
// Then use: admin.auth().verifyIdToken(idToken)

// Middleware to verify Firebase ID token and sync with database
export const verifyFirebaseToken: RequestHandler = async (req, res, next) => {
  try {
    // Firebase ID token should be sent in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    let userId: string;
    let email: string;
    let name: string | undefined;
    
    try {
      // Decode JWT payload (WARNING: This does NOT verify signature!)
      // For production, replace this with Firebase Admin SDK verification
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      
      // Check expiry
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.warn('Firebase token expired');
        return next();
      }
      
      userId = payload.sub || payload.user_id;
      email = payload.email;
      name = payload.name;
      
      if (!userId || !email) {
        return next();
      }
    } catch (decodeError) {
      console.error('Failed to decode Firebase token:', decodeError);
      return next();
    }

    // Check if user exists in database, create if not
    let user = await storage.getUser(userId);
    
    if (!user) {
      // Create new user from Firebase data using upsertUser
      user = await storage.upsertUser({
        id: userId,
        email: email,
        firstName: name?.split(' ')[0] || email.split('@')[0],
        lastName: name?.split(' ').slice(1).join(' ') || '',
      });
    }

    // Check if email is in premium whitelist and auto-grant premium
    const isWhitelisted = await storage.isEmailWhitelisted(email);
    if (isWhitelisted && user.isPremium === 0) {
      // Automatically grant premium to whitelisted users
      await storage.upsertUser({
        ...user,
        isPremium: 1,
      });
      console.log(`Auto-granted premium to whitelisted user: ${email}`);
    }

    // Attach user to request object
    (req as any).firebaseUser = {
      id: userId,
      email: email,
      name: name,
    };
    
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    next();
  }
};

// Helper to check if user is authenticated via Firebase
export function isFirebaseAuthenticated(req: Express.Request): boolean {
  return !!(req as any).firebaseUser;
}

// Helper to get Firebase user from request
export function getFirebaseUser(req: Express.Request) {
  return (req as any).firebaseUser;
}
