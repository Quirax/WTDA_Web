import { writable } from 'svelte/store';

export const userStore = writable<App.User>();
export const sessionStore = writable<App.Session>();
