import type { Location } from '$lib/data';

export type ResolvedPlayer = {
	id: string;
	name: string;
	ntrp: number;
	color: string;
	image?: string | null;
	you: boolean;
	isHost: boolean;
};

export type ResolvedMatch = {
	id: string;
	type: 'singles' | 'doubles';
	location: Location;
	date: string;
	time: string;
	ntrp: [number, number];
	notes: string;
	slots: (ResolvedPlayer | null)[];
	hostName: string;
	youIn: boolean;
	isHosting: boolean;
	openCount: number;
};

/** A player's reliability, derived from reported results (no stored counters). */
export type Reliability = {
	/** Results where they were listed and turned up. */
	played: number;
	/** Results where the reporter marked them a no-show. */
	noShows: number;
	/** 0–100, or null when there's no history yet ("New"). */
	score: number | null;
};

export type LadderRow = {
	id: string;
	name: string;
	ntrp: number;
	color: string;
	image: string | null;
	isUser: boolean;
	you: boolean;
	wins: number;
	losses: number;
	points: number;
	winPct: number;
	reliability: Reliability;
};

export type ChatMessage = {
	id: string;
	body: string;
	createdAt: string;
	author: { id: string; name: string; color: string; image: string | null; you: boolean };
};
