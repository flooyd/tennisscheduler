// Tennis Scheduler — shared UI components
const { useState } = React;

function BallDot({ size }) {
  const s = size || 12;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="11" fill="var(--ball)" stroke="var(--ball-deep)" strokeWidth="1.5"></circle>
      <path d="M4 5 C 10 9, 10 15, 4 19" fill="none" stroke="#fff" strokeWidth="1.6"></path>
      <path d="M20 5 C 14 9, 14 15, 20 19" fill="none" stroke="#fff" strokeWidth="1.6"></path>
    </svg>
  );
}

function Logo({ light, size }) {
  return (
    <span className={'ts-logo' + (light ? ' light' : '')} style={size ? { fontSize: size } : null}>
      <BallDot size={size ? size * 0.85 : 16}></BallDot>
      <span>Tennis&nbsp;Scheduler</span>
    </span>
  );
}

function Btn({ kind, sm, children, onClick, type, disabled, style }) {
  return (
    <button
      type={type || 'button'}
      className={'btn btn-' + (kind || 'primary') + (sm ? ' btn-sm' : '')}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >{children}</button>
  );
}

function Avatar({ player, size, dashed }) {
  const s = size || 36;
  if (!player) {
    return <span className="avatar open-slot" style={{ width: s, height: s, fontSize: s * 0.42 }}>+</span>;
  }
  const initials = player.name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('');
  return (
    <span
      className={'avatar' + (player.you ? ' you' : '')}
      style={{ width: s, height: s, fontSize: s * 0.36, background: player.you ? 'var(--ball)' : player.color, color: player.you ? 'var(--ink)' : '#fff' }}
      title={player.name}
    >{initials}</span>
  );
}

function TypeBadge({ type }) {
  return <span className={'badge badge-' + type}>{type === 'singles' ? 'Singles' : 'Doubles'}</span>;
}

function NtrpBadge({ range }) {
  return <span className="ntrp">NTRP {range[0].toFixed(1)}–{range[1].toFixed(1)}</span>;
}

function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function Seg({ options, value, onChange, big }) {
  return (
    <div className={'seg' + (big ? ' seg-big' : '')} role="tablist">
      {options.map(function (o) {
        const val = typeof o === 'string' ? o : o.value;
        const lab = typeof o === 'string' ? o : o.label;
        return (
          <button key={val} type="button" role="tab" className={value === val ? 'on' : ''} onClick={function () { onChange(val); }}>
            {lab}
          </button>
        );
      })}
    </div>
  );
}

function SlotDots({ match, getPlayer }) {
  return (
    <span className="slot-dots">
      {match.slots.map(function (pid, i) {
        return <Avatar key={i} player={pid ? getPlayer(pid) : null} size={30}></Avatar>;
      })}
    </span>
  );
}

function MatchCard({ m, getPlayer, onOpen }) {
  const loc = TS.locById(m.locationId);
  const open = m.slots.filter(function (s) { return !s; }).length;
  const parts = TS.dateParts(m.date);
  const youIn = m.slots.indexOf('me') >= 0;
  return (
    <button type="button" className="match-card" onClick={function () { onOpen(m.id); }}>
      <span className="mc-date">
        <span className="mc-dow">{parts.dow}</span>
        <span className="mc-day">{parts.day}</span>
        <span className="mc-mon">{parts.mon}</span>
      </span>
      <span className="mc-body">
        <span className="mc-row1">
          <TypeBadge type={m.type}></TypeBadge>
          <NtrpBadge range={m.ntrp}></NtrpBadge>
          {youIn ? <span className="badge badge-you">You’re in</span> : null}
        </span>
        <span className="mc-loc">{loc.name}</span>
        <span className="mc-meta">{TS.fmtDate(m.date)} · {TS.fmtTime(m.time)} · {loc.area}</span>
      </span>
      <span className="mc-side">
        <SlotDots match={m} getPlayer={getPlayer}></SlotDots>
        <span className={'mc-open' + (open === 0 ? ' full' : '')}>{open === 0 ? 'Full' : open + (open === 1 ? ' spot open' : ' spots open')}</span>
      </span>
    </button>
  );
}

function TopNav({ route, go, user, onSignOut, onCreate }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'search', label: 'Find a match' },
    { id: 'mine', label: 'My matches' }
  ];
  const [menu, setMenu] = useState(false);
  return (
    <header className="nav">
      <button type="button" className="nav-logo" onClick={function () { go({ name: 'home' }); }}>
        <Logo></Logo>
      </button>
      <nav className="nav-links">
        {links.map(function (l) {
          return (
            <button key={l.id} type="button" className={route.name === l.id ? 'on' : ''} onClick={function () { go({ name: l.id }); }}>
              {l.label}
            </button>
          );
        })}
      </nav>
      <div className="nav-right">
        <Btn kind="primary" sm onClick={onCreate}>+ New match</Btn>
        <div className="nav-user">
          <button type="button" className="nav-ava" onClick={function () { setMenu(!menu); }}>
            <Avatar player={{ name: user.name, you: true }} size={36}></Avatar>
          </button>
          {menu ? (
            <div className="nav-menu">
              <div className="nav-menu-name">{user.name}<span>NTRP {user.ntrp.toFixed(1)}</span></div>
              <button type="button" onClick={onSignOut}>Sign out</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="empty">
      <BallDot size={28}></BallDot>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

Object.assign(window, { BallDot, Logo, Btn, Avatar, TypeBadge, NtrpBadge, Field, Seg, SlotDots, MatchCard, TopNav, EmptyState });
