/**
 * Dev/demo seeding tool — standalone (run via `yarn db:seed`, executed by tsx).
 * Deletes all existing matches and inserts the 8 seed matches with dates relative to
 * *today* (isoIn). Re-run any time to refresh the dates (this also clears claims/created
 * matches, so it's a reset).
 *
 * Kept free of SvelteKit `$lib`/`$env` aliases so it runs outside the Vite/Kit context.
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { match, type SlotEntry } from './schema';
import { isoIn, LOCATIONS } from '../../data';

const player = (id: string): SlotEntry => ({ type: 'player', id });

type SeedMatch = typeof match.$inferInsert;

const seed: SeedMatch[] = [
	{
		id: 'm1',
		type: 'singles',
		locationId: 'riverside',
		date: isoIn(0),
		time: '18:30',
		ntrpMin: 3.5,
		ntrpMax: 4.5,
		slots: [player('ana'), null],
		notes: 'Best of 3 sets. I’ll bring fresh balls — court 4 is usually free after 6.'
	},
	{
		id: 'm2',
		type: 'doubles',
		locationId: 'eastline',
		date: isoIn(1),
		time: '10:00',
		ntrpMin: 3.0,
		ntrpMax: 4.0,
		slots: [player('marcus'), player('sam'), null, null],
		notes: 'Friendly doubles on clay. Guests welcome, I’ll sign you in at the front desk.'
	},
	{
		id: 'm3',
		type: 'singles',
		locationId: 'hillcrest',
		date: isoIn(2),
		time: '19:00',
		ntrpMin: 3.5,
		ntrpMax: 4.5,
		slots: [player('keiko'), null],
		notes: 'Indoor court booked under Tanaka. Warm-up from 6:45.'
	},
	{
		id: 'm4',
		type: 'doubles',
		locationId: 'marina',
		date: isoIn(2),
		time: '08:00',
		ntrpMin: 2.5,
		ntrpMax: 3.5,
		slots: [player('maria'), null, player('david'), null],
		notes: 'Early-bird doubles, relaxed pace. Coffee after at the Green Café.'
	},
	{
		id: 'm5',
		type: 'singles',
		locationId: 'juniper',
		date: isoIn(3),
		time: '17:00',
		ntrpMin: 2.5,
		ntrpMax: 3.5,
		slots: [player('jonas'), null],
		notes: 'Working on my backhand — happy to do drills for 20 min then play sets.'
	},
	{
		id: 'm6',
		type: 'doubles',
		locationId: 'meadowbrook',
		date: isoIn(4),
		time: '14:00',
		ntrpMin: 4.0,
		ntrpMax: 5.0,
		slots: [player('elena'), player('priya'), player('luca'), null],
		notes: 'Grass court doubles — one strong fourth needed. Competitive but friendly.'
	},
	{
		id: 'm7',
		type: 'singles',
		locationId: 'dockside',
		date: isoIn(5),
		time: '12:00',
		ntrpMin: 3.0,
		ntrpMax: 4.0,
		slots: [player('tom'), null],
		notes: 'Lunchtime hit. Windy by the water — bring a cap.'
	},
	{
		id: 'm8',
		type: 'doubles',
		locationId: 'northgate',
		date: isoIn(6),
		time: '20:00',
		ntrpMin: 3.0,
		ntrpMax: 4.0,
		slots: [player('aisha'), null, null, null],
		notes: 'Indoor night doubles. Need three — rotating partners every set.'
	}
];

async function main() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL is not set');

	const client = postgres(url);
	const db = drizzle(client, { schema: { match } });

	// Assign locations round-robin from whatever LOCATIONS currently contains, so the seed
	// stays valid regardless of how the location list is edited.
	seed.forEach((m, i) => {
		m.locationId = LOCATIONS[i % LOCATIONS.length].id;
	});

	await db.delete(match);
	await db.insert(match).values(seed);

	console.log(`Seeded ${seed.length} matches.`);
	await client.end();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
