// Tennis Scheduler — landing / sign-in with full-court SVG background, 3 layout variants

function CourtSVG({ surround, court, line, lineOp, ball, className, style }) {
  const op = lineOp == null ? 1 : lineOp;
  return (
    <svg className={className} style={style} viewBox="0 0 1560 960" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1560" height="960" fill={surround || '#4FB3E8'}></rect>
      <rect x="312" y="264" width="936" height="432" fill={court || '#5FBCEB'}></rect>
      <g stroke={line || '#fff'} strokeWidth="6" fill="none" opacity={op}>
        <rect x="312" y="264" width="936" height="432"></rect>
        <line x1="312" y1="318" x2="1248" y2="318"></line>
        <line x1="312" y1="642" x2="1248" y2="642"></line>
        <line x1="528" y1="318" x2="528" y2="642"></line>
        <line x1="1032" y1="318" x2="1032" y2="642"></line>
        <line x1="528" y1="480" x2="1032" y2="480"></line>
        <line x1="312" y1="480" x2="332" y2="480"></line>
        <line x1="1228" y1="480" x2="1248" y2="480"></line>
      </g>
      <g opacity={Math.min(1, op + 0.15)}>
        <line x1="780" y1="237" x2="780" y2="723" stroke={line || '#fff'} strokeWidth="3"></line>
        <line x1="780" y1="240" x2="780" y2="720" stroke={line || '#fff'} strokeWidth="11" strokeDasharray="3 16" strokeLinecap="round"></line>
        <circle cx="780" cy="231" r="7" fill={line || '#fff'}></circle>
        <circle cx="780" cy="729" r="7" fill={line || '#fff'}></circle>
      </g>
      {ball !== false ? (
        <g>
          <circle cx="1000" cy="396" r="15" fill="var(--ball)"></circle>
          <path d="M988 387 C 998 392, 998 400, 988 405" fill="none" stroke="#fff" strokeWidth="2"></path>
          <path d="M1012 387 C 1002 392, 1002 400, 1012 405" fill="none" stroke="#fff" strokeWidth="2"></path>
        </g>
      ) : null}
    </svg>
  );
}

function SignCard({ onSignIn, dark }) {
  const [mode, setMode] = React.useState('in');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [ntrp, setNtrp] = React.useState('3.5');

  function submit(e) {
    e.preventDefault();
    let n = name.trim();
    if (!n && email.indexOf('@') > 0) {
      n = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
    onSignIn({ name: n || 'Ace Player', ntrp: parseFloat(ntrp) });
  }

  return (
    <form className={'sign-card' + (dark ? ' dark' : '')} onSubmit={submit} data-comment-anchor="sign-card">
      <Logo light={dark}></Logo>
      <h1 className="disp sign-title">Game on.</h1>
      <p className="sign-sub">Schedule matches, find players, claim your court.</p>
      <Seg options={[{ value: 'in', label: 'Sign in' }, { value: 'up', label: 'Create account' }]} value={mode} onChange={setMode}></Seg>
      {mode === 'up' ? (
        <Field label="Name">
          <input type="text" placeholder="Serena Smith" value={name} onChange={function (e) { setName(e.target.value); }}></input>
        </Field>
      ) : null}
      <Field label="Email">
        <input type="email" placeholder="you@club.com" value={email} onChange={function (e) { setEmail(e.target.value); }}></input>
      </Field>
      <Field label="Password">
        <input type="password" placeholder="••••••••" value={pw} onChange={function (e) { setPw(e.target.value); }}></input>
      </Field>
      {mode === 'up' ? (
        <Field label="Your NTRP level" hint="Not sure? 3.0 is a solid recreational player.">
          <select value={ntrp} onChange={function (e) { setNtrp(e.target.value); }}>
            {TS.NTRP_LEVELS.map(function (l) { return <option key={l} value={l}>{l.toFixed(1)}</option>; })}
          </select>
        </Field>
      ) : null}
      <Btn kind="primary" type="submit" style={{ width: '100%', marginTop: 6 }}>
        {mode === 'in' ? 'Step on court' : 'Join the league'}
      </Btn>
      <p className="sign-fine">Demo — any credentials work.</p>
    </form>
  );
}

function Landing({ variant, lineOp, onSignIn }) {
  if (variant === 'Sideline split') {
    return (
      <div className="landing landing-split" data-screen-label="Landing — Sideline split">
        <div className="split-left">
          <CourtSVG className="court-bg" lineOp={lineOp}></CourtSVG>
          <div className="split-left-inner">
            <Logo light></Logo>
            <h1 className="disp split-headline">Find your<br></br>next match.</h1>
            <p className="split-sub">Singles or doubles. Parks or clubs.<br></br>Every open slot in the city, one schedule.</p>
          </div>
        </div>
        <div className="split-right">
          <SignCard onSignIn={onSignIn}></SignCard>
        </div>
      </div>
    );
  }
  if (variant === 'Night match') {
    return (
      <div className="landing landing-night" data-screen-label="Landing — Night match">
        <CourtSVG className="court-bg" surround="#0C2233" court="#102E44" line="var(--ball)" lineOp={Math.max(0.25, lineOp * 0.55)} ball={false}></CourtSVG>
        <div className="landing-center">
          <SignCard dark onSignIn={onSignIn}></SignCard>
        </div>
      </div>
    );
  }
  // default: Center court
  return (
    <div className="landing landing-centercourt" data-screen-label="Landing — Center court">
      <CourtSVG className="court-bg" lineOp={lineOp}></CourtSVG>
      <div className="landing-center">
        <SignCard onSignIn={onSignIn}></SignCard>
      </div>
    </div>
  );
}

Object.assign(window, { CourtSVG, SignCard, Landing });
