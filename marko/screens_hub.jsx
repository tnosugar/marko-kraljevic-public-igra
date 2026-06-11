/* =====================================================================
   PRILIP HUB — Markov dvor: statovi, 3 akcije, level-up, oprema, družina
   ===================================================================== */
function Hub({ state, dispatch }){
  const { ART, COMPANIONS, EQUIPMENT, LEVELUP_CHOICES, SKILL_TREE, LEVELS, CURRENCY } = window.MK;
  const [panel, setPanel] = useState(null); // 'majka' | 'svece' | 'oprema'
  const m = state.marko;
  const lvl = LEVELS[state.level];

  function eff(stat){ // efektivni stat sa bonusima saputnika + opreme
    let v = m[stat];
    state.party.forEach(id=>{ const b=COMPANIONS[id]?.bonus?.[stat]; if(b) v+=b; });
    Object.values(state.equipped).forEach(eid=>{
      for(const slot in EQUIPMENT){ const it=EQUIPMENT[slot].find(x=>x.id===eid); if(it&&it.mod[stat]) v+=it.mod[stat]; }
    });
    return v;
  }

  return (
    <div className="mk-screen mk-hub" style={{backgroundImage:`url(${ART.bg_hub})`}}>
      <div className="mk-vignette"/>
      <div className="mk-hub-top">
        <div className="mk-eyebrow">{T('❦ PRILEP · MARKOV DVOR ❦')}</div>
        <h1 className="mk-title">{T(lvl.naslov)}</h1>
        <div className="mk-citat">{T(lvl.citat)}</div>
      </div>

      {/* Statovi Marka — leva strana */}
      <div className="mk-hub-stats mk-panelframe">
        <Portrait src={ART.portret_marko} size={92} />
        <div className="mk-hub-name">{T('Kraljević Marko')}</div>
        <div className="mk-hub-lvl">{T('Nivo')} {m.level} · {m.xp} XP</div>
        <Divider mt={6} mb={8}/>
        <StatRow icon="hp" label="Zdravlje" value={`${m.hp}`} max={eff('maxHp')} color="var(--blood-bright)"/>
        <StatRow icon="atk" label="Napad" value={eff('atk')} color="var(--gold-bright)"/>
        <StatRow icon="def" label="Odbrana" value={eff('def')} color="var(--forest-bright)"/>
        <StatRow icon="znanje" label="Znanje" value={eff('znanje')} color="var(--parchment)"/>
        <Divider mt={8} mb={8}/>
        <div className="mk-reschips">
          <ResChip icon="dinar" value={state.resources.dinari} title={CURRENCY.dinar.ime+' — '+CURRENCY.dinar.opis} color="var(--silver-bright)"/>
          <ResChip icon="dukat" value={state.resources.dukati} title={CURRENCY.dukat.ime+' — '+CURRENCY.dukat.opis} color="var(--gold-bright)"/>
          <ResChip icon="hrana" value={state.resources.hrana} title="Hrana"/>
          <ResChip icon="znres" value={state.resources.znanjeRes} title="Znanje (pomoć)"/>
        </div>
      </div>

      {/* Akcije — desna strana */}
      <div className="mk-hub-actions">
        {state.levelUpReady &&
          <div className="mk-hub-flash">{T('Sveće gore u dvoru — vreme je za napredak.')}</div>}
        <HubAction title="Razgovor sa majkom Jevrosimom" sub="Kontekst pesme i savet"
          onClick={()=>setPanel('majka')} />
        <HubAction title="Sveće u dvoru" sub={state.levelUpReady?'Spreman level-up':'Napredak (posle nivoa)'}
          glow={state.levelUpReady} onClick={()=>setPanel('svece')} />
        <HubAction title="Opremanje" sub="Oprema i izbor do 3 saputnika"
          onClick={()=>setPanel('oprema')} />
        <HubAction title="Heroj i veštine" sub="Atributi, skill tree, inventar"
          onClick={()=>dispatch({type:'SCENE', scene:'hero'})} />
        <div style={{flex:1}}/>
        <Btn variant="confirm" size="lg" onClick={()=>dispatch({type:'START_LEVEL'})}>
          {T('Kreni u Nivo')} {state.level} ▸</Btn>
      </div>

      {panel==='majka' && <MajkaPanel state={state} onClose={()=>setPanel(null)} dispatch={dispatch}/>}
      {panel==='svece' && <SvecePanel state={state} dispatch={dispatch} onClose={()=>setPanel(null)}/>}
      {panel==='oprema' && <OpremaPanel state={state} dispatch={dispatch} onClose={()=>setPanel(null)}/>}
    </div>
  );
}

function HubAction({ title, sub, onClick, glow }){
  return (
    <button className={`mk-hubaction ${glow?'glow':''}`} onClick={onClick}>
      <div className="mk-hubaction-title">{T(title)}</div>
      <div className="mk-hubaction-sub">{T(sub)}</div>
      <span className="mk-hubaction-arrow">▸</span>
    </button>
  );
}

