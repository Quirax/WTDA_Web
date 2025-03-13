// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		type User = import('$lib/server/auth').SessionValidationResult['user'];
		type Session = import('$lib/server/auth').SessionValidationResult['session'];

		interface Locals {
			user: User;
			session: Session;
		}
	}
}

export {};
