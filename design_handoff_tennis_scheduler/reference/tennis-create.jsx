// Tennis Scheduler — create match flow

function CreateMatch({ user, go, onCreate }) {
  const [type, setType] = React.useState('singles');
  const [date, setDate] = React.useState(TS.isoIn(1));
  const [time, setTime] = React.useState('18:00');
  const [locId, setLocId] = React.useState('');
  const [lo, setLo] = React.useState('3.0');
  const [hi, setHi] = React.useState('4.0');
  const [notes, setNotes] = React.useState('');
  // invites: for each non-host slot, '' = open, else playerId
  const [invites, setInvites] = React.useState(['', '', '']);
  const [error, setError] = React.useState('');

  const slotCount = type === 'singles' ? 2 : 4;
  const times = [];
  for (let h = 7; h <= 21; h++) { times.push(String(h).padStart(2, '0') + ':00'); times.push(String(h).padStart(2, '0') + ':30'); }

  function setInvite(i, v) {
    const next = invites.slice();
    next[i] = v;
    setInvites(next);
  }

  function submit(e) {
    e.preventDefault();
    if (!locId) { setError('Pick a location for your match.'); return; }
    if (!date || date < TS.isoIn(0)) { setError('Pick a date — today or later.'); return; }
    if (parseFloat(lo) > parseFloat(hi)) { setError('NTRP range is upside down — min is above max.'); return; }
    const slots = ['me'];
    for (let i = 0; i < slotCount - 1; i++) slots.push(invites[i] || null);
    onCreate({
      id: 'u' + Date.now(),
      type: type,
      locationId: locId,
      date: date,
      time: time,
      ntrp: [parseFloat(lo), parseFloat(hi)],
      hostId: 'me',
      slots: slots,
      notes: notes.trim()
    });
  }

  const sideLabel = function (i) {
    if (type === 'singles') return 'Challenger';
    return i === 0 ? 'Your partner (Team A)' : 'Team B — player ' + (i - 0);
  };

  return (
    <main className="page page-narrow" data-screen-label="Schedule a match">
      <h1 className="disp page-title">Schedule a match</h1>
      <form className="create-form" onSubmit={submit}>
        <section className="card form-card">
          <h2 className="form-step"><span className="step-num">1</span>Format</h2>
          <Seg big options={[{ value: 'singles', label: 'Singles · 2 players' }, { value: 'doubles', label: 'Doubles · 4 players' }]} value={type} onChange={setType}></Seg>
          <div className="slot-preview">
            <Avatar player={{ name: user.name, you: true }} size={40}></Avatar>
            {Array.apply(null, Array(slotCount - 1)).map(function (_, i) {
              const inv = invites[i] ? TS.playerById(invites[i]) : null;
              return <Avatar key={i} player={inv} size={40}></Avatar>;
            })}
            <span className="slot-preview-label">{slotCount - 1 - invites.slice(0, slotCount - 1).filter(Boolean).length} open {slotCount - 1 - invites.slice(0, slotCount - 1).filter(Boolean).length === 1 ? 'slot' : 'slots'} after invites</span>
          </div>
        </section>

        <section className="card form-card">
          <h2 className="form-step"><span className="step-num">2</span>When</h2>
          <div className="form-row">
            <Field label="Date">
              <input type="date" value={date} min={TS.isoIn(0)} onChange={function (e) { setDate(e.target.value); }}></input>
            </Field>
            <Field label="Start time">
              <select value={time} onChange={function (e) { setTime(e.target.value); }}>
                {times.map(function (t) { return <option key={t} value={t}>{TS.fmtTime(t)}</option>; })}
              </select>
            </Field>
          </div>
        </section>

        <section className="card form-card">
          <h2 className="form-step"><span className="step-num">3</span>Where</h2>
          <div className="loc-grid">
            {TS.LOCATIONS.map(function (l) {
              return (
                <button type="button" key={l.id} className={'loc-pick' + (locId === l.id ? ' on' : '')} onClick={function () { setLocId(l.id); setError(''); }}>
                  <strong>{l.name}</strong>
                  <span>{l.kind} · {l.area}</span>
                  <span className="loc-pick-meta">{l.courts} courts · {l.surface}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card form-card">
          <h2 className="form-step"><span className="step-num">4</span>Level</h2>
          <div className="form-row">
            <Field label="NTRP min">
              <select value={lo} onChange={function (e) { setLo(e.target.value); }}>
                {TS.NTRP_LEVELS.map(function (l) { return <option key={l} value={l}>{l.toFixed(1)}</option>; })}
              </select>
            </Field>
            <Field label="NTRP max">
              <select value={hi} onChange={function (e) { setHi(e.target.value); }}>
                {TS.NTRP_LEVELS.map(function (l) { return <option key={l} value={l}>{l.toFixed(1)}</option>; })}
              </select>
            </Field>
          </div>
        </section>

        <section className="card form-card">
          <h2 className="form-step"><span className="step-num">5</span>Players</h2>
          <p className="form-hint">You hold the first slot. Invite players into the rest, or leave them open for anyone to claim.</p>
          {Array.apply(null, Array(slotCount - 1)).map(function (_, i) {
            return (
              <Field key={i} label={sideLabel(i)}>
                <select value={invites[i]} onChange={function (e) { setInvite(i, e.target.value); }}>
                  <option value="">Leave open — anyone can claim</option>
                  {TS.PLAYERS.map(function (p) {
                    return <option key={p.id} value={p.id} disabled={invites.indexOf(p.id) >= 0 && invites[i] !== p.id}>{p.name} · NTRP {p.ntrp.toFixed(1)}</option>;
                  })}
                </select>
              </Field>
            );
          })}
          <Field label="Notes for players (optional)">
            <textarea rows="3" placeholder="Court number, what to bring, how competitive…" value={notes} onChange={function (e) { setNotes(e.target.value); }}></textarea>
          </Field>
        </section>

        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <Btn kind="ghost" onClick={function () { go({ name: 'home' }); }}>Cancel</Btn>
          <Btn kind="primary" type="submit">Post match</Btn>
        </div>
      </form>
    </main>
  );
}

Object.assign(window, { CreateMatch });
