import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
}

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Get the primary domain (first one in the list)
  const primaryDomain = process.env.REPLIT_DOMAINS!.split(",")[0];

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `https://${primaryDomain}/api/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          // Check if user exists by Google ID
          let [user] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, profile.id));

          if (user) {
            // Update user info
            const [updatedUser] = await db
              .update(users)
              .set({
                email,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                profileImageUrl: profile.photos?.[0]?.value,
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id))
              .returning();
            
            return done(null, updatedUser as any);
          }

          // Check if user exists by email (from previous auth system)
          if (email) {
            const [existingByEmail] = await db
              .select()
              .from(users)
              .where(eq(users.email, email));

            if (existingByEmail) {
              // Update existing user with Google ID
              const [updatedUser] = await db
                .update(users)
                .set({
                  googleId: profile.id,
                  firstName: profile.name?.givenName || existingByEmail.firstName,
                  lastName: profile.name?.familyName || existingByEmail.lastName,
                  profileImageUrl: profile.photos?.[0]?.value || existingByEmail.profileImageUrl,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingByEmail.id))
                .returning();
              
              return done(null, updatedUser as any);
            }
          }

          // Create new user
          const [newUser] = await db
            .insert(users)
            .values({
              googleId: profile.id,
              email,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profileImageUrl: profile.photos?.[0]?.value,
            })
            .returning();

          return done(null, newUser as any);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user as any);
    } catch (error) {
      done(error);
    }
  });

  app.get("/api/login", passport.authenticate("google", {
    scope: ["profile", "email"],
  }));

  app.get("/api/callback", 
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
