// Tennis Scheduler — mock reference data + date/format helpers (ported from tennis-data.js)

export type Location = {
	id: string;
	name: string;
	kind: string;
	area: string;
	courts: number;
	surface: string;
};

export type Player = {
	id: string;
	name: string;
	ntrp: number;
	color: string;
};

export function isoIn(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return d.getFullYear() + '-' + m + '-' + day;
}

export function parseISO(iso: string): Date {
	const p = iso.split('-').map(Number);
	return new Date(p[0], p[1] - 1, p[2]);
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(iso: string): string {
	const d = parseISO(iso);
	const today = parseISO(isoIn(0));
	const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
	if (diff === 0) return 'Today';
	if (diff === 1) return 'Tomorrow';
	return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
}

export function dateParts(iso: string): { dow: string; day: number; mon: string } {
	const d = parseISO(iso);
	return {
		dow: DAYS[d.getDay()].toUpperCase(),
		day: d.getDate(),
		mon: MONTHS[d.getMonth()].toUpperCase()
	};
}

export function fmtTime(t: string): string {
	const p = t.split(':').map(Number);
	const h12 = ((p[0] + 11) % 12) + 1;
	const ap = p[0] >= 12 ? 'PM' : 'AM';
	return h12 + (p[1] ? ':' + String(p[1]).padStart(2, '0') : '') + ' ' + ap;
}

/** The match's scheduled start as a Date (local time, consistent with parseISO). */
export function matchStart(date: string, time: string): Date {
	const [y, mo, d] = date.split('-').map(Number);
	const [h, mi] = time.split(':').map(Number);
	return new Date(y, mo - 1, d, h || 0, mi || 0);
}

/** Results can only be reported starting this long after the scheduled start. */
export const RESULT_DELAY_MS = 60 * 60 * 1000;

/** The earliest a result may be reported: one hour after the match begins. */
export function resultsOpenAt(date: string, time: string): Date {
	return new Date(matchStart(date, time).getTime() + RESULT_DELAY_MS);
}

/** True once it's at least an hour past the scheduled start. */
export function canReportResultNow(date: string, time: string, now: Date = new Date()): boolean {
	return now.getTime() >= resultsOpenAt(date, time).getTime();
}

export const LOCATIONS: Location[] = [
	{
		id: 'rtc',
		name: 'Richland Tennis Center',
		kind: 'Tennis Center',
		area: 'North Richland Hills',
		courts: 20,
		surface: 'Hard'
	}
];

const AVA = [
	'#1B6FA8',
	'#0C2233',
	'#3E8E7E',
	'#5B6ABF',
	'#B07D2B',
	'#7A4E8C',
	'#2E86C1',
	'#4A6B3A'
];

export const PLAYERS: Player[] = (
	[
		{ id: 'ana', name: 'Ana Duarte', ntrp: 4.0 },
		{ id: 'marcus', name: 'Marcus Webb', ntrp: 3.5 },
		{ id: 'priya', name: 'Priya Nair', ntrp: 4.5 },
		{ id: 'jonas', name: 'Jonas Lindqvist', ntrp: 3.0 },
		{ id: 'keiko', name: 'Keiko Tanaka', ntrp: 4.0 },
		{ id: 'sam', name: 'Sam Okafor', ntrp: 3.5 },
		{ id: 'elena', name: 'Elena Petrova', ntrp: 5.0 },
		{ id: 'david', name: 'David Chen', ntrp: 2.5 },
		{ id: 'maria', name: 'Maria Santos', ntrp: 3.0 },
		{ id: 'tom', name: 'Tom Becker', ntrp: 4.0 },
		{ id: 'aisha', name: 'Aisha Khan', ntrp: 3.5 },
		{ id: 'luca', name: 'Luca Romano', ntrp: 4.5 }
	] as Omit<Player, 'color'>[]
).map((p, i) => ({ ...p, color: AVA[i % AVA.length] }));

export function playerById(id: string): Player | null {
	return PLAYERS.find((p) => p.id === id) ?? null;
}

export function locById(id: string): Location | null {
	return LOCATIONS.find((l) => l.id === id) ?? null;
}

export const NTRP_LEVELS = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5];

/** Deterministic avatar color for a real user (by id) — reuses the player palette. */
export function colorForId(id: string): string {
	let h = 0;
	for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
	return AVA[h % AVA.length];
}
