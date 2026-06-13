// Tennis Scheduler — main screens: Dashboard, Search, Match detail, My matches

function upcoming(matches) {
  const today = TS.isoIn(0);
  return matches
    .filter(function (m) { return m.date >= today; })
    .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
}

function Dashboard({ user, matches, getPlayer, go }) {
  const up = upcoming(matches);
  const mine = up.filter(function (m) { return m.slots.indexOf('me') >= 0; });
  const next = mine[0];
  const open = up.filter(function (m) {
    return m.slots.indexOf('me') < 0 && m.slots.some(function (s) { return !s; });
  }).slice(0, 4);

  return (
    <main className="page" data-screen-label="Dashboard">
      <section className="hero card-blue">
        <CourtSVG className="hero-court" lineOp={0.5} ball={false}></CourtSVG>
        <div className="hero-inner">
          <h1 className="disp hero-title">Game on, {user.name.split(' ')[0]}.</h1>
          {next ? (
            <p className="hero-sub">Your next match is <strong>{TS.fmtDate(next.date).toLowerCase() === 'today' ? 'today' : TS.fmtDate(next.date)}</strong> at {TS.fmtTime(next.time)} — {TS.locById(next.locationId).name}.</p>
          ) : (
            <p className="hero-sub">No matches on your calendar yet. Time to fix that.</p>
          )}
          <div className="hero-actions">
            <Btn kind="primary" onClick={function () { go({ name: 'create' }); }}>Schedule a match</Btn>
            <Btn kind="white" onClick={function () { go({ name: 'search' }); }}>Find a match</Btn>
          </div>
        </div>
      </section>

      {mine.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2 className="disp section-title">Your matches</h2>
            <button type="button" className="link" onClick={function () { go({ name: 'mine' }); }}>See all</button>
          </div>
          <div className="match-list">
            {mine.slice(0, 3).map(function (m) {
              return <MatchCard key={m.id} m={m} getPlayer={getPlayer} onOpen={function (id) { go({ name: 'match', matchId: id }); }}></MatchCard>;
            })}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h2 className="disp section-title">Open matches near you</h2>
          <button type="button" className="link" onClick={function () { go({ name: 'search' }); }}>Browse all</button>
        </div>
        <div className="match-list">
          {open.map(function (m) {
            return <MatchCard key={m.id} m={m} getPlayer={getPlayer} onOpen={function (id) { go({ name: 'match', matchId: id }); }}></MatchCard>;
          })}
        </div>
      </section>
    </main>
  );
}

function Search({ matches, getPlayer, go }) {
  const [type, setType] = React.useState('all');
  const [locId, setLocId] = React.useState('all');
  const [when, setWhen] = React.useState('any');
  const [openOnly, setOpenOnly] = React.useState(true);

  const horizon = { any: 9999, today: 0, three: 3, week: 7 };
  const results = upcoming(matches).filter(function (m) {
    if (type !== 'all' && m.type !== type) return false;
    if (locId !== 'all' && m.locationId !== locId) return false;
    if (m.date > TS.isoIn(horizon[when])) return false;
    if (openOnly && !m.slots.some(function (s) { return !s; })) return false;
    return true;
  });

  return (
    <main className="page" data-screen-label="Find a match">
      <h1 className="disp page-title">Find a match</h1>
      <div className="filter-bar card">
        <Seg options={[{ value: 'all', label: 'All' }, { value: 'singles', label: 'Singles' }, { value: 'doubles', label: 'Doubles' }]} value={type} onChange={setType}></Seg>
        <select className="filter-sel" value={locId} onChange={function (e) { setLocId(e.target.value); }}>
          <option value="all">All locations</option>
          {TS.LOCATIONS.map(function (l) { return <option key={l.id} value={l.id}>{l.name}</option>; })}
        </select>
        <select className="filter-sel" value={when} onChange={function (e) { setWhen(e.target.value); }}>
          <option value="any">Any day</option>
          <option value="today">Today</option>
          <option value="three">Next 3 days</option>
          <option value="week">This week</option>
        </select>
        <label className="check">
          <input type="checkbox" checked={openOnly} onChange={function (e) { setOpenOnly(e.target.checked); }}></input>
          <span>Open slots only</span>
        </label>
      </div>
      <p className="result-count">{results.length} {results.length === 1 ? 'match' : 'matches'}</p>
      {results.length === 0 ? (
        <EmptyState
          title="No matches found"
          body="Try widening your filters — or post your own match and let players come to you."
          action={<Btn kind="ink" onClick={function () { go({ name: 'create' }); }}>Schedule a match</Btn>}
        ></EmptyState>
      ) : (
        <div className="match-list">
          {results.map(function (m) {
            return <MatchCard key={m.id} m={m} getPlayer={getPlayer} onOpen={function (id) { go({ name: 'match', matchId: id }); }}></MatchCard>;
          })}
        </div>
      )}
    </main>
  );
}

function SlotCard({ pid, index, match, getPlayer, onClaim, onLeave }) {
  const [confirming, setConfirming] = React.useState(false);
  const side = match.type === 'doubles' ? (index < 2 ? 'Team A' : 'Team B') : (index === 0 ? 'Host side' : 'Challenger');
  if (pid) {
    const p = getPlayer(pid);
    return (
      <div className={'slot-card' + (p.you ? ' slot-you' : '')}>
      <span className="slot-side">{side}</span>
        <Avatar player={p} size={52}></Avatar>
        <span className="slot-name">{p.name}{p.you ? ' (you)' : ''}</span>
        <span className="slot-meta">NTRP {p.ntrp.toFixed(1)}{pid === match.hostId ? ' · Host' : ''}</span>
        {p.you && pid !== match.hostId ? (
          <Btn kind="ghost" sm onClick={function () { onLeave(index); }}>Leave match</Btn>
        ) : null}
      </div>
    );
  }
  return (
    <div className="slot-card slot-open-card">
      <span className="slot-side">{side}</span>
      <Avatar player={null} size={52}></Avatar>
      <span className="slot-name muted">Open slot</span>
      {confirming ? (
        <span className="slot-confirm">
          <Btn kind="primary" sm onClick={function () { onClaim(index); }}>Confirm</Btn>
          <Btn kind="ghost" sm onClick={function () { setConfirming(false); }}>Cancel</Btn>
        </span>
      ) : (
        <Btn kind="ink" sm onClick={function () { setConfirming(true); }}>Claim slot</Btn>
      )}
    </div>
  );
}

function MatchDetail({ matchId, matches, getPlayer, go, onClaim, onLeave, backTo }) {
  const m = matches.filter(function (x) { return x.id === matchId; })[0];
  if (!m) return <main className="page"><p>Match not found.</p></main>;
  const loc = TS.locById(m.locationId);
  const host = getPlayer(m.hostId);
  const open = m.slots.filter(function (s) { return !s; }).length;
  const youIn = m.slots.indexOf('me') >= 0;

  return (
    <main className="page" data-screen-label="Match detail">
      <button type="button" className="link back" onClick={function () { go(backTo || { name: 'search' }); }}>&larr; Back</button>
      <header className="detail-head card-blue">
        <CourtSVG className="hero-court" lineOp={0.45} ball={false}></CourtSVG>
        <div className="detail-head-inner">
          <div className="mc-row1">
            <TypeBadge type={m.type}></TypeBadge>
            <NtrpBadge range={m.ntrp}></NtrpBadge>
            {youIn ? <span className="badge badge-you">You&rsquo;re in</span> : null}
          </div>
          <h1 className="disp detail-title">{TS.fmtDate(m.date)} &middot; {TS.fmtTime(m.time)}</h1>
          <p className="detail-sub">{loc.name} &middot; Hosted by {host.you ? 'you' : host.name}</p>
        </div>
      </header>

      <div className="detail-grid">
        <section className="section">
          <h2 className="disp section-title">Players <span className="count-pill">{m.slots.length - open}/{m.slots.length}</span></h2>
          <div className={'slot-grid slots-' + m.slots.length}>
            {m.slots.map(function (pid, i) {
              return (
                <SlotCard key={i} pid={pid} index={i} match={m} getPlayer={getPlayer}
                  onClaim={function (idx) { onClaim(m.id, idx); }}
                  onLeave={function (idx) { onLeave(m.id, idx); }}></SlotCard>
              );
            })}
          </div>
          {m.notes ? (
            <div className="notes card">
              <span className="field-label">From the host</span>
              <p>{m.notes}</p>
            </div>
          ) : null}
        </section>
        <aside className="section">
          <h2 className="disp section-title">Location</h2>
          <div className="loc-card card">
            <div className="loc-map">
              <CourtSVG lineOp={0.85} ball={false}></CourtSVG>
            </div>
            <div className="loc-card-body">
              <strong>{loc.name}</strong>
              <span>{loc.kind} &middot; {loc.area}</span>
              <span>{loc.courts} courts &middot; {loc.surface}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function MyMatches({ matches, getPlayer, go }) {
  const [tab, setTab] = React.useState('playing');
  const up = upcoming(matches);
  const playing = up.filter(function (m) { return m.slots.indexOf('me') >= 0 && m.hostId !== 'me'; });
  const hosting = up.filter(function (m) { return m.hostId === 'me'; });
  const list = tab === 'playing' ? playing : hosting;
  return (
    <main className="page" data-screen-label="My matches">
      <h1 className="disp page-title">My matches</h1>
      <Seg options={[{ value: 'playing', label: 'Playing (' + playing.length + ')' }, { value: 'hosting', label: 'Hosting (' + hosting.length + ')' }]} value={tab} onChange={setTab}></Seg>
      <div style={{ height: 18 }}></div>
      {list.length === 0 ? (
        <EmptyState
          title={tab === 'playing' ? 'Nothing on your calendar' : 'You haven\u2019t hosted yet'}
          body={tab === 'playing' ? 'Join an open match or schedule your own.' : 'Post a match and the players will come to you.'}
          action={<Btn kind="ink" onClick={function () { go({ name: tab === 'playing' ? 'search' : 'create' }); }}>{tab === 'playing' ? 'Find a match' : 'Schedule a match'}</Btn>}
        ></EmptyState>
      ) : (
        <div className="match-list">
          {list.map(function (m) {
            return <MatchCard key={m.id} m={m} getPlayer={getPlayer} onOpen={function (id) { go({ name: 'match', matchId: id }); }}></MatchCard>;
          })}
        </div>
      )}
    </main>
  );
}

Object.assign(window, { Dashboard, Search, MatchDetail, MyMatches });
