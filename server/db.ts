import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// Support either SUPABASE_URL + SERVICE_ROLE_KEY for full Supabase feature usage,
// or fall back to DATABASE_URL which can point to any Postgres-compatible host.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl && !databaseUrl) {
  throw new Error("Either SUPABASE_URL (with service role key) or DATABASE_URL is required");
}

// Initialize postgres client for Drizzle
const sql = databaseUrl ? postgres(databaseUrl, { ssl: 'require' }) : postgres(process.env.SUPABASE_DB_URL ?? '', { ssl: 'require' });

export const db = drizzle(sql, { schema });

// Export a Supabase admin client if service role key is provided
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey)
  : null;

// Database connection health monitoring
let queryCount = 0;
let errorCount = 0;
let lastReportTime = Date.now();

// Export stats for monitoring
export const dbStats = {
  getQueryCount: () => queryCount,
  getErrorCount: () => errorCount,
  getErrorRate: () => queryCount > 0 ? (errorCount / queryCount) * 100 : 0,
  incrementQuery: () => queryCount++,
  incrementError: () => errorCount++,
};

// Log database health stats periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const elapsed = (now - lastReportTime) / 1000 / 60; // minutes
  
  if (queryCount > 0 || errorCount > 0) {
    console.log(`[DB Health] ${Math.round(elapsed)}min - Queries: ${queryCount}, Errors: ${errorCount}, Error Rate: ${dbStats.getErrorRate().toFixed(2)}%`);
  }
  
  lastReportTime = now;
}, 300000); // 5 minutes
