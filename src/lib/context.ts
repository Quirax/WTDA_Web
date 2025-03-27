import Layout from '$stories/Layout.svelte';
import { getContext, setContext, type ComponentProps } from 'svelte';
import { writable } from 'svelte/store';

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

export const userStore = writable<App.User>();
export const sessionStore = writable<App.Session>();
