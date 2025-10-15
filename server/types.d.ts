// Type definitions for Express with Replit Auth
declare namespace Express {
  interface User {
    claims?: {
      sub: string;
      email?: string;
      name?: string;
      [key: string]: any;
    };
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }
}
