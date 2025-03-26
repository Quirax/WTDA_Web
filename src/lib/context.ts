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

class Reconstructive<T extends object> {
	private object: T;
	private proxy: T | undefined = undefined;

	private setProxy() {
		if (!this.object) return;

		this.proxy = new Proxy(this.object, {
			set: (target, prop, newValue, receiver) => {
				const newObject = { ...target };
				newObject[prop as keyof T] = newValue;
				this.object = newObject;

				return true;
			},
		});
	}

	constructor(object: T) {
		console.log(object);
		this.object = object;
		this.setProxy();
	}

	get v(): T | undefined {
		return this.proxy;
	}

	set v(value: T | undefined) {
		if (!value) return;
		this.object = value;
		this.setProxy();
	}
}

export const userStore = writable<App.User>();
export const sessionStore = writable<App.Session>();

// ref: https://stackoverflow.com/a/74089977
export const layoutStore = writable<ComponentProps<typeof Layout>>();
