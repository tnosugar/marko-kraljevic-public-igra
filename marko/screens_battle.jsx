/* =====================================================================
   QUIZ-BORBA — smena poteza: Markova epska akcija → pitanje iz pesme
   ===================================================================== */
const OPT_LABELS = ['A','B','V','G'];

function Battle({ state, dispatch }){
  const { ART, ENEMIES, QUESTIONS, ACTIONS, COMPANIONS } = window.MK;
  const enemyDef = ENEMIES[state.battle.enemy];
  const pool = QUESTIONS[state.level];

  const [enemy, setEnemy] = useState({ ...enemyDef });
  const [markoHp, setMarkoHp] = useState(state.marko.hp);
  const [turn, setTurn] = useState('marko');      // marko | enemy | over
  const [log, setLog] = useState([{t:`Susret: ${enemyDef.ime} preprečuje carev drum.`, k:'sys'}]);
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState(null);  // {pick, correct}
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const [learned, setLearned] = useState([...state.learned]);
  const [kletva, setKletva] = useState(false);
  const [usedAbil, setUsedAbil] = useState([]);
  const [showDoziv, setShowDoziv] = useState(false);
  const [easyNext, setEasyNext] = useState(false);
  const [result, setResult] = useState(null);
  const [flash, setFlash] = useState(null);        // 'hit-enemy' | 'hit-marko'
  const [shake, setShake] = useState(false);
  const lastQ = useRef(null);
  const askedRef = useRef(null);   // sinhroni špil-bez-ponavljanja; seme iz sačuvanog stanja (pokriva i prethodne borbe)
  if(askedRef.current===null) askedRef.current = new Set(state.map.asked||[]);
  const timerRef = useRef(null);
  const maxHp = mkEff(state,'maxHp');
  const effAtk = mkEff(state,'atk');
  const effDef = mkEff(state,'def');
  const timerMax = Math.round(((window.MKTWEAKS&&window.MKTWEAKS.tempo&&window.MKTWEAKS.tempo.timer)||11) + mkEff(state,'znanje')*0.2);

  const [pendingAct, setPendingAct] = useState(null);

  function addLog(t,k='info'){ setLog(L=>[...L.slice(-6), {t,k}]); }

  /* ---------- 1) Marko bira oružje ---------- */
  function doAction(act){
    if(turn!=='marko' || result) return;
    if(act.id==='doziv'){ setShowDoziv(true); return; }
    askQuestion(act);
  }

  function useAbility(compId){
    const c=COMPANIONS[compId];
    setUsedAbil(u=>[...u, compId]); setShowDoziv(false);
    if(c.akcija.id==='kletva'){ setKletva(true); addLog(`${c.ime}: „Majčina kletva“ — Turčin gubi sledeći napad.`, 'ally'); }
    else if(c.akcija.id==='pesma'){ setEasyNext(true); addLog(`${c.ime}: sledeće pitanje ide kao lako.`, 'ally'); }
    else { addLog(`${c.ime}: ${c.akcija.ime}.`, 'ally'); }
    // doziv ne troši potez — Marko i dalje bira oružje
  }

  /* ---------- 2) Pitanje gejtuje Markov napad (uvek se odgovara, bez ponavljanja) ---------- */
  function askQuestion(act){
    setPendingAct(act);
    setTurn('quiz');
    const askedSet = askedRef.current;
    let candidates = pool.filter(q=> !askedSet.has(q.id) && q.id!==lastQ.current);
    if(!candidates.length){                 // cela banka istrošena → izmešaj nanovo (osim poslednjeg)
      askedSet.clear(); if(lastQ.current) askedSet.add(lastQ.current);
      candidates = pool.filter(q=> q.id!==lastQ.current);
      dispatch({type:'RESET_ASKED', keep:lastQ.current});
    }
    if(easyNext){ const e=candidates.filter(q=>q.tezina==='lako'); if(e.length) candidates=e; }
    let q;
    if(act && act.id==='ralo'){
      // „Ralo i volove" se veže za teško pitanje — po mogućstvu q11 (čiji je odgovor baš „Ralom i volovima").
      q = candidates.find(x=>x.id==='q11')
        || candidates.find(x=>x.tezina==='tesko')
        || candidates[Math.floor(Math.random()*candidates.length)];
    } else {
      q = candidates[Math.floor(Math.random()*candidates.length)];
    }
    lastQ.current=q.id;
    askedSet.add(q.id);                      // sinhrono → nikad ponavljanje u istoj borbi
    dispatch({type:'MARK_ASKED', id:q.id});  // perzistira kroz sve borbe nivoa
    setQuestion({...q, _seen:false});
    setAnswered(null);                       // nikada unapred izabran odgovor
    setEasyNext(false);
    setTimeLeft(timerMax);
    timerRef.current=setInterval(()=>{
      setTimeLeft(tl=>{ if(tl<=1){ clearInterval(timerRef.current); onTimeout(q, act); return 0; } return tl-1; });
    },1000);
  }

  function clearTimer(){ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } }

  function answer(i){
    if(answered) return;
    clearTimer();
    const q=question; const correct = i===q.tacan;
    setAnswered({pick:i, correct});
    if(correct){ setCorrectCount(c=>c+1); setXpGain(x=>x+2); }
    else { setLearned(l=>l.includes(q.id)?l:[...l,q.id]); }
    setTimeout(()=>resolveAttack(correct, pendingAct), 1500);
  }
  function onTimeout(q, act){
    setAnswered({pick:null, correct:false, timeout:true});
    setLearned(l=>l.includes(q.id)?l:[...l,q.id]);
    setTimeout(()=>resolveAttack(false, act), 1500);
  }

  /* ---------- 3) Razrešenje: tačan = čist pogodak (bez kazne), netačan = promašaj + protivnik uzvraća ---------- */
  function resolveAttack(correct, act){
    setQuestion(null); setAnswered(null);
    if(correct){
      let power = act ? act.power : 0;
      if(act && act.id==='sablja' && correctCount>=3) power += 5;
      const dmg = Math.max(1, effAtk + power - enemy.def);
      const nhp = Math.max(0, enemy.hp - dmg);
      setEnemy(e=>({...e, hp:nhp}));
      setFlash('hit-enemy'); setTimeout(()=>setFlash(null), 420);
      addLog(`Tačno! Marko — ${act?act.ime:'napad'}: ${dmg} štete protivniku.`, 'marko');
      if(nhp<=0){ victory(); return; }
      setTimeout(()=>setTurn('marko'), 700);   // tačan odgovor → bez uzvraćanja, Marko ostaje neranjen
    } else {
      addLog(`Promašaj — ${act?act.ime:'napad'}: mimo cilja. Turčin koristi priliku!`, 'sys');
      setTurn('enemy');
      setTimeout(()=>enemyAttack(), 800);
    }
  }

  /* ---------- 4) Protivnik uzvraća ---------- */
  function enemyAttack(){
    if(result) return;
    if(kletva){ setKletva(false);
      addLog('Majčina kletva drži — Turčin propušta napad.', 'ally');
      setTimeout(()=>setTurn('marko'), 700); return; }
    const tdmg = (window.MKTWEAKS&&window.MKTWEAKS.tempo&&window.MKTWEAKS.tempo.dmg)||1;
    // Promašaj boli: Odbrana ublažava samo delom (trećina), uz minimum — da greška ima cenu, ali ne previše.
    const dmg = Math.max(4, Math.round((enemy.atk - Math.floor(effDef/3))*tdmg));
    const nhp = Math.max(0, markoHp - dmg);
    setMarkoHp(nhp);
    setFlash('hit-marko'); setShake(true); setTimeout(()=>{setFlash(null);setShake(false);},450);
    addLog(`${enemy.ime} uzvraća: ${dmg} štete.`, 'enemy');
    if(nhp<=0){ defeat(); return; }
    setTimeout(()=>setTurn('marko'), 500);
  }

  function victory(){
    setTurn('over'); setResult('win');
    addLog(state.battle.chaserId?'Gonič pade! Beži dalje — ka dvoru.':'Janjičar pade! Tri tovara blaga su tvoja.', 'win');
  }
  function defeat(){
    setTurn('over'); setResult('lose');
    addLog('Marko klonu... ali majka ga vraća u Prilep.', 'sys');
  }
  function finish(){
    const poi = state.battle.poi, chaserId = state.battle.chaserId;
    if(result==='win'){
      const nag = enemyDef.nagrada || { dukati:0, hrana:0 };
      dispatch({type:'BATTLE_END', result:'win', markoHp, xpGain:xpGain+(chaserId?10:20),
        learned, dukati:nag.dukati, hrana:nag.hrana, poi, chaserId});
    } else {
      dispatch({type:'BATTLE_END', result:'lose', markoHp:Math.max(15,Math.round(maxHp*0.4)),
        learned, poi:null, chaserId});
    }
  }
  useEffect(()=>()=>clearTimer(), []);

  const myTurn = turn==='marko' && !result;
  const dozivAbil = state.party.map(id=>COMPANIONS[id]).filter(c=>!usedAbil.includes(c.id));

  return (
    <div className={`mk-screen mk-battle ${shake?'shake':''}`} style={{backgroundImage:`url(${ART.bg_map})`}}>
      <div className="mk-battle-darken"/>
      <div className="mk-vignette"/>
      <div className="mk-battle-title">{T('BORBA')} — {T(enemyDef.ime)}</div>

      {/* Borci */}
      <div className="mk-arena">
        <div className={`mk-fighter left ${flash==='hit-marko'?'hit':''}`}>
          <img src={ART.marko} alt="Marko"/>
          <div className="mk-fighter-name">{T('Marko')}</div>
          <HPBar cur={markoHp} max={maxHp} color="var(--marko-blue-light)"/>
        </div>
        <div className="mk-vs">
          {turn==='marko' && !result ? <span className="mk-turn-ind">{T('Izaberi oružje')}</span>
            : turn==='quiz' ? <span className="mk-turn-ind">{T('Pitanje…')}</span>
            : turn==='over' ? <span className="mk-turn-ind">⚔</span>
            : <span className="mk-turn-ind dim">{T('Protivnik')}</span>}
        </div>
        <div className={`mk-fighter right ${flash==='hit-enemy'?'hit':''}`}>
          <img src={ART.janjicar} alt="Janjičar"/>
          <div className="mk-fighter-name">{T(enemy.ime)}</div>
          <HPBar cur={enemy.hp} max={enemy.maxHp} color="var(--blood-bright)"/>
        </div>
      </div>

      {/* Akcije / kviz */}
      <div className="mk-battle-bottom">
        {myTurn && !showDoziv &&
          <div className="mk-actions">
            {ACTIONS.filter(a=> a.id!=='ralo' || (state.map.carry && state.map.carry.ralo)).map(a=>{
              const dis = a.id==='doziv' && dozivAbil.length===0;
              return <button key={a.id} className="mk-action" disabled={dis} onClick={()=>doAction(a)}>
                <span className="mk-action-ime">{T(a.ime)}</span>
                <span className="mk-action-opis">{T(a.opis)}</span>
              </button>;
            })}
          </div>}
        {myTurn && showDoziv &&
          <div className="mk-actions">
            {dozivAbil.map(c=>(
              <button key={c.id} className="mk-action ally" onClick={()=>useAbility(c.id)}>
                <span className="mk-action-ime">{T(c.akcija.ime)}</span>
                <span className="mk-action-opis">{T(c.ime)} — {T(c.akcija.opis)}</span>
              </button>
            ))}
            <button className="mk-action" onClick={()=>setShowDoziv(false)}>
              <span className="mk-action-ime">↩ {T('Nazad')}</span></button>
          </div>}
        {myTurn && <div className="mk-actions-hint">{T('Tačan odgovor pogađa protivnika bez kazne — netačan je promašaj i Turčin uzvrati.')}</div>}
      </div>

      {/* Dnevnik borbe — gore-levo, ne preklapa red sa oružjem */}
      {!result && <div className="mk-log side">{log.slice(-5).map((l,i)=><div key={i} className={`mk-logline ${l.k}`}>{T(l.t)}</div>)}</div>}

      {/* Kviz overlay */}
      {question && <QuizOverlay q={question} answered={answered} timeLeft={timeLeft} timerMax={timerMax}
        onAnswer={answer}/>}

      {/* Ishod */}
      {result && <div className="mk-result-backdrop">
        <div className="mk-result">
          <h2 className={result==='win'?'win':'lose'}>{result==='win'?T('POBEDA'):T('Pao si...')}</h2>
          <Divider/>
          {result==='win'
            ? (state.battle.chaserId
                ? (()=>{ const ostalo=(state.map.chasers||[]).filter(c=>c.id!==state.battle.chaserId).length;
                    return <p>{T('Marko obori goniča! +150 mletačkih dukata, +10 XP.')}{' '}
                      {ostalo>0 ? T('Potera se nastavlja — ne staj!') : T('Potera je slomljena — put je slobodan.')}</p>; })()
                : <p>{T('Marko pobi janjičara ralom i volovima. Tri ćemera blaga — 900 mletačkih dukata (zlatnika) — i 20 XP. (Srbija 1371. kuje srebrni dinar; zlato je mletačko, za velike transakcije.)')}</p>)
            : <p>{T('Majka Jevrosima te vraća u dvor. Probaj ponovo — Marko uči iz svake borbe.')}</p>}
          <Btn variant="confirm" size="lg" onClick={finish}>{T('Nastavi')} ▸</Btn>
        </div>
      </div>}
    </div>
  );
}

