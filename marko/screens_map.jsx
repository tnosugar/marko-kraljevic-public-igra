/* =====================================================================
   AVANTURA MAPA — KONTINUALNI TEREN
   Teren se ne crta po pločici nego kao jedna slikana površina na <canvas>:
   svaka vrsta tla se uzorkuje u svetskim koordinatama (bešavno) i maskira
   omekšanim (feather) heks-maskama → prirodne granice, bez ivica.
   Heks-mreža postoji samo za KRETANJE (nevidljivi klik-slojevi).
   ===================================================================== */
const { useState, useEffect, useRef } = React;

const HEX_SIZE = 18.5;
const HEX_W = HEX_SIZE * 2;
const HEX_H = Math.sqrt(3) * HEX_SIZE;
const COL_DX = HEX_SIZE * 1.5;
const PAD_X = 14, PAD_Y = 12;
const CANVAS_W = 864, CANVAS_H = 658;

function hexCenter(c, r){
  const x = PAD_X + HEX_W/2 + c * COL_DX;
  const y = PAD_Y + HEX_H/2 + r * HEX_H + (c & 1 ? HEX_H/2 : 0);
  return { x, y };
}
function neighbors(c, r){
  const even = (c & 1) === 0;
  const dirs = even
    ? [[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[0,1]]
    : [[1,1],[1,0],[0,-1],[-1,0],[-1,1],[0,1]];
  return dirs.map(([dc,dr])=>[c+dc, r+dr]);
}
function hashCR(c,r){ let h=(c*374761393 + r*668265263)>>>0; h=((h^(h>>13))*1274126177)>>>0; return h>>>0; }
function jit(c,r,amp){ return ((hashCR(c,r)%1000)/1000 - 0.5)*amp; }

/* ——— Generisanje terena iz regiona ——— */
function segDist(px,py, ax,ay, bx,by){
  const dx=bx-ax, dy=by-ay; const l2=dx*dx+dy*dy;
  let t = l2? ((px-ax)*dx+(py-ay)*dy)/l2 : 0; t=Math.max(0,Math.min(1,t));
  const qx=ax+t*dx, qy=ay+t*dy; return Math.hypot(px-qx,py-qy);
}
function genTerrain(level){
  const { cols, rows } = level.grid;
  const T = level.terrain, road = level.road, poi = level.poi;
  const poiSet = new Set(Object.values(poi).map(p=>p.c+','+p.r));
  function roadDist(c,r){
    let m=1e9;
    for(let i=0;i<road.length-1;i++) m=Math.min(m, segDist(c,r, road[i].c,road[i].r, road[i+1].c,road[i+1].r));
    return m;
  }
  const grid=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const de=Math.min(c,cols-1-c,r,rows-1-r);
    const protect = poiSet.has(c+','+r) || roadDist(c,r) < 1.05;
    let t;
    if(protect) t='P';
    else if(de < T.mountRing + Math.max(0,jit(c,r,2.0))) t='M';
    else if(((c-T.lake.cx)/T.lake.rx)**2 + ((r-T.lake.cy)/T.lake.ry)**2 < 1 + jit(c,r,0.35)) t='V';
    else if(T.forests.some(f=>Math.hypot(c-f.cx,r-f.cy) < f.r + jit(c,r,1.3))) t='S';
    else if(T.fields.some(f=>Math.hypot(c-f.cx,r-f.cy) < f.r + jit(c+7,r+3,0.9))) t='O';
    else t='P';
    grid.push({ c, r, t });
  }
  return { grid, cols, rows };
}
function cellAt(grid, c, r){ return grid.find(g=>g.c===c && g.r===r); }

