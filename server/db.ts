import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { log } from "./vite";

// Create a PostgreSQL client
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  log("Error: DATABASE_URL environment variable is not set!", "drizzle");
  process.exit(1);
}

// Create a database connection
const client = postgres(connectionString);
log("Database connection established", "drizzle");

// Create a Drizzle ORM instance
export const db = drizzle(client);