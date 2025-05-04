import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { sql } from 'drizzle-orm';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = postgres(env.DATABASE_URL);
export const db = drizzle(client);

db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_bigm;`);

export const generateID = () => encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));
