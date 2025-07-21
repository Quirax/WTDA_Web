import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { sql } from 'drizzle-orm';
import * as fs from 'fs/promises';
import { join } from 'path';

if (!env.DATABASE_URL) {
	if (!env.DATABASE_HOST) throw new Error('DATABASE_HOST is not set');
	if (!env.DATABASE_PORT) throw new Error('DATABASE_PORT is not set');
	if (!env.DATABASE_USER) throw new Error('DATABASE_USER is not set');
	if (!env.DATABASE_PASSWORD) throw new Error('DATABASE_PASSWORD is not set');
	if (!env.DATABASE_SCHEMA) throw new Error('DATABASE_SCHEMA is not set');
}

// ref: https://stackoverflow.com/a/79285639/21742011
const credentials = {
	...(process.env.DATABASE_CA_PATH
		? {
				ssl: {
					checkServerIdentity: () => undefined,
					ca: await fs.readFile(join('.', process.env.DATABASE_CA_PATH)),
				},
			}
		: {}),
};

const client = env.DATABASE_URL
	? postgres(env.DATABASE_URL, credentials)
	: postgres({
			host: process.env.DATABASE_HOST!,
			port: parseInt(process.env.DATABASE_PORT!),
			user: process.env.DATABASE_USER!,
			password: process.env.DATABASE_PASSWORD!,
			database: process.env.DATABASE_SCHEMA!,
			...credentials,
		});

export const db = drizzle(client);

db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_bigm;`);

export const generateID = (length = 15) =>
	encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(length)));

export * as table from './schema';
