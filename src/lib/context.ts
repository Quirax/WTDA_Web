import { getContext, setContext } from 'svelte';

class Context<T> {
	private key: string;

	constructor(key: string) {
		this.key = key;
	}

	get v(): T {
		return getContext(this.key);
	}
	set v(value: T) {
		setContext(this.key, value);
	}
}

export const userContext = new Context<App.User>('user');
export const sessionContext = new Context<App.Session>('session');
