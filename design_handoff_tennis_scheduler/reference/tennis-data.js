// Tennis Scheduler — mock data + helpers (plain JS, exposed on window.TS)
(function () {
  function isoIn(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function parseISO(iso) {
    const p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function fmtDate(iso) {
    const d = parseISO(iso);
    const today = parseISO(isoIn(0));
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
  }

  function dateParts(iso) {
    const d = parseISO(iso);
    return { dow: DAYS[d.getDay()].toUpperCase(), day: d.getDate(), mon: MONTHS[d.getMonth()].toUpperCase() };
  }

  function fmtTime(t) {
    const p = t.split(':').map(Number);
    const h12 = ((p[0] + 11) % 12) + 1;
    const ap = p[0] >= 12 ? 'PM' : 'AM';
    return h12 + (p[1] ? ':' + String(p[1]).padStart(2, '0') : '') + ' ' + ap;
  }

  const LOCATIONS = [
    { id: 'riverside', name: 'Riverside Park Courts', kind: 'Public park', area: 'Riverside', courts: 6, surface: 'Hard' },
    { id: 'eastline', name: 'Eastline Racquet Club', kind: 'Club', area: 'East End', courts: 12, surface: 'Clay' },
    { id: 'marina', name: 'Marina Green Courts', kind: 'Public park', area: 'Marina District', courts: 4, surface: 'Hard' },
    { id: 'hillcrest', name: 'Hillcrest Tennis Center', kind: 'Club', area: 'Hillcrest', courts: 8, surface: 'Hard · 4 indoor' },
    { id: 'juniper', name: 'Juniper Community Park', kind: 'Public park', area: 'Juniper Heights', courts: 3, surface: 'Hard' },
    { id: 'meadowbrook', name: 'The Meadowbrook Club', kind: 'Club', area: 'Meadowbrook', courts: 10, surface: 'Grass' },
    { id: 'dockside', name: 'Dockside Courts', kind: 'Public park', area: 'Old Docks', courts: 2, surface: 'Hard' },
    { id: 'northgate', name: 'Northgate Athletic Club', kind: 'Club', area: 'Northgate', courts: 6, surface: 'Hard · indoor' }
  ];

  const AVA = ['#1B6FA8', '#0C2233', '#3E8E7E', '#5B6ABF', '#B07D2B', '#7A4E8C', '#2E86C1', '#4A6B3A'];
  const PLAYERS = [
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
  ].map(function (p, i) { p.color = AVA[i % AVA.length]; return p; });

  function playerById(id) {
    for (let i = 0; i < PLAYERS.length; i++) if (PLAYERS[i].id === id) return PLAYERS[i];
    return null;
  }
  function locById(id) {
    for (let i = 0; i < LOCATIONS.length; i++) if (LOCATIONS[i].id === id) return LOCATIONS[i];
    return null;
  }

  // slots: array of playerId or null (open). slots[0] is the host. 'me' = signed-in user.
  function seedMatches() {
    return [
      { id: 'm1', type: 'singles', locationId: 'riverside', date: isoIn(0), time: '18:30', ntrp: [3.5, 4.5], hostId: 'ana', slots: ['ana', null], notes: 'Best of 3 sets. I\u2019ll bring fresh balls \u2014 court 4 is usually free after 6.' },
      { id: 'm2', type: 'doubles', locationId: 'eastline', date: isoIn(1), time: '10:00', ntrp: [3.0, 4.0], hostId: 'marcus', slots: ['marcus', 'sam', null, null], notes: 'Friendly doubles on clay. Guests welcome, I\u2019ll sign you in at the front desk.' },
      { id: 'm3', type: 'singles', locationId: 'hillcrest', date: isoIn(2), time: '19:00', ntrp: [3.5, 4.5], hostId: 'keiko', slots: ['keiko', 'me'], notes: 'Indoor court booked under Tanaka. Warm-up from 6:45.' },
      { id: 'm4', type: 'doubles', locationId: 'marina', date: isoIn(2), time: '08:00', ntrp: [2.5, 3.5], hostId: 'maria', slots: ['maria', null, 'david', null], notes: 'Early-bird doubles, relaxed pace. Coffee after at the Green Caf\u00e9.' },
      { id: 'm5', type: 'singles', locationId: 'juniper', date: isoIn(3), time: '17:00', ntrp: [2.5, 3.5], hostId: 'jonas', slots: ['jonas', null], notes: 'Working on my backhand \u2014 happy to do drills for 20 min then play sets.' },
      { id: 'm6', type: 'doubles', locationId: 'meadowbrook', date: isoIn(4), time: '14:00', ntrp: [4.0, 5.0], hostId: 'elena', slots: ['elena', 'priya', 'luca', null], notes: 'Grass court doubles \u2014 one strong fourth needed. Competitive but friendly.' },
      { id: 'm7', type: 'singles', locationId: 'dockside', date: isoIn(5), time: '12:00', ntrp: [3.0, 4.0], hostId: 'tom', slots: ['tom', null], notes: 'Lunchtime hit. Windy by the water \u2014 bring a cap.' },
      { id: 'm8', type: 'doubles', locationId: 'northgate', date: isoIn(6), time: '20:00', ntrp: [3.0, 4.0], hostId: 'aisha', slots: ['aisha', null, null, null], notes: 'Indoor night doubles. Need three \u2014 rotating partners every set.' }
    ];
  }

  const NTRP_LEVELS = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5];

  window.TS = {
    LOCATIONS: LOCATIONS,
    PLAYERS: PLAYERS,
    NTRP_LEVELS: NTRP_LEVELS,
    seedMatches: seedMatches,
    isoIn: isoIn,
    fmtDate: fmtDate,
    fmtTime: fmtTime,
    dateParts: dateParts,
    playerById: playerById,
    locById: locById
  };
})();
