/* =====================================================================
   Deljene UI komponente + ćirilica/latinica transliteracija
   ===================================================================== */
const { useState, useEffect, useRef } = React;

/* ---- Transliteracija latinica -> ćirilica ---- */
const _DIGRAPH = { 'Lj':'Љ','lj':'љ','Nj':'Њ','nj':'њ','Dž':'Џ','dž':'џ','DŽ':'Џ','LJ':'Љ','NJ':'Њ' };
const _MAP = { a:'а',b:'б',v:'в',g:'г',d:'д','đ':'ђ',e:'е','ž':'ж',z:'з',i:'и',j:'ј',k:'к',
  l:'л',m:'м',n:'н',o:'о',p:'п',r:'р',s:'с',t:'т','ć':'ћ',u:'у',f:'ф',h:'х',c:'ц','č':'ч','š':'ш',
  A:'А',B:'Б',V:'В',G:'Г',D:'Д','Đ':'Ђ',E:'Е','Ž':'Ж',Z:'З',I:'И',J:'Ј',K:'К',L:'Л',M:'М',N:'Н',
  O:'О',P:'П',R:'Р',S:'С',T:'Т','Ć':'Ћ',U:'У',F:'Ф',H:'Х',C:'Ц','Č':'Ч','Š':'Ш' };
function toCyr(str){
  if (str == null) return str;
  let out = '';
  for (let i=0;i<str.length;i++){
    const pair = str.substr(i,2);
    if (_DIGRAPH[pair]) { out += _DIGRAPH[pair]; i++; continue; }
    out += (_MAP[str[i]] !== undefined ? _MAP[str[i]] : str[i]);
  }
  return out;
}
window.__mkScript = 'lat';
function T(s){ return window.__mkScript === 'cyr' ? toCyr(s) : s; }

/* ---- Inline SVG ikone (gold stroke, vizantijski ton) ---- */
function Icon({ name, size=18, color='currentColor' }){
  const p = { width:size, height:size, viewBox:'0 0 24 24', fill:'none',
    stroke:color, strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' };
  switch(name){
    case 'hp': return (<svg {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill={color} stroke="none"/></svg>);
    case 'atk': return (<svg {...p}><path d="M14.5 4.5 20 4l-.5 5.5L8 21l-3-3L14.5 4.5z"/><path d="M5 18l-2 3 3-2"/><path d="M4 4l5 5"/></svg>);
    case 'def': return (<svg {...p}><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/></svg>);
    case 'znanje': return (<svg {...p}><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5C4.7 19 4 18.3 4 17.5v-12z"/><path d="M20 5.5C20 4.7 19.3 4 18.5 4H13v15h5.5c.8 0 1.5-.7 1.5-1.5v-12z"/></svg>);
    case 'dinar': return (<svg {...p}><circle cx="12" cy="12" r="8.5"/><path d="M8.6 14.8h6.8"/><path d="M8.9 14.8l.5-3.4 1.7 1.5L12 9.4l.9 3.5 1.7-1.5.5 3.4"/></svg>);
    case 'dukat': return (<svg {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.4v9.2M7.6 12h8.8"/></svg>);
    case 'hrana': return (<svg {...p}><path d="M12 3c-3 3-4 6-4 9a4 4 0 0 0 8 0c0-3-1-6-4-9z"/><path d="M12 12v9"/></svg>);
    case 'znres': return (<svg {...p}><path d="M12 3l2.4 5.6L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-.4L12 3z"/></svg>);
    case 'cilj': return (<svg {...p}><path d="M6 21V4M6 4l11 2-3 4 3 4-11 2"/></svg>);
    case 'mace': return (<svg {...p}><circle cx="9" cy="9" r="4"/><path d="M6 6L3 3M12 6l2-2M6 12l-2 2M12 12l8 8"/></svg>);
    case 'sword': return (<svg {...p}><path d="M14.5 4.5 20 4l-.5 5.5L9 20l-4 0 0-4L14.5 4.5z"/></svg>);
    case 'cross': return (<svg {...p}><path d="M12 3v18M7 8h10"/></svg>);
    default: return null;
  }
}

/* ---- Ornamentni divider ---- */
function Divider({ w='100%', mt=10, mb=10 }){
  return (<div className="mk-div" style={{width:w, marginTop:mt, marginBottom:mb}}>
    <span>◆</span><i/><span>◆</span><i/><span>◆</span></div>);
}

/* ---- Dugme ---- */
function Btn({ children, onClick, variant='primary', disabled, size='md', style }){
  return (<button className={`mk-btn mk-btn-${variant} mk-btn-${size}`} onClick={onClick}
    disabled={disabled} style={style}>{children}</button>);
}

/* ---- Portret u zlatnom okviru ---- */
function Portrait({ src, size=96, alt='', selected, onClick, label }){
  return (
    <div className={`mk-portret ${selected?'sel':''} ${onClick?'clk':''}`} onClick={onClick}
      style={{width:size}}>
      <div className="mk-portret-img" style={{width:size, height:size}}>
        {src ? <img src={src} alt={alt} draggable="false"/> :
          <div className="mk-portret-ph"><Icon name="def" size={size*0.4} color="#6b4f10"/></div>}
      </div>
      {label && <div className="mk-portret-label">{T(label)}</div>}
    </div>
  );
}

/* ---- Stat red sa ikonom ---- */
function StatRow({ icon, label, value, max, color='var(--gold)' }){
  return (
    <div className="mk-statrow">
      <span className="mk-stat-ico" style={{color}}><Icon name={icon} size={16} color={color}/></span>
      <span className="mk-stat-label">{T(label)}</span>
      <span className="mk-stat-val">{value}{max!=null?` / ${max}`:''}</span>
    </div>
  );
}

/* ---- HP traka ---- */
function HPBar({ cur, max, color='var(--blood-bright)', h=14, showText=true }){
  const pct = Math.max(0, Math.min(100, (cur/max)*100));
  return (
    <div className="mk-hpbar" style={{height:h}}>
      <div className="mk-hpbar-fill" style={{width:pct+'%', background:color}}/>
      {showText && <div className="mk-hpbar-txt">{Math.max(0,Math.round(cur))} / {max}</div>}
    </div>
  );
}

/* ---- Resurs čip ---- */
function ResChip({ icon, value, title, color='var(--gold-bright)' }){
  return (<div className="mk-reschip" title={title}>
    <Icon name={icon} size={15} color={color}/><span>{value}</span></div>);
}

/* ---- Efektivni stat (osnovni + saputnici + oprema) ---- */
function mkEff(state, stat){
  const { COMPANIONS, EQUIPMENT } = window.MK;
  let v = state.marko[stat];
  state.party.forEach(id=>{ const b=COMPANIONS[id]?.bonus?.[stat]; if(b) v+=b; });
  Object.values(state.equipped).forEach(eid=>{
    for(const slot in EQUIPMENT){ const it=EQUIPMENT[slot].find(x=>x.id===eid); if(it&&it.mod[stat]) v+=it.mod[stat]; }
  });
  return v;
}

Object.assign(window, { T, toCyr, Icon, Divider, Btn, Portrait, StatRow, HPBar, ResChip, mkEff });