/* ——— Dijkstra kretanje ——— */
function reachable(grid, start, budget){
  const { TERRAIN } = window.MK;
  const key=(c,r)=>c+','+r;
  const dist={[key(start.c,start.r)]:0}, prev={};
  const pq=[{c:start.c,r:start.r,d:0}];
  while(pq.length){
    pq.sort((a,b)=>a.d-b.d); const cur=pq.shift();
    if(cur.d>dist[key(cur.c,cur.r)]) continue;
    for(const [nc,nr] of neighbors(cur.c,cur.r)){
      const cell=cellAt(grid,nc,nr); if(!cell) continue;
      const ter=TERRAIN[cell.t]; if(!ter.prolazno) continue;
      const bk=key(nc,nr); const nd=cur.d+ter.cena;
      if(nd<=budget && (dist[bk]===undefined || nd<dist[bk])){
        dist[bk]=nd; prev[bk]={c:cur.c,r:cur.r}; pq.push({c:nc,r:nr,d:nd});
      }
    }
  }
  return { dist, prev };
}
function pathTo(prev, start, dest){
  const key=(c,r)=>c+','+r; const path=[]; let cur=dest;
  while(cur && !(cur.c===start.c && cur.r===start.r)){
    path.unshift(cur); cur=prev[key(cur.c,cur.r)]; if(!cur) return null;
  }
  return path;
}
function isAdj(a,b){ return neighbors(a.c,a.r).some(([c,r])=>c===b.c&&r===b.r); }
/* BFS pratilac: pomera se do `steps` heksova najkraćim putem ka meti (Marku) */
function bfsNext(grid, from, to, steps){
  const { TERRAIN } = window.MK;
  const key=(c,r)=>c+','+r;
  const prev={[key(from.c,from.r)]:null}; const q=[from];
  while(q.length){
    const cur=q.shift();
    if(cur.c===to.c && cur.r===to.r) break;
    for(const [nc,nr] of neighbors(cur.c,cur.r)){
      const cell=cellAt(grid,nc,nr); if(!cell) continue;
      if(!TERRAIN[cell.t].prolazno) continue;
      const k=key(nc,nr); if(prev[k]!==undefined) continue;
      prev[k]={c:cur.c,r:cur.r}; q.push({c:nc,r:nr});
    }
  }
  if(prev[key(to.c,to.r)]===undefined) return { pos:from, dist:Infinity };
  const path=[]; let cur=to; while(cur){ path.unshift(cur); cur=prev[key(cur.c,cur.r)]; }
  const dist=path.length-1; const idx=Math.min(steps, dist);
  return { pos:path[Math.min(idx, path.length-1)], dist };
}

