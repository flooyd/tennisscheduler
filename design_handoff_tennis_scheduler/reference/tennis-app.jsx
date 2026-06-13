// Tennis Scheduler — app root: routing, state, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "landingLayout": "Center court",
  "courtLines": 90,
  "ctaColor": "#DFF24B"
}/*EDITMODE-END*/;

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast"><BallDot size={16}></BallDot>{msg}</div>;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [user, setUser] = React.useState(function () {
    try { return JSON.parse(localStorage.getItem('ts_user_v1')); } catch (e) { return null; }
  });
  const [matches, setMatches] = React.useState(function () { return TS.seedMatches(); });
  const [route, setRoute] = React.useState({ name: 'home' });
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  function ping(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(function () { setToast(null); }, 2600);
  }

  function go(r) {
    setRoute(r);
    window.scrollTo(0, 0);
  }

  function getPlayer(id) {
    if (id === 'me') return { id: 'me', name: user ? user.name : 'You', ntrp: user ? user.ntrp : 3.5, color: 'var(--ink)', you: true };
    return TS.playerById(id);
  }

  function signIn(u) {
    setUser(u);
    try { localStorage.setItem('ts_user_v1', JSON.stringify(u)); } catch (e) {}
    setRoute({ name: 'home' });
    ping('Welcome to the court, ' + u.name.split(' ')[0] + '!');
  }

  function signOut() {
    setUser(null);
    try { localStorage.removeItem('ts_user_v1'); } catch (e) {}
    setRoute({ name: 'home' });
  }

  function patchMatch(id, fn) {
    setMatches(function (ms) {
      return ms.map(function (m) {
        if (m.id !== id) return m;
        const copy = Object.assign({}, m, { slots: m.slots.slice() });
        fn(copy);
        return copy;
      });
    });
  }

  function claim(matchId, slotIdx) {
    patchMatch(matchId, function (m) {
      if (!m.slots[slotIdx] && m.slots.indexOf('me') < 0) m.slots[slotIdx] = 'me';
    });
    ping('You\u2019re in! See you on court.');
  }

  function leave(matchId, slotIdx) {
    patchMatch(matchId, function (m) {
      if (m.slots[slotIdx] === 'me') m.slots[slotIdx] = null;
    });
    ping('You left the match.');
  }

  function createMatch(m) {
    setMatches(function (ms) { return ms.concat([m]); });
    go({ name: 'match', matchId: m.id, from: 'mine' });
    ping('Match posted \u2014 your slots are live.');
  }

  const accentText = t.ctaColor === '#DFF24B' ? '#0C2233' : '#FFFFFF';
  const rootStyle = { '--accent': t.ctaColor, '--accent-text': accentText };
  const lineOp = t.courtLines / 100;

  let screen = null;
  if (!user) {
    screen = <Landing variant={t.landingLayout} lineOp={lineOp} onSignIn={signIn}></Landing>;
  } else if (route.name === 'search') {
    screen = <Search matches={matches} getPlayer={getPlayer} go={go}></Search>;
  } else if (route.name === 'create') {
    screen = <CreateMatch user={user} go={go} onCreate={createMatch}></CreateMatch>;
  } else if (route.name === 'match') {
    screen = (
      <MatchDetail matchId={route.matchId} matches={matches} getPlayer={getPlayer} go={go}
        onClaim={claim} onLeave={leave}
        backTo={route.from === 'mine' ? { name: 'mine' } : { name: 'search' }}></MatchDetail>
    );
  } else if (route.name === 'mine') {
    screen = <MyMatches matches={matches} getPlayer={getPlayer} go={go}></MyMatches>;
  } else {
    screen = <Dashboard user={user} matches={matches} getPlayer={getPlayer} go={go}></Dashboard>;
  }

  return (
    <div className="app-root" style={rootStyle}>
      {user ? (
        <TopNav route={route} go={go} user={user} onSignOut={signOut} onCreate={function () { go({ name: 'create' }); }}></TopNav>
      ) : null}
      {screen}
      <Toast msg={toast}></Toast>
      <TweaksPanel>
        <TweakSection label="Landing page"></TweakSection>
        <TweakSelect label="Layout" value={t.landingLayout}
          options={['Center court', 'Sideline split', 'Night match']}
          onChange={function (v) { setTweak('landingLayout', v); }}></TweakSelect>
        <TweakSlider label="Court lines" value={t.courtLines} min={20} max={100} unit="%"
          onChange={function (v) { setTweak('courtLines', v); }}></TweakSlider>
        <TweakSection label="Brand"></TweakSection>
        <TweakColor label="CTA color" value={t.ctaColor}
          options={['#DFF24B', '#4FB3E8', '#0C2233']}
          onChange={function (v) { setTweak('ctaColor', v); }}></TweakColor>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App></App>);
