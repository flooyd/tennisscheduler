import { writable } from 'svelte/store';

export const toast = writable<string | null>(null);

/** Controls the how-to-play tutorial modal. */
export const showTutorial = writable(false);

const TUTORIAL_KEY = 'ts_tutorial_seen';

/** Open the tutorial on demand (e.g. from a nav link). */
export function openTutorial() {
	showTutorial.set(true);
}

/** Open the tutorial automatically the first time a player visits. */
export function maybeShowTutorial() {
	try {
		if (!localStorage.getItem(TUTORIAL_KEY)) showTutorial.set(true);
	} catch {
		/* ignore */
	}
}

/** Remember that the tutorial has been seen, and close it. */
export function dismissTutorial() {
	try {
		localStorage.setItem(TUTORIAL_KEY, '1');
	} catch {
		/* ignore */
	}
	showTutorial.set(false);
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** Show a toast message; auto-dismisses after ~2.6s. */
export function ping(msg: string) {
	toast.set(msg);
	if (timer) clearTimeout(timer);
	timer = setTimeout(() => toast.set(null), 2600);
}

const PENDING_KEY = 'ts_pending_toast';

/** Queue a toast to show after a navigation (survives a full page load via sessionStorage). */
export function queueToast(msg: string) {
	try {
		sessionStorage.setItem(PENDING_KEY, msg);
	} catch {
		/* ignore */
	}
}

/** Consume and show any queued toast. Call once on app mount. */
export function consumeToast() {
	try {
		const msg = sessionStorage.getItem(PENDING_KEY);
		if (msg) {
			sessionStorage.removeItem(PENDING_KEY);
			ping(msg);
		}
	} catch {
		/* ignore */
	}
}
