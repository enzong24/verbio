import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, or } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

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
      sameSite: 'lax',
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

  // Local (username/password) strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username));

        if (!user || !user.password) {
          return done(null, false);
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false);
        }

        return done(null, user as any);
      } catch (error) {
        return done(error as Error);
      }
    })
  );

  // Google OAuth strategy
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
      if (!user) {
        // User doesn't exist anymore, clear session
        return done(null, false);
      }
      done(null, user as any);
    } catch (error) {
      // On error, clear session instead of propagating error
      done(null, false);
    }
  });

  // Username/password registration
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;

      // Check if username already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(or(eq(users.username, username), eq(users.email, email)));

      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: await hashPassword(password),
          email,
          firstName,
          lastName,
        })
        .returning();

      // Log the user in
      req.login(newUser as any, (err) => {
        if (err) return next(err);
        res.status(201).json(newUser);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Username/password login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  // Google OAuth login
  app.get("/api/login/google", passport.authenticate("google", {
    scope: ["profile", "email"],
  }));

  // Google OAuth callback
  app.get("/api/callback", 
    passport.authenticate("google", { failureRedirect: "/signin" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // Logout (support both GET and POST)
  const logoutHandler = (req: any, res: any) => {
    req.logout(() => {
      // If it's a GET request (browser navigation), redirect to landing
      if (req.method === 'GET') {
        res.redirect('/');
      } else {
        // If it's a POST request (API call), return success
        res.json({ message: "Logged out successfully" });
      }
    });
  };
  
  app.get("/api/logout", logoutHandler);
  app.post("/api/logout", logoutHandler);
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