/* ---- Modal okvir ---- */
function Modal({ title, onClose, children, wide }){
  return (
    <div className="mk-modal-backdrop" onClick={onClose}>
      <div className={`mk-modal ${wide?'wide':''}`} onClick={e=>e.stopPropagation()}>
        <div className="mk-modal-head">
          <h2>{T(title)}</h2>
          <button className="mk-modal-x" onClick={onClose}>✕</button>
        </div>
        <Divider mt={2} mb={12}/>
        <div className="mk-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ---- Razgovor sa majkom ---- */
function MajkaPanel({ state, onClose, dispatch }){
  const { ART, LEVELS } = window.MK;
  const lvl = LEVELS[state.level];
  const mj = lvl.majka || {};
  return (
    <Modal title="Razgovor sa majkom Jevrosimom" onClose={onClose}>
      <div className="mk-dijalog">
        <Portrait src={ART.portret_jevrosima} size={120}/>
        <div className="mk-dijalog-txt">
          <div className="mk-dijalog-ime">{T('Jevrosima')}</div>
          {mj.rec && <p className="mk-dijalog-rec">{T(mj.rec)}</p>}
          {mj.savet && <p className="mk-dijalog-savet">{T(mj.savet)}</p>}
          <div className="mk-citat" style={{textAlign:'left',marginTop:8,whiteSpace:'pre-line'}}>{T(lvl.stih)}</div>
        </div>
      </div>
      <Divider/>
      <div style={{textAlign:'right'}}><Btn variant="confirm" onClick={onClose}>{T('Poslušaću — na svoj način')} ▸</Btn></div>
    </Modal>
  );
}

/* ---- Sveće u dvoru (level-up) ---- */
function SvecePanel({ state, dispatch, onClose }){
  const { LEVELUP_CHOICES, SKILL_TREE } = window.MK;
  if(!state.levelUpReady){
    return (<Modal title="Sveće u dvoru" onClose={onClose}>
      <p className="mk-muted">{T('Sveće još mirno gore. Napredak se otključava tek pošto se vratiš sa završenog nivoa.')}</p>
    </Modal>);
  }
  const lockedSkills = SKILL_TREE.flatMap(g=>g.vestine).filter(v=>!v.pocetna && !state.skills.includes(v.id));
  return (
    <Modal title="Sveće u dvoru — izaberi napredak" onClose={onClose} wide>
      <div className="mk-grid2">
        {LEVELUP_CHOICES.map(c=>(
          <button key={c.id} className="mk-choice" onClick={()=>{dispatch({type:'LEVELUP', choice:c.id}); onClose();}}>
            <div className="mk-choice-ime">{T(c.ime)}</div>
            <div className="mk-choice-opis">{T(c.opis)}</div>
          </button>
        ))}
        {lockedSkills.slice(0,2).map(s=>(
          <button key={s.id} className="mk-choice skill" onClick={()=>{dispatch({type:'UNLOCK_SKILL', id:s.id}); onClose();}}>
            <div className="mk-choice-ime">⚜ {T(s.ime)}</div>
            <div className="mk-choice-opis">{T(s.opis)}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ---- Opremanje + družina ---- */
function OpremaPanel({ state, dispatch, onClose }){
  const { EQUIPMENT, COMPANIONS, ART } = window.MK;
  const slotNames = { weapon:'Oružje', armor:'Oklop', kalpak:'Kalpak', mount:'Konj' };
  return (
    <Modal title="Opremanje" onClose={onClose} wide>
      <h3 className="mk-sub">{T('Oprema')}</h3>
      <div className="mk-equip-grid">
        {Object.keys(EQUIPMENT).map(slot=>(
          <div key={slot} className="mk-equip-slot">
            <div className="mk-equip-slotname">{T(slotNames[slot])}</div>
            {EQUIPMENT[slot].map(it=>{
              const locked = it.zakljucan && !(state.unlocked||[]).includes(it.id);
              const sel = state.equipped[slot]===it.id;
              return (<button key={it.id} disabled={locked}
                className={`mk-equip-item ${sel?'sel':''} ${locked?'locked':''}`}
                onClick={()=>dispatch({type:'EQUIP', slot, id:it.id})}>
                <span className="mk-equip-ime">{T(it.ime)}{locked?' 🔒':''}</span>
                <span className="mk-equip-opis">{T(it.opis)}</span>
              </button>);
            })}
          </div>
        ))}
      </div>
      <Divider/>
      <h3 className="mk-sub">{T('Družina')} ({state.party.length}/{state.partySlots})</h3>
      <div className="mk-party-row">
        {Object.values(COMPANIONS).map(c=>{
          const unlocked = state.unlockedCompanions.includes(c.id);
          const inParty = state.party.includes(c.id);
          return (
            <div key={c.id} className={`mk-companion ${inParty?'sel':''} ${!unlocked?'locked':''}`}
              onClick={()=>unlocked && dispatch({type:'TOGGLE_PARTY', id:c.id})}>
              <Portrait src={c.portret?ART[c.portret]:null} size={72}/>
              <div className="mk-companion-ime">{T(c.ime)}{!unlocked?' 🔒':''}</div>
              <div className="mk-companion-bonus">{T(c.bonusTekst)}</div>
              <div className="mk-companion-akc">{T(c.akcija.ime)}</div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

Object.assign(window, { Hub });