/* ——— Slikanje kontinualnog terena na canvas ——— */
function mkOff(){ const c=document.createElement('canvas'); c.width=CANVAS_W; c.height=CANVAS_H; return c; }
function hexPathOn(ctx,x,y,scale){
  const s=HEX_SIZE*scale, h=HEX_H*scale;
  ctx.beginPath();
  ctx.moveTo(x-s/2,y-h/2); ctx.lineTo(x+s/2,y-h/2); ctx.lineTo(x+s,y);
  ctx.lineTo(x+s/2,y+h/2); ctx.lineTo(x-s/2,y+h/2); ctx.lineTo(x-s,y); ctx.closePath();
}
/* ——— RNG + pomoćnici za slikanje ——— */
function rng(seed){ let s=(seed>>>0)||1; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function tilePat(ctx,img,scale){ const p=ctx.createPattern(img,'repeat');
  if(scale&&p&&p.setTransform){ try{ p.setTransform(new DOMMatrix([scale,0,0,scale,0,0])); }catch(e){} } return p; }

function drawGrass(ctx,img,img2){
  if(img){ ctx.fillStyle=tilePat(ctx,img,0.9); ctx.fillRect(0,0,CANVAS_W,CANVAS_H); }
  else { ctx.fillStyle='#6f8a3c'; ctx.fillRect(0,0,CANVAS_W,CANVAS_H); }
  // mrlje alternativne trave (polje_v2) — razbija ponavljanje
  if(img2){
    const R=rng(424242);
    const lc=mkOff(), lx=lc.getContext('2d');
    lx.fillStyle=tilePat(lx,img2,0.9); lx.fillRect(0,0,CANVAS_W,CANVAS_H);
    const mc=mkOff(), mx=mc.getContext('2d'); mx.filter='blur(34px)'; mx.fillStyle='#fff';
    for(let i=0;i<7;i++){ mx.beginPath(); mx.ellipse(R()*CANVAS_W,R()*CANVAS_H,90+R()*150,80+R()*130,0,0,Math.PI*2); mx.fill(); }
    mx.filter='none'; lx.globalCompositeOperation='destination-in'; lx.drawImage(mc,0,0);
    ctx.drawImage(lc,0,0);
  }
}
function paintFeather(ctx, cells, makeFill, feather, expand){
  if(!cells||!cells.length) return;
  const lc=mkOff(), lx=lc.getContext('2d');
  lx.fillStyle=makeFill(lx); lx.fillRect(0,0,CANVAS_W,CANVAS_H);
  const mc=mkOff(), mx=mc.getContext('2d');
  mx.fillStyle='#fff'; mx.filter=feather?`blur(${feather}px)`:'none';
  cells.forEach(c=>{ const {x,y}=hexCenter(c.c,c.r); hexPathOn(mx,x,y,expand); mx.fill(); });
  mx.filter='none';
  lx.globalCompositeOperation='destination-in'; lx.drawImage(mc,0,0);
  ctx.drawImage(lc,0,0);
}
function drawLake(ctx, cells, vodaImg){
  if(!cells||!cells.length) return;
  // glatka peščana obala — jak blur stapa heks-uniju u obli oblik
  paintFeather(ctx, cells, ()=>'rgba(214,190,134,.97)', 28, 1.82);  // pesak (obala)
  paintFeather(ctx, cells, ()=>'rgba(150,176,150,.7)', 22, 1.40);   // travnati rub
  paintFeather(ctx, cells, (lx)=> vodaImg?tilePat(lx,vodaImg,0.85):'#27506f', 20, 1.12); // dubina (prava voda)
  // tamniji prsten dubine ka sredini
  paintFeather(ctx, cells, ()=>'rgba(20,50,80,.30)', 16, 0.82);
  // svetlucanje
  const lc=mkOff(), lx=lc.getContext('2d');
  const R=rng(771);
  cells.forEach(c=>{ const {x,y}=hexCenter(c.c,c.r);
    for(let i=0;i<2;i++){ lx.fillStyle='rgba(220,235,240,'+(0.04+R()*0.05)+')'; lx.filter='blur(3px)';
      lx.beginPath(); lx.ellipse(x+(R()-.5)*HEX_W, y+(R()-.5)*HEX_H, 10+R()*16, 2.5+R()*3, 0,0,Math.PI*2); lx.fill(); } });
  lx.filter='none';
  const mc=mkOff(), mx=mc.getContext('2d');
  mx.fillStyle='#fff'; mx.filter='blur(20px)';
  cells.forEach(c=>{ const {x,y}=hexCenter(c.c,c.r); hexPathOn(mx,x,y,1.0); mx.fill(); });
  mx.filter='none'; lx.globalCompositeOperation='destination-in'; lx.drawImage(mc,0,0);
  ctx.drawImage(lc,0,0);
}
function drawMountains(ctx, cells, steneImg){
  if(!cells||!cells.length || !steneImg) return;
  // tamna podloga (dubina/senka venca)
  paintFeather(ctx, cells, ()=>'rgba(38,40,48,.85)', 14, 1.5);
  // prava snežna stena, tiled, maskirana na M-region
  paintFeather(ctx, cells, (lx)=> tilePat(lx, steneImg, 1.15), 11, 1.32);
}
function applyLandMask(ctx, cells){
  const mc=mkOff(), mx=mc.getContext('2d');
  mx.fillStyle='#fff'; mx.filter='blur(11px)';
  cells.forEach(c=>{ const {x,y}=hexCenter(c.c,c.r); hexPathOn(mx,x,y,1.5); mx.fill(); });
  mx.filter='none';
  ctx.globalCompositeOperation='destination-in'; ctx.drawImage(mc,0,0);
  ctx.globalCompositeOperation='source-over';
}
function drawObjects(ctx, gridData, level, tex){
  const cells=gridData.grid;
  const decid=[tex.hrast, tex.hrast2, tex.bukva].filter(Boolean);   // listopadno
  const conif=[tex.bor, tex.jela].filter(Boolean);                  // četinari
  const poiSet=new Set(Object.values(level.poi).map(p=>p.c+','+p.r));
  const objs=[];
  function place(x,y,img,w,anchor,shadow){ if(img) objs.push({x,y,img,w,flip:false,anchor,shadow}); }
  cells.forEach(cell=>{
    if(poiSet.has(cell.c+','+cell.r)) return;
    const {x,y}=hexCenter(cell.c,cell.r); const R=rng(hashCR(cell.c,cell.r));
    if(cell.t==='S'){
      // 2–3 stabla po ćeliji; pretežno listopadno + poneki četinar
      const n = 2 + (R()<0.5?1:0);
      for(let i=0;i<n;i++){
        const conf = R()<0.28;
        const pool = conf?conif:decid;
        const img = pool.length? pool[Math.floor(R()*pool.length)] : decid[0];
        const sz = (conf?0.95:1.15) + R()*0.5;
        place(x+(R()-.5)*HEX_W*1.0, y+(R()-.5)*HEX_H*0.95, img, HEX_W*sz, 0.84, 0.5);
      }
    } else if(cell.t==='P'){
      const v=R();
      if(v<0.030) place(x+(R()-.5)*HEX_W, y, tex.kamen, HEX_W*(0.85+R()*0.5), 0.72, 0.5);
      else if(v<0.055) place(x+(R()-.5)*HEX_W, y, tex.kamen1, HEX_W*(0.6+R()*0.3), 0.70, 0.45);
      else if(v<0.10) place(x+(R()-.5)*HEX_W, y, tex.grm, HEX_W*(0.6+R()*0.3), 0.72, 0.4);
      else if(v<0.13 && tex.drvece) place(x+(R()-.5)*HEX_W, y, tex.drvece, HEX_W*(1.5+R()*0.6), 0.82, 0.55);
    }
  });
  objs.sort((a,b)=>a.y-b.y);
  objs.forEach(o=>{
    if(!o.img) return;
    const ar=o.img.height/o.img.width, w=o.w, hh=w*ar;
    if(o.shadow>0){ ctx.save(); ctx.filter='blur(3px)'; ctx.fillStyle=`rgba(0,0,0,${0.14*o.shadow+0.05})`;
      ctx.beginPath(); ctx.ellipse(o.x, o.y, w*0.30, w*0.10, 0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
    ctx.drawImage(o.img, o.x-w/2, o.y-hh*o.anchor, w, hh);
  });
}

function paintTerrain(canvas, gridData, level, tex){
  const { TERRAIN } = window.MK;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
  const cells=gridData.grid;
  const byType={}; cells.forEach(c=>{(byType[c.t]=byType[c.t]||[]).push(c);});
  // ——— TLO ———
  drawGrass(ctx, tex.polje, tex.polje2);
  paintFeather(ctx, byType['O'], (lx)=> tex.oranje? tilePat(lx,tex.oranje,0.9):'#6b4a26', 20, 1.45);
  drawLake(ctx, byType['V'], tex.voda);
  paintRoad(ctx, level.road, tex.drum);
  applyLandMask(ctx, cells);              // omekšan spoljni obris tla (trava→tama)
  drawMountains(ctx, byType['M'], tex.stene);  // snežni venac kao prava stena
  // ——— OBJEKTI (šume, kamenje, žbunje) iznad, Y-sortirano ———
  drawObjects(ctx, gridData, level, tex);
}
function paintRoad(ctx, road, drumImg){
  if(!road || road.length<2) return;
  const pts=road.map(w=>hexCenter(w.c,w.r));
  function trace(){
    ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1]; const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      ctx.quadraticCurveTo(a.x,a.y,mx,my);
    }
    ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
  }
  ctx.save(); ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.filter='blur(2.5px)'; trace(); ctx.lineWidth=HEX_SIZE*1.25; ctx.strokeStyle='rgba(40,26,12,.55)'; ctx.stroke();
  ctx.filter='none';
  if(drumImg){ trace(); ctx.lineWidth=HEX_SIZE*0.95; ctx.strokeStyle=ctx.createPattern(drumImg,'repeat'); ctx.stroke(); }
  trace(); ctx.lineWidth=HEX_SIZE*0.95; ctx.strokeStyle='rgba(120,80,40,.20)'; ctx.stroke();
  ctx.restore();
}

let __mkTexCache=null;
function loadTextures(ART, cb){
  if(__mkTexCache){ cb(__mkTexCache); return; }
  const list = {
    polje:ART.tile.polje, polje2:ART.tile.polje2, oranje:ART.tile.oranje,
    voda:ART.tile.voda, stene:ART.tile.stene, drum:ART.tile.drum,
    hrast:ART.obj.hrast, hrast2:ART.obj.hrast2, bukva:ART.obj.bukva,
    bor:ART.obj.bor, jela:ART.obj.jela, drvece:ART.obj.drvece,
    grm:ART.obj.grm, kamen:ART.obj.kamen, kamen1:ART.obj.kamen1,
  };
  const entries=Object.entries(list); const tex={}; let done=0;
  entries.forEach(([k,src])=>{
    const im=new Image();
    im.onload=im.onerror=()=>{ if(im.naturalWidth) tex[k]=im; if(++done===entries.length){ __mkTexCache=tex; cb(tex); } };
    im.src=src;
  });
}

function HexMap({ state, dispatch }){
  const { ART, TERRAIN, LEVELS, ENEMIES, COMPANIONS, CURRENCY } = window.MK;
  const level = LEVELS[state.level];
  const gridData = useRef(genTerrain(level)).current;
  const grid = gridData.grid;
  const pos = state.map.pos;
  const [tokenXY, setTokenXY] = useState(hexCenter(pos.c, pos.r));
  const [moving, setMoving] = useState(false);
  const [toast, setToast] = useState(null);
  const [outro, setOutro] = useState(false);   // završni prizor — Marko predaje blago majci
  const [painted, setPainted] = useState(false);
  const movingRef = useRef(false);
  const canvasRef = useRef(null);

  const poiAt = (c,r)=>Object.entries(level.poi).find(([k,p])=>p.c===c&&p.r===r);
  const carry = state.map.carry || {blago:false,ralo:false,dinari:false};
  const quest = state.map.quest || 'toStala';
  const chasers = state.map.chasers || [];
  const enemyCleared = carry.blago;
  const raloDone = carry.ralo;
  const dinariDone = carry.dinari;
  const objTarget = quest==='toStala'?level.poi.cilj
    : quest==='toEnemy'?level.poi.enemy
    : quest==='toDinari'?level.poi.blago
    : quest==='toDvor'?level.poi.start : null;
  const { dist, prev } = reachable(grid, pos, state.map.moveLeft);

  useEffect(()=>{ setTokenXY(hexCenter(pos.c,pos.r)); }, [pos.c,pos.r]);
  useEffect(()=>{
    let alive=true;
    loadTextures(ART, (tex)=>{ if(!alive||!canvasRef.current) return; paintTerrain(canvasRef.current, gridData, level, tex); setPainted(true); });
    return ()=>{ alive=false; };
  }, []);

  function go(cell){
    if(movingRef.current || moving) return;
    const k=cell.c+','+cell.r;
    if(dist[k]===undefined || (cell.c===pos.c && cell.r===pos.r)) return;
    const path=pathTo(prev, pos, {c:cell.c,r:cell.r}); if(!path) return;
    movingRef.current=true; setMoving(true);
    let i=0;
    const step=()=>{
      if(i>=path.length){ movingRef.current=false; setMoving(false);
        dispatch({type:'MOVE', dest:{c:cell.c,r:cell.r}, cost:dist[k]}); arrive(cell.c, cell.r); return; }
      const p=path[i]; setTokenXY(hexCenter(p.c,p.r)); i++; setTimeout(step, 150);
    };
    step();
  }
  function arrive(c,r){
    const found = poiAt(c,r);
    let block=false;            // borba ili level-kraj → ne pomeraj goniče ovaj potez
    let raloJustPicked=false;
    if(found){
      const [kind,p]=found;
      if(kind==='cilj' && !raloDone){
        raloJustPicked=true;
        dispatch({type:'PICK_RALO'});
        setToast('Uze ralo i volove! Sad ralom navali na janjičara na drumu.');
      } else if(kind==='enemy' && !enemyCleared){
        if(!raloDone){
          setToast('Prvo uzmi ralo i volove kod štale — njime ćeš oboriti janjičara.');
        } else {
          block=true;
          setTimeout(()=>dispatch({type:'START_BATTLE', enemy:p.enemy, poi:'enemy'}), 220);
        }
      } else if(kind==='blago' && enemyCleared && !dinariDone){
        dispatch({type:'COLLECT', poi:'blago', dinari:p.dinari, hrana:p.hrana});
        setToast(`Škrinja! +${p.dinari} srebrnih dinara, +${p.hrana} hrane.`);
      } else if(kind==='blago' && !enemyCleared){
        setToast('Prvo obori janjičara na drumu i uzmi blago, pa onda po dinare.');
      } else if(kind==='start' && state.map.day>=1 && (enemyCleared||raloDone||dinariDone)){
        if(carry.blago && raloDone && dinariDone){
          block=true;
          setTimeout(()=>setOutro(true), 350);   // završni prizor pred povratak u dvor
        } else {
          setToast('Vrati se u dvor tek kad skupiš blago janjičara, ralo i dinare.');
        }
      }
    }
    if(!block && !raloJustPicked) advanceChasers({c,r});
  }

  /* Poternja: goniči se primiču posle svakog Markovog poteza */
  function advanceChasers(markoPos){
    if(!(quest==='toDinari' || quest==='toDvor') || !chasers.length) return;
    const STEP = (window.MKTWEAKS&&window.MKTWEAKS.tempo&&window.MKTWEAKS.tempo.chaser)||3;
    let caught=null;
    const moved = chasers.map(ch=>{
      const r=bfsNext(grid, {c:ch.c,r:ch.r}, markoPos, STEP);
      const np={...ch, c:r.pos.c, r:r.pos.r};
      if(!caught && ((np.c===markoPos.c&&np.r===markoPos.r) || isAdj(np, markoPos))) caught=np;
      return np;
    });
    dispatch({type:'MOVE_CHASERS', chasers:moved});
    if(caught) setTimeout(()=>dispatch({type:'START_BATTLE', enemy:'gonic', poi:null, chaserId:caught.id}), 340);
  }

  function endTurn(){ dispatch({type:'END_TURN'}); advanceChasers(pos); }

  return (
    <div className="mk-screen mk-map">
      <div className="mk-map-bg" style={{backgroundImage:`url(${ART.bg_map})`}}/>
      <div className="mk-map-scrim"/>
      <div className="mk-map-title">{T(level.naslov)}</div>

      <div className="mk-hexwrap">
        <canvas ref={canvasRef} className="mk-mapcanvas" width={CANVAS_W} height={CANVAS_H}/>

        {/* nevidljivi sloj za KRETANJE + isticanje dohvata */}
        {grid.map(cell=>{
          const {x,y}=hexCenter(cell.c,cell.r);
          const k=cell.c+','+cell.r;
          const terr=TERRAIN[cell.t];
          const reach = dist[k]!==undefined && !(cell.c===pos.c&&cell.r===pos.r);
          const here = cell.c===pos.c&&cell.r===pos.r;
          return (
            <div key={k}
              className={`mk-hexcell ${reach?'reach':''} ${here?'here':''}`}
              style={{ left:x-HEX_W/2, top:y-HEX_H/2, width:HEX_W, height:HEX_H }}
              onClick={()=>terr.prolazno && reach && go(cell)}/>
          );
        })}

        {/* ——— ARTEFAKTI I LIKOVI (sortirani po Y) ——— */}
        {Object.entries(level.poi).map(([kind,p])=>{
          const {x,y}=hexCenter(p.c,p.r);
          let href=null, w=58;
          if(p.tip==='dvor'){ href=ART.obj.dvor; w=104; }
          else if(p.tip==='cilj'){ href=ART.obj.stala; w=88; }
          else return null;
          return <img key={kind} src={href} className="mk-poi-img" alt=""
            style={{left:x, top:y, width:w, zIndex:Math.round(y)}} draggable="false"/>;
        })}
        {!dinariDone && (()=>{ const p=level.poi.blago; const c=hexCenter(p.c,p.r);
          return <div className="mk-poi-coin silver" style={{left:c.x, top:c.y, zIndex:Math.round(c.y)+1}}>
            <Icon name="dinar" size={16} color="#3a414c"/></div>; })()}
        {objTarget && (()=>{ const c=hexCenter(objTarget.c,objTarget.r);
          return <div className="mk-poi-flag pulse" style={{left:c.x, top:c.y-30, zIndex:99990}}>⚑</div>; })()}
        {!enemyCleared && (()=>{ const p=level.poi.enemy; const c=hexCenter(p.c,p.r);
          return <img src={ART.janjicar} className="mk-enemy-tok" alt=""
            style={{left:c.x, top:c.y, width:40, zIndex:Math.round(c.y)+2}} draggable="false"/>; })()}
        {chasers.map(ch=>{ const c=hexCenter(ch.c,ch.r);
          return <img key={ch.id} src={ART.janjicar} className="mk-enemy-tok chaser" alt=""
            style={{left:c.x, top:c.y, width:36, zIndex:Math.round(c.y)+2}} draggable="false"/>; })}
        <img src={ART.marko} alt="Marko" className={`mk-marko-tok ${moving?'walk':''}`}
          style={{ left: tokenXY.x, top: tokenXY.y, zIndex:Math.round(tokenXY.y)+6 }} draggable="false"/>
        {toast && <div className="mk-toast" onAnimationEnd={()=>setToast(null)}>
          {/ralo/i.test(toast) && ART.icon && <span className="mk-toast-ico" style={{backgroundImage:`url(${ART.icon.ralo})`}}/>}
          <span>{T(toast)}</span>
        </div>}
      </div>

      <MapPanel state={state} dispatch={dispatch} onEndTurn={endTurn}/>

      {/* ——— OUTRO: Marko predaje blago majci (kraj prve pesme) ——— */}
      {outro && <div className="mk-result-backdrop">
        <div className="mk-result" style={{width:620}}>
          <div className="mk-eyebrow">{T('KRAJ PRVE PESME · ORANJE MARKA KRALJEVIĆA')}</div>
          <h2 className="win" style={{fontSize:32,marginTop:6}}>{T('Nivo završen')}</h2>
          <Divider/>
          <div className="mk-dijalog" style={{alignItems:'center',textAlign:'left',margin:'4px 0 10px'}}>
            <Portrait src={ART.portret_jevrosima} size={80}/>
            <div>
              <div className="mk-dijalog-ime">{T('Marko — staroj majci Jevrosimi')}</div>
              <p className="mk-dijalog-rec">{T('„Evo ti, majko, tri tovara blaga. To sam za tebe danas izorao!“')}</p>
            </div>
          </div>
          <p className="mk-muted" style={{fontSize:15,marginBottom:6}}>
            {T('Marko spušta pred majku oteto blago')}: <b style={{color:'var(--gold-bright)'}}>{state.resources.dukati} {T(CURRENCY.dukat.mn)}</b> {T('i')} <b style={{color:'var(--silver-bright)'}}>{state.resources.dinari} {T(CURRENCY.dinar.mn)}</b>.
          </p>
          <Btn variant="confirm" size="lg" onClick={()=>dispatch({type:'LEVEL_COMPLETE'})}>{T('Nastavi u dvor')} ▸</Btn>
        </div>
      </div>}
    </div>
  );
}

function MapPanel({ state, dispatch, onEndTurn }){
  const { ART, COMPANIONS, LEVELS, CURRENCY } = window.MK;
  const m=state.marko;
  const carry = state.map.carry || {};
  const zadaci = LEVELS[state.level].zadaci || [];
  const doneMap = { ralo:carry.ralo, blago:carry.blago, dinari:carry.dinari, povratak:false };
  const activeId = !carry.ralo?'ralo':!carry.blago?'blago':!carry.dinari?'dinari':'povratak';
  const chasing = (state.map.chasers||[]).length;
  return (
    <div className="mk-map-panel mk-panelframe">
      <div className="mk-mp-head">
        <Portrait src={ART.portret_marko} size={64}/>
        <div>
          <div className="mk-hub-name" style={{fontSize:18}}>{T('Marko')}</div>
          <HPBar cur={m.hp} max={mkEff(state,'maxHp')} h={12}/>
        </div>
      </div>
      <div className="mk-mp-stats">
        <StatRow icon="atk" label="Napad" value={mkEff(state,'atk')}/>
        <StatRow icon="def" label="Odbrana" value={mkEff(state,'def')}/>
        <StatRow icon="znanje" label="Znanje" value={mkEff(state,'znanje')}/>
      </div>
      <Divider mt={6} mb={6}/>
      <div className="mk-reschips">
        <ResChip icon="dinar" value={state.resources.dinari} title={CURRENCY.dinar.ime+' — '+CURRENCY.dinar.opis} color="var(--silver-bright)"/>
        <ResChip icon="dukat" value={state.resources.dukati} title={CURRENCY.dukat.ime+' — '+CURRENCY.dukat.opis} color="var(--gold-bright)"/>
        <ResChip icon="hrana" value={state.resources.hrana} title="Hrana"/>
        <ResChip icon="znres" value={state.resources.znanjeRes} title="Znanje"/>
      </div>
      <Divider mt={6} mb={6}/>
      <div className="mk-mp-label">{T('Zadaci')}</div>
      <div className="mk-zadaci">
        {zadaci.map(z=>{ const done=doneMap[z.id]; const act=z.id===activeId && !done;
          return <div key={z.id} className={`mk-zadatak ${done?'done':''} ${act?'active':''}`}>
            <span className="mk-zad-box">{done?'✓':(act?'▸':'')}</span>
            <span>{T(z.tekst)}</span></div>; })}
      </div>
      {chasing>0 && <div className="mk-chase-warn">⚠ {T(chasing===1?'Goni te':'Gone te')} {chasing} {T(chasing===1?'neprijatelj!':'neprijatelja!')}</div>}
      <Divider mt={6} mb={6}/>
      <div className="mk-mp-day">
        <span>{T('Dan')} {state.map.day}</span>
        <span>{T('Kretanje')}: {state.map.moveLeft} ⬢</span>
      </div>
      <Btn variant="primary" size="md" style={{width:'100%',marginTop:8}}
        onClick={onEndTurn}>{T('Završi potez')}</Btn>
      <Btn variant="ghost" size="sm" style={{width:'100%',marginTop:6}}
        onClick={()=>dispatch({type:'SCENE', scene:'hero'})}>{T('Heroj i veštine')}</Btn>
    </div>
  );
}

Object.assign(window, { HexMap });
