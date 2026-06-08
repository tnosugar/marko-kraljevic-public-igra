/* =====================================================================
   HEROJ & VEŠTINE — atributi, skill tree, inventar, nivo/XP
   ===================================================================== */
function Hero({ state, dispatch }){
  const { ART, SKILL_TREE, EQUIPMENT, MARKO_START } = window.MK;
  const m = state.marko;
  const back = state.battle ? 'battle' : (state.map.started ? 'map' : 'hub');
  const slotNames = { weapon:'Oružje', armor:'Oklop', kalpak:'Kalpak', mount:'Konj' };

  return (
    <div className="mk-screen mk-hero" style={{backgroundImage:`url(${ART.bg_hub})`}}>
      <div className="mk-vignette"/>
      <div className="mk-hero-head">
        <Btn variant="ghost" size="sm" onClick={()=>dispatch({type:'SCENE', scene: state.map.started?'map':'hub'})}>↩ {T('Nazad')}</Btn>
        <h1 className="mk-title" style={{fontSize:34}}>{T('Kraljević Marko')}</h1>
        <div className="mk-hero-xp">{T('Nivo')} {m.level} · {m.xp} XP</div>
      </div>

      <div className="mk-hero-grid">
        {/* Atributi + inventar */}
        <div className="mk-hero-col mk-panelframe">
          <div className="mk-hero-marko">
            <Portrait src={ART.portret_marko} size={120}/>
          </div>
          <Divider/>
          <h3 className="mk-sub">{T('Atributi')}</h3>
          <AttrRow icon="hp" label="Zdravlje" base={m.maxHp} eff={mkEff(state,'maxHp')} color="var(--blood-bright)"/>
          <AttrRow icon="atk" label="Napad" base={m.atk} eff={mkEff(state,'atk')} color="var(--gold-bright)"/>
          <AttrRow icon="def" label="Odbrana" base={m.def} eff={mkEff(state,'def')} color="var(--forest-bright)"/>
          <AttrRow icon="znanje" label="Znanje" base={m.znanje} eff={mkEff(state,'znanje')} color="var(--parchment)"/>
          <Divider/>
          <h3 className="mk-sub">{T('Inventar')}</h3>
          <div className="mk-inv-slots">
            {Object.keys(EQUIPMENT).map(slot=>{
              const it=EQUIPMENT[slot].find(x=>x.id===state.equipped[slot]);
              return <div key={slot} className="mk-inv-slot">
                <div className="mk-inv-slotname">{T(slotNames[slot])}</div>
                <div className="mk-inv-itemname">{it?T(it.ime):'—'}</div>
              </div>;
            })}
            {[0,1,2,3].map(i=><div key={'g'+i} className="mk-inv-slot generic">
              <div className="mk-inv-slotname">{T('Mesto')} {i+1}</div>
              <div className="mk-inv-itemname dim">{state.generic[i]?T(state.generic[i]):'—'}</div></div>)}
          </div>
        </div>

        {/* Skill tree */}
        <div className="mk-hero-col wide mk-panelframe">
          <h3 className="mk-sub">{T('Stablo veština')} — {T('5 grana × 3 veštine')}</h3>
          <div className="mk-skilltree">
            {SKILL_TREE.map(g=>(
              <div key={g.grana} className="mk-branch">
                <div className="mk-branch-head"><Icon name={g.ikona} size={18} color="var(--gold-bright)"/> {T(g.grana)}</div>
                {g.vestine.map(v=>{
                  const owned = v.pocetna || state.skills.includes(v.id);
                  return <div key={v.id} className={`mk-skill ${owned?'owned':'locked'}`}>
                    <div className="mk-skill-ime">{owned?'✦':'◇'} {T(v.ime)}
                      {!owned && v.cena>0 && <span className="mk-skill-cena">{v.cena} {T('znanja')}</span>}</div>
                    <div className="mk-skill-opis">{T(v.opis)}</div>
                  </div>;
                })}
              </div>
            ))}
          </div>
          <Divider/>
          <p className="mk-muted" style={{fontSize:13}}>{T('Nove veštine se otključavaju kroz „Sveće u dvoru“ posle svakog nivoa. Marko bira maksimalno 12 od 15 veština kroz 16 pesama — strateška dilema.')}</p>
        </div>
      </div>
    </div>
  );
}

function AttrRow({ icon, label, base, eff, color }){
  const bonus = eff-base;
  return (
    <div className="mk-attr">
      <span className="mk-attr-ico" style={{color}}><Icon name={icon} size={18} color={color}/></span>
      <span className="mk-attr-label">{T(label)}</span>
      <span className="mk-attr-val">{eff}{bonus>0 && <em className="mk-attr-bonus"> (+{bonus})</em>}</span>
    </div>
  );
}

Object.assign(window, { Hero });
