import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure Neon connection
// Neon automatically handles connection pooling via serverless architecture
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

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
