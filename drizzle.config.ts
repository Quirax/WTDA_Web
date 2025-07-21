import { defineConfig } from 'drizzle-kit';
import * as fs from 'fs';

if (!process.env.DATABASE_URL) {
	if (!process.env.DATABASE_HOST) throw new Error('DATABASE_HOST is not set');
	if (!process.env.DATABASE_PORT) throw new Error('DATABASE_PORT is not set');
	if (!process.env.DATABASE_USER) throw new Error('DATABASE_USER is not set');
	if (!process.env.DATABASE_PASSWORD) throw new Error('DATABASE_PASSWORD is not set');
	if (!process.env.DATABASE_SCHEMA) throw new Error('DATABASE_SCHEMA is not set');
}

// ref: https://stackoverflow.com/a/79285639/21742011
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',

	dbCredentials: {
		...(process.env.DATABASE_URL
			? { url: process.env.DATABASE_URL }
			: {
					host: process.env.DATABASE_HOST!,
					port: parseInt(process.env.DATABASE_PORT!),
					user: process.env.DATABASE_USER!,
					password: process.env.DATABASE_PASSWORD!,
					database: process.env.DATABASE_SCHEMA!,
				}),
		...(process.env.DATABASE_CA_PATH
			? {
					ssl: {
						checkServerIdentity: () => undefined,
						ca: fs.readFileSync(process.env.DATABASE_CA_PATH),
					},
				}
			: {}),
	},

	verbose: true,
	strict: true,
	dialect: 'postgresql',
});
