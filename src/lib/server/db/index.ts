import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { encodeBase32LowerCase } from '@oslojs/encoding';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = postgres(env.DATABASE_URL);
export const db = drizzle(client);

export const generateID = () => encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));