function QuizOverlay({ q, answered, timeLeft, timerMax, onAnswer }){
  const tezLabel = {lako:'★ LAKO', srednje:'★★ SREDNJE', tesko:'★★★ TEŠKO'}[q.tezina];
  const danger = timeLeft<=5 && !answered;
  return (
    <div className="mk-quiz-backdrop">
      <div className="mk-quiz">
        <div className="mk-quiz-head">
          <span className="mk-quiz-tag">⚔ {T('PITANJE')} — {T(tezLabel)}{q._seen?'  ·  ↻ '+T('već viđeno'):''}</span>
          {!answered &&
            <span className={`mk-quiz-timer ${danger?'danger':''}`}>{timeLeft}s</span>}
        </div>
        {!answered &&
          <div className="mk-quiz-timerbar"><div style={{width:(timeLeft/timerMax*100)+'%'}}/></div>}
        <p className="mk-quiz-q">{T(q.pitanje)}</p>
        <div className="mk-quiz-opts">
          {q.opcije.map((o,i)=>{
            let cls='';
            if(answered){
              if(i===q.tacan) cls='correct';
              else if(answered.pick===i) cls='wrong';
            }
            return <button key={i} className={`mk-quiz-opt ${cls}`} disabled={!!answered}
              onClick={()=>onAnswer(i)}>
              <span className="mk-quiz-letter">{T(OPT_LABELS[i])}</span>{T(o)}</button>;
          })}
        </div>
        {answered &&
          <div className="mk-quiz-expl">
            <span className="mk-quiz-expl-ico">📖</span>
            <span>{answered.timeout && <b>{T('Vreme isteklo! ')}</b>}
              {answered.correct && <b className="ok">{T('Tačno! ')}</b>}
              {!answered.correct && !answered.timeout && <b className="no">{T('Pogrešno — ali Marko uči. ')}</b>}
              {T(q.obrazlozenje)}</span>
          </div>}
      </div>
    </div>
  );
}

Object.assign(window, { Battle });
