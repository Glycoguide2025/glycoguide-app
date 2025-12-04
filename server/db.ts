import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool with better settings for Neon
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // Reduce max connections for serverless
  idleTimeoutMillis: 10000, // Close idle connections after 10 seconds  
  connectionTimeoutMillis: 10000, // Longer timeout for creating new connections
  maxUses: 1000, // Lower max uses per connection
  allowExitOnIdle: true, // Allow pool to exit when idle for serverless
});

export const db = drizzle({ client: pool, schema });

// Handle pool errors gracefully
pool.on('error', (err: any, client) => {
  console.error('Database pool error:', err.message);
  // Don't exit the process for idle client errors - let the pool handle reconnection
  if (err.code === '57P01') {
    console.log('Database connection terminated by administrator - pool will reconnect automatically');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end();
});

process.on('SIGTERM', () => {
  pool.end();
});