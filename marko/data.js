/* =====================================================================
   Kraljević Marko: Epska Saga — IGRAĆI PODACI (data layer)
   Sve konstante su izdvojene ovde da se igra lako proširi na 16 nivoa.
   Da dodaš nivo: dodaj unos u LEVELS + pitanja u QUESTIONS[id].
   Da dodaš saputnika: dodaj u COMPANIONS. Da dodaš veštinu: SKILL_TREE.
   ===================================================================== */

/* ---- Putanje do asseta ---- */
const ART = {
  bg_hub: 'uploads/backgrounds/markov_dvor.png',
  bg_map: 'uploads/backgrounds/oranje_polje.png',
  frame_dialog: 'uploads/ui/dialog_frame.png',
  frame_panel: 'uploads/ui/panel_frame.png',
  marko: 'assets/marko_mladi_cut.png',
  janjicar: 'assets/janjicar_cut.png',
  sarac: 'assets/sarac_cut.png',
  jevrosima: 'assets/jevrosima_cut.png',
  mustafaga: 'marko/art/mustafaga.png',
  portret_marko: 'uploads/sprites/portraits/marko_portret_256.png',
  portret_jevrosima: 'uploads/sprites/portraits/jevrosima_portret_256.png',
  tile: {
    polje:   'marko/art/polje.png',
    polje2:  'marko/art/polje_v2.png',
    oranje:  'marko/art/oranica.png',
    voda:    'marko/art/voda.png',
    obala:   'marko/art/obala.png',
    stene:   'marko/art/stene.png',
    drum:    'marko/art/drum_prav.png',
    drum_krivina: 'marko/art/drum_krivina.png',
    drum_most:    'marko/art/drum_most.png',
    trava_suma:  'marko/art/trava_suma.png',
    trava_stene: 'marko/art/trava_stene.png',
  },
  obj: {
    dvor:    'marko/art/dvor.png',
    stala:   'marko/art/stala.png',
    manastir:'marko/art/manastir.png',
    crkva:   'marko/art/crkva.png',
    kovacnica:'marko/art/kovacnica.png',
    mlin:    'marko/art/mlin.png',
    selo:    'marko/art/selo.png',
    hrast:   'marko/art/drvo_hrast.png',
    hrast2:  'marko/art/drvo_hrast_v2.png',
    bukva:   'marko/art/drvo_bukva.png',
    bor:     'marko/art/drvo_bor.png',
    jela:    'marko/art/drvo_jela_snezna.png',
    drvece:  'marko/art/drvece_grupa.png',
    grm:     'marko/art/grm.png',
    kamen:   'marko/art/kamen_grupa.png',
    kamen1:  'marko/art/kamen_mossy.png',
  },
  // Ikone oružja/oruđa (medaljoni) — borba + notifikacije
  icon: {
    buzdovan: 'marko/art/icons/buzdovan.png',
    sablja:   'marko/art/icons/sablja.png',
    ralo:     'marko/art/icons/ralo.png',
  },
};

/* ---- Tereni ---- */
const TERRAIN = {
  P: { key: 'polje',   ime: 'Polje',   cena: 1,    prolazno: true },
  O: { key: 'oranje',  ime: 'Oranje',  cena: 1,    prolazno: true },
  D: { key: 'drum',    ime: 'Carev drum', cena: 1, prolazno: true },
  S: { key: 'suma',    ime: 'Šuma',    cena: 2,    prolazno: true },
  M: { key: 'planina', ime: 'Planina', cena: 99,   prolazno: false },
  V: { key: 'voda',    ime: 'Voda',    cena: 99,   prolazno: false },
};

/* ---- Valute (istorijski, 1371) ----
   Srbija 1371. kuje ISKLJUČIVO srebrne dinare (zlato povučeno iz opticaja).
   Za velike transakcije koristi se mletački zlatnik (zecchino/dukat). */
const CURRENCY = {
  dinar: { ime:'Srebrni dinar', mn:'srebrnih dinara', boja:'silver', ikona:'dinar',
    opis:'Domaći srpski novac (1371): ručno kovan, srebro ≈1.10 g, ⌀≈20 mm. Avers: vladar s kupolastom krunom na prestolu sa skiptrom; revers: dvoglavi orao ili Hristos na prestolu.' },
  dukat: { ime:'Mletački dukat', mn:'mletačkih dukata', boja:'gold', ikona:'dukat',
    opis:'Venecijanski zlatnik (zecchino) — koristi se za velike transakcije. Zlato je u srpskoj državi povučeno iz opticaja, pa je dukat „uvozni" novac visoke vrednosti.' },
};

/* ---- Početne vrednosti Marka ---- */
const MARKO_START = { hp: 50, maxHp: 50, atk: 10, def: 10, znanje: 5, level: 1, xp: 0 };

/* ---- Skill tree: 5 grana × 3 veštine (prikazujemo bar 3 grane) ---- */
const SKILL_TREE = [
  { grana: 'SNAGA', ikona: 'mace', vestine: [
    { id: 'buzdovan',  ime: 'Buzdovan-udar', opis: 'Teški napad, +5 štete.', cena: 0, pocetna: true },
    { id: 'udar66',    ime: 'Udar od 66 oka', opis: 'Ekstra-težak napad uz teško pitanje; ako pogodiš +20 štete.', cena: 3 },
    { id: 'tritovara', ime: 'Tri tovara', opis: 'Ako nosiš tri tovara blaga: +10 Napad do kraja borbe.', cena: 0 },
  ]},
  { grana: 'OŠTRINA', ikona: 'sword', vestine: [
    { id: 'sablja',    ime: 'Sablja-rez', opis: 'Brz napad, +3 štete; +5 ako si već 3 puta tačno odgovorio.', cena: 0, pocetna: true },
    { id: 'osveta',    ime: 'Vukašinova osveta', opis: 'Sa Vukašinovom sabljom protiv Turaka: +50% štete.', cena: 2 },
    { id: 'nozpotaja', ime: 'Nož iz potaje', opis: 'Jednom po borbi: lako pitanje, tačan odgovor = kritičan udar.', cena: 5 },
  ]},
  { grana: 'POBOŽNOST', ikona: 'cross', vestine: [
    { id: 'pricest',   ime: 'Pričest', opis: 'Vraća +30 Zdravlje, jednom po nivou (u manastiru).', cena: 1 },
    { id: 'otpor',     ime: 'Otpor demonima', opis: '-50% štete od vila i nadnaravnih bića.', cena: 3 },
    { id: 'vila',      ime: 'Doziv vile posestrime', opis: 'Jednom po borbi: vila otkriva tačan odgovor.', cena: 4 },
  ]},
];

/* ---- Saputnici ---- */
const COMPANIONS = {
  jevrosima: { id:'jevrosima', ime:'Jevrosima', uloga:'Majka', art:'jevrosima', portret:'portret_jevrosima',
    bonus:{ maxHp:5, znanje:1 }, bonusTekst:'+5 Zdravlje, +1 Znanje',
    akcija:{ id:'kletva', ime:'Majčina kletva', opis:'Protivnik gubi sledeći napad.' } },
  // primeri otključavih saputnika (za kasnije nivoe)
  relja: { id:'relja', ime:'Relja Krilatica', uloga:'Pobratim', art:null, portret:null,
    bonus:{ atk:3 }, bonusTekst:'+3 Napad',
    akcija:{ id:'galop', ime:'Krilatic galop', opis:'Marko pređe 3 heksa odjednom.' } },
  milos: { id:'milos', ime:'Miloš Obilić', uloga:'Pobratim', art:null, portret:null,
    bonus:{ def:3 }, bonusTekst:'+3 Odbrana',
    akcija:{ id:'pesma', ime:'Pesma', opis:'Sledeće pitanje ide kao lako.' } },
};

/* ---- Oprema ---- */
const EQUIPMENT = {
  weapon: [
    { id:'drveni', ime:'Drveni buzdovan', opis:'Početno oružje.', mod:{} },
    { id:'sablja_v', ime:'Vukašinova sablja', opis:'+ATK protiv Turaka.', mod:{atk:3}, zakljucan:true },
  ],
  armor: [
    { id:'dolama', ime:'Zelena dolama', opis:'Lagana, pokretljiva.', mod:{} },
    { id:'azdija', ime:'Kolasta azdija', opis:'+DEF, aura zaštite.', mod:{def:3}, zakljucan:true },
  ],
  kalpak: [
    { id:'samur', ime:'Samur-kalpak', opis:'Pogled koji obamiruje.', mod:{} },
  ],
  mount: [
    { id:'sarac', ime:'Šarac', opis:'Vidoviti konj — uvek uz Marka.', mod:{} },
  ],
};

/* ---- Neprijatelji ---- */
const ENEMIES = {
  janjicar: { id:'janjicar', ime:'Turčin janjičar', art:'janjicar', hp:30, maxHp:30, atk:8, def:4, nivo:1 },
  gonic:    { id:'gonic', ime:'Janjičar gonič', art:'janjicar', hp:24, maxHp:24, atk:10, def:3, nivo:1 },
  straza:   { id:'straza', ime:'Mustaf-agina straža', art:'janjicar', hp:30, maxHp:30, atk:9, def:4, nivo:2 },
  mustafaga:{ id:'mustafaga', ime:'Mustaf-aga', art:'mustafaga', hp:48, maxHp:48, atk:11, def:6, nivo:2 },
};

/* ---- Level-up izbori ---- */
const LEVELUP_CHOICES = [
  { id:'hp',   ime:'+15 Zdravlje',  opis:'Markovo telo ojača.',        apply:m=>({maxHp:m.maxHp+15, hp:m.hp+15}) },
  { id:'atk',  ime:'+3 Napad',   opis:'Teži je udarac buzdovana.',  apply:m=>({atk:m.atk+3}) },
  { id:'def',  ime:'+3 Odbrana', opis:'Čvršće drži štit.',          apply:m=>({def:m.def+3}) },
  { id:'zna',  ime:'+2 Znanje',  opis:'Više vremena za odgovor.',   apply:m=>({znanje:m.znanje+2}) },
];

/* ---- Epske akcije u borbi ---- */
const ACTIONS = [
  { id:'buzdovan', ime:'Buzdovan-udar', power:5, opis:'Teški udar buzdovanom.' },
  { id:'sablja',   ime:'Sablja-rez',    power:3, opis:'Brz rez sabljom (+5 ako 3× tačno).' },
  { id:'ralo',     ime:'Ralo i volovi', power:8, opis:'Oruđe za oranje postaje oružje — najjači udar uz teško pitanje. (Dok nosiš ralo.)' },
  { id:'doziv',    ime:'Doziv saputnika', power:0, opis:'Aktiviraj veštinu saputnika.' },
];

/* ---- Pitanja po nivoima (Nivo 1 — Oranje Marka Kraljevića) ---- */
const QUESTIONS = {
  1: [
    { id:'q01', tezina:'lako', pitanje:'Ko moli Marka da ostavi četovanje?',
      opcije:['Jela','Jevrosima','Vila Ravijojla','Sibinjanin Janko'], tacan:1,
      obrazlozenje:'Markova majka Jevrosima. Pesma počinje: „Vino pije Kraljeviću Marko sa staricom Jevrosimom majkom...“' },
    { id:'q02', tezina:'lako', pitanje:'Šta Marko uzima umesto sablje i koplja?',
      opcije:['Mač i štit','Ralo i volove','Knjigu i pero','Luk i strele'], tacan:1,
      obrazlozenje:'„Već ti uzmi ralo i volove, pak ti ori brda i doline.“ — majčin savet.' },
    { id:'q03', tezina:'lako', pitanje:'Šta Marko zapravo ore?',
      opcije:['Brda i doline','Vinograde','Careve drumove','Reke'], tacan:2,
      obrazlozenje:'„Al ne ore brda i doline, već on ore careve drumove“ — prkosno ironično „sluša“ majku.' },
    { id:'q04', tezina:'lako', pitanje:'Koliko tovara blaga nose janjičari?',
      opcije:['Jedan','Dva','Tri','Sedam'], tacan:2,
      obrazlozenje:'„Kod mene su tri ćemera blaga, u svakome po trista dukata." Tri ćemera × 300 = 900 mletačkih dukata (zlatnika); Marko ih sve uzima i odnosi majci.' },
    { id:'q05', tezina:'lako', pitanje:'Kome Marko donosi blago na kraju pesme?',
      opcije:['Caru','Majci','Crkvi','Bratstvu'], tacan:1,
      obrazlozenje:'„Odnese ih svojoj staroj majci: To sam tebe danas izorao.“' },
    { id:'q06', tezina:'srednje', pitanje:'Zbog čega se majci dosadilo da Marko četuje?',
      opcije:['Boji se gladi','Umorila se perući krvave haljine','Otac je tako naredio','Sneg je pao'], tacan:1,
      obrazlozenje:'„A staroj se dosadilo majci sve perući krvave haljine.“' },
    { id:'q07', tezina:'srednje', pitanje:'Šta majka traži da Marko sije?',
      opcije:['Kukuruz','Šenicu belicu','Šljive','Loze'], tacan:1,
      obrazlozenje:'„Te sij, sinko, šenicu bjelicu, te ti hrani i mene i sebe.“' },
    { id:'q08', tezina:'srednje', pitanje:'Kojom rečenicom majka argumentuje protiv četovanja?',
      opcije:['„Zlo dobra donijeti neće“','„Carstvo te traži“','„Lazar te poziva“','„Smrt te čeka“'], tacan:0,
      obrazlozenje:'„Jer zlo dobra donijeti neće“ — majčina mudrost o ciklusu nasilja.' },
    { id:'q09', tezina:'srednje', pitanje:'Šta janjičari prvi viknu Marku kad ga vide?',
      opcije:['„Predaj se“','„More Marko, ne ori drumova!“','„Smrt Marku“','„Bog ti pomoć“'], tacan:1,
      obrazlozenje:'„More Marko, ne ori drumova!“ Marko uzvraća: „More Turci, ne gaz’te oranja!“' },
    { id:'q10', tezina:'srednje', pitanje:'Šta Marko kaže majci kad joj donese tri tovara blaga?',
      opcije:['„Evo darova“','„Carev sam plen uzeo“','„To sam tebe danas izorao“','„Vrati ralo“'], tacan:2,
      obrazlozenje:'Ironični ključ pesme: „To sam tebe danas izorao.“' },
    { id:'q11', tezina:'tesko', pitanje:'Kojim oružjem Marko zapravo pobije janjičare?',
      opcije:['Sabljom','Buzdovanom','Ralom i volovima','Kopljem'], tacan:2,
      obrazlozenje:'„Diže Marko ralo i volove, te on pobi Turke janjičare.“ Alat majčinog saveta postaje oružje.' },
    { id:'q12', tezina:'tesko', pitanje:'Koliko puta janjičari ponove pretnju pre nego što ih Marko napadne?',
      opcije:['Jednom','Dva puta','Tri puta','Sedam puta'], tacan:1,
      obrazlozenje:'Sukob se ponavlja dva puta; posle drugog ponavljanja Marku dosadi.' },
    { id:'q13', tezina:'lako', pitanje:'Šta Marko pije na početku pesme?',
      opcije:['Vodu','Vino','Rakiju','Mleko'], tacan:1,
      obrazlozenje:'„Vino pije Kraljeviću Marko sa staricom Jevrosimom majkom.“ — uvodni stih.' },
    { id:'q14', tezina:'lako', pitanje:'Ko su Markovi protivnici na carevu drumu?',
      opcije:['Ugri','Turci janjičari','Mlečani','Grci'], tacan:1,
      obrazlozenje:'Naiđu turski janjičari noseći tri tovara carskog blaga.' },
    { id:'q15', tezina:'srednje', pitanje:'Šta znači reč „četovanje“ u pesmi?',
      opcije:['Oranje njiva','Odlazak u četu — ratovanje i pljačka','Lov u gori','Trgovina po gradovima'], tacan:1,
      obrazlozenje:'Četovati znači ići u četu, ratovati i pleniti; majka baš to želi da Marko ostavi.' },
    { id:'q16', tezina:'srednje', pitanje:'Šta majka želi da Marko ostavi?',
      opcije:['Konja Šarca','Oružje i ratovanje','Dvor i majku','Vino'], tacan:1,
      obrazlozenje:'Majka traži da ostavi sablju, koplje i četovanje, pa da uzme ralo i ore.' },
    { id:'q17', tezina:'srednje', pitanje:'Čime Marko na kraju zaista „prehrani“ majku?',
      opcije:['Šenicom belicom','Otetim carskim blagom','Ulovljenom divljači','Ribom iz reke'], tacan:1,
      obrazlozenje:'Umesto žita s njive, donosi tri tovara turskog (carskog) blaga — ironičan obrt.' },
    { id:'q18', tezina:'tesko', pitanje:'U čemu je ironija stiha „To sam tebe danas izorao“?',
      opcije:['Marko nije uradio ništa','Nije izorao njivu, već pobio Turke i doneo blago — „oranje“ je borba','Majka ga ne razume','Marko se šali o vremenu'], tacan:1,
      obrazlozenje:'Marko „posluša“ majku samo na rečima: alat za oranje postaje oružje, a plen — hrana.' },
    { id:'q19', tezina:'tesko', pitanje:'Šta označava uvodni stih „Il’ je bilo ili nije bilo...“?',
      opcije:['Da je priča izmišljena i lažna','Epsku formulu — predanje „za koje ljudi vele da je od istine“','Da se radnja dešava noću','Da Marko sanja'], tacan:1,
      obrazlozenje:'Tradicionalna epska/bajkovita ograda: označava legendu koju narod prenosi kao istinitu.' },
    { id:'q20', tezina:'srednje', pitanje:'Kako je Marko prikazan u ovoj pesmi?',
      opcije:['Kao kukavica i lenjivac','Prkosan i snažan, odan majci ali nepokoran','Kao bogat trgovac','Tih i potpuno pokoran'], tacan:1,
      obrazlozenje:'Marko poštuje majku, ali rešava silom i prkosom — tipičan epski junak protivrečne naravi.' },
  ],
  2: [
    { id:'q01', tezina:'lako', pitanje:'Ko rano izlazi da beli platno na Marici?',
      opcije:['Markova majka','Turkinja đevojka','Vila','Carica'], tacan:1,
      obrazlozenje:'„Rano rani Turkinja đevojka… na Maricu bijeliti platno.“' },
    { id:'q02', tezina:'lako', pitanje:'Šta se desilo s vodom Marice „od sunca“?',
      opcije:['Presušila je','Zamutila se i postala krvava','Smrzla se','Postala bistra'], tacan:1,
      obrazlozenje:'„Od sunca se voda zamutila, udarila mutna i krvava.“ — posle bitke na Marici.' },
    { id:'q03', tezina:'lako', pitanje:'Šta voda Marica nosi niz maticu?',
      opcije:['Cveće i granje','Konje, kalpake i ranjene junake','Lađe','Ribu'], tacan:1,
      obrazlozenje:'„Pa pronosi konje i kalpake, ispred podne ranjene junake.“' },
    { id:'q04', tezina:'lako', pitanje:'Kako ranjeni junak oslovljava devojku?',
      opcije:['„Gospo“','„Bogom sestro“','„Carice“','„Majko“'], tacan:1,
      obrazlozenje:'„Bogom sestro, lijepa đevojko, izvadi me iz vode Marice.“' },
    { id:'q05', tezina:'srednje', pitanje:'Koliko rana ima na junaku?',
      opcije:['Tri','Sedam','Sedamnaest','Sto'], tacan:2,
      obrazlozenje:'„Na junaku rana sedamnaest.“' },
    { id:'q06', tezina:'srednje', pitanje:'Šta je posebno na junakovoj sablji?',
      opcije:['Srebrne kanije','Tri zlatna balčaka i tri draga kamena','Natpis na arapskom','Drveni balčak'], tacan:1,
      obrazlozenje:'„Na sablji su tri balčaka zlatna, u balčacim’ tri kamena draga.“' },
    { id:'q07', tezina:'srednje', pitanje:'Kolika je vrednost te sablje?',
      opcije:['Jedan grad','Tri careva grada','Sto dukata','Jedno selo'], tacan:1,
      obrazlozenje:'„Valja sablja tri careva grada!“ — simbol kraljevskog dostojanstva.' },
    { id:'q08', tezina:'srednje', pitanje:'Ko ubije ranjenog junaka i zbog čega?',
      opcije:['Devojka, iz straha','Mustaf-aga, zbog sablje','Car, zbog izdaje','Niko, junak preživi'], tacan:1,
      obrazlozenje:'Mustaf-aga, devojčin brat, vidi skupocenu sablju i odseče junaku glavu da je uzme.' },
    { id:'q09', tezina:'srednje', pitanje:'Šta sestra uradi bratu posle ubistva?',
      opcije:['Nagradi ga','Prokune ga','Sakrije sablju','Ode caru'], tacan:1,
      obrazlozenje:'Sestra ga kune zbog nedela nad nemoćnim ranjenikom.' },
    { id:'q10', tezina:'srednje', pitanje:'Šta poziva Mustaf-agu na carevu vojsku?',
      opcije:['Glas o Marku','Ferman (zapovest) od cara','San','Pismo sestre'], tacan:1,
      obrazlozenje:'„Dođe ferman od cara turskoga Mustaf-agi, da ide na vojsku.“' },
    { id:'q11', tezina:'srednje', pitanje:'Šta niko ne može da uradi sa sabljom na smotri?',
      opcije:['Da je proda','Da je izvadi iz korica','Da je očisti','Da je podigne'], tacan:1,
      obrazlozenje:'Sablju niko ne može izvaditi — a Marku se sama izvadi iz korica.' },
    { id:'q12', tezina:'tesko', pitanje:'Koja tri imena Marko prepoznaje urezana na sablji?',
      opcije:['Lazar, Miloš, Marko','Novak kovač, Vukašin kralj, Kraljević Marko','Uroš, Vukašin, Andrijaš','Murat, Bajazit, Marko'], tacan:1,
      obrazlozenje:'Tri slova/imena: Novak kovač (kovač), Vukašin kralj (otac), Kraljević Marko — sablja kao rodoslov.' },
    { id:'q13', tezina:'tesko', pitanje:'Čija je sablja zapravo?',
      opcije:['Carska','Markovog oca, kralja Vukašina','Miloševa','Ničija — nova je'], tacan:1,
      obrazlozenje:'„Poznao sam sablju baba moga.“ — sablja kralja Vukašina, poginulog na Marici.' },
    { id:'q14', tezina:'srednje', pitanje:'Šta Marko uradi Mustaf-agi kad sazna istinu?',
      opcije:['Oprosti mu','Odseče mu glavu','Protera ga','Uzme mu blago'], tacan:1,
      obrazlozenje:'Marko osveti oca i pogubi Mustaf-agu.' },
    { id:'q15', tezina:'srednje', pitanje:'Kako car (poočim) umiri Marka posle osvete?',
      opcije:['Kazni ga','Daruje mu sto dukata','Protera ga iz vojske','Oduzme mu sablju'], tacan:1,
      obrazlozenje:'„Car ga umiri stotinom dukata.“ — odnos vazala i gospodara.' },
    { id:'q16', tezina:'lako', pitanje:'Kako Marko oslovljava turskog cara?',
      opcije:['„Gospodaru“','„Care poočime“','„Sultane“','„Brate“'], tacan:1,
      obrazlozenje:'„Ne pitaj me, care poočime!“ — Marko je, posle Marice, carev vazal („poočim“).' },
    { id:'q17', tezina:'tesko', pitanje:'U kojoj bici je poginuo Vukašin, neposredno pre ove pesme?',
      opcije:['Na Kosovu (1389)','Na Marici (1371)','Na Rovinama (1395)','Na Velbuždu (1330)'], tacan:1,
      obrazlozenje:'Maričko poraz 1371: ginu Vukašin i brat Uglješa; Marko postaje turski vazal.' },
    { id:'q18', tezina:'tesko', pitanje:'Šta sablja simbolično predstavlja u pesmi?',
      opcije:['Običan plen','Genealoški dokument — dokaz porekla, gde krv otkriva istinu','Magični predmet','Carski dar'], tacan:1,
      obrazlozenje:'Urezana imena triju generacija čine sablju „dokumentom“ — Marko kroz predmet otkriva istinu.' },
    { id:'q19', tezina:'srednje', pitanje:'Šta junak nudi devojci da ga prenese do dvora?',
      opcije:['Sablju','Tri ćemera blaga (dukata)','Konja','Prsten'], tacan:1,
      obrazlozenje:'Ranjenik obećava tri ćemera blaga onome ko ga spasi i prenese.' },
    { id:'q20', tezina:'srednje', pitanje:'Čime Marko prekoreva Mustaf-agu pre nego što ga pogubi?',
      opcije:['Što je pobegao iz boja','Što nije izvidao rane ranjeniku, nego ga ubio','Što je lagao cara','Što je ukrao konja'], tacan:1,
      obrazlozenje:'„Zašto, Ture… nijesi mu rane izvidao?“ — umesto da pomogne ranjeniku, ubio ga je zbog sablje.' },
  ],
};

/* ---- Definicija nivoa (mapa + narativ) ---- */
const LEVELS = {
  1: {
    naslov: 'NIVO 1 — ORANJE MARKA KRALJEVIĆA',
    citat: '„Il’ je bilo ili nije bilo, ljudi vele da je od istine.“',
    stih: 'Vino pije Kraljeviću Marko\nsa staricom Jevrosimom majkom...',
    majka: {
      rec:'„O moj sinko, Kraljeviću Marko, ostavi se, sinko, četovanja, jer zlo dobra donijeti neće. Već ti uzmi ralo i volove, pak ori brda i doline.“',
      savet:'Savet: Uzmi ralo i volove kod štale, pa njime obori janjičara na drumu — u njegovom blagu je tvoja nagrada.' },
    // ——— Kontinualni teren: generiše se iz REGIONA (genTerrain u screens_map) ———
    grid: { cols:30, rows:19 },
    terrain: {
      mountRing: 1,
      lake: { cx:22.5, cy:7, rx:3.9, ry:3.2 },
      forests: [ {cx:6,cy:6,r:3.6}, {cx:5,cy:13,r:3.9}, {cx:9.5,cy:16,r:2.8}, {cx:24,cy:14,r:2.6} ],
      fields:  [ {cx:13,cy:3,r:1.7} ],
    },
    // Carev drum — putni čvorovi (cell koordinate), crta se kao tekuća staza
    road: [ {c:16,r:1},{c:16,r:4},{c:15,r:7},{c:16,r:10},{c:15,r:13},{c:16,r:17} ],
    // Tačke interesa: {col,row}
    poi: {
      start: { c:16, r:1, tip:'dvor', building:'dvor' },
      cilj:  { c:13, r:4, tip:'cilj', building:'stala', opisano:'Štala kraj dvora — ralo i volovi za oranje.' },
      enemy: { c:15, r:7, tip:'enemy', enemy:'janjicar', opisano:'Turski janjičar sa tovarima blaga preprečuje carev drum.' },
      blago: { c:6, r:9, tip:'blago', dinari:200, hrana:5, opisano:'Škrinja sa srebrnim dinarima kraj puta.' },
    },
    // Dva goniča se pojave kad Marko obori janjičara i uzme blago — krenu u poteru
    chaserSpawns: [ {c:17,r:8}, {c:13,r:8} ],
    // ——— Deklarativni ciljevi (engine ih izvršava; `gate` = preduslovni ciljevi) ———
    // kind: pickup | collect | battle | return.  Iste „cigle" se koriste za sve nivoe.
    objectives: [
      { id:'ralo',  poi:'cilj',  kind:'pickup',
        label:'Uzmi ralo i volove kod štale', icon:'ralo',
        toast:'Uze ralo i volove! Sad ralom navali na janjičara na drumu.' },
      { id:'blago', poi:'enemy', kind:'battle', enemy:'janjicar',
        label:'Ralom obori janjičara na drumu i uzmi blago',
        gate:['ralo'], gateToast:'Prvo uzmi ralo i volove kod štale — njime ćeš oboriti janjičara.',
        winText:'Marko pobi janjičara ralom i volovima. Tri ćemera blaga — 900 mletačkih dukata (zlatnika) — i 20 XP. (Srbija 1371. kuje srebrni dinar; zlato je mletačko, za velike transakcije.)' },
      { id:'dinari', poi:'blago', kind:'collect',
        label:'Pokupi srebrne dinare iz škrinje',
        gate:['blago'], gateToast:'Prvo obori janjičara na drumu i uzmi blago, pa onda po dinare.',
        reward:{ dinari:200, hrana:5 }, toast:'Škrinja! +200 srebrnih dinara, +5 hrane.' },
      { id:'povratak', poi:'start', kind:'return', outro:true,
        label:'Vrati se u dvor i predaj blago majci',
        gate:['ralo','blago','dinari'],
        gateToast:'Vrati se u dvor tek kad skupiš ralo, blago janjičara i dinare.' },
    ],
    // Poternja: koji cilj je „okida" (spawnOn), kad su goniči aktivni (activeAfter), brzina (step)
    pursuit: { enemy:'gonic', spawnOn:'blago', activeAfter:'blago', step:3 },
    outro: {
      eyebrow:'KRAJ PRVE PESME · ORANJE MARKA KRALJEVIĆA', title:'Nivo završen',
      portrait:'portret_jevrosima', speaker:'Marko — staroj majci Jevrosimi',
      line:'„Evo ti, majko, tri tovara blaga. To sam za tebe danas izorao!“',
      summary:'Marko spušta pred majku oteto blago — tri ćemera mletačkih dukata i srebrne dinare s puta.' },
  },

  2: {
    naslov: 'NIVO 2 — MARKO POZNAJE OČINU SABLJU',
    citat: '„Poznao sam sablju baba moga.“',
    stih: 'Rano rani Turkinja đevojka\nna Maricu bijeliti platno...',
    majka: {
      rec:'„Idi, sinko, u carevu vojsku kad moraš — ali pamti čiji si sin. Tuđa sablja katkad krije svoju istinu.“',
      savet:'Savet: Na carevoj smotri preuzmi sablju i pročitaj tri imena u balčaku; razbij Mustaf-aginu stražu, pa izađi na mejdan i osveti oca.' },
    grid: { cols:30, rows:19 },
    terrain: {
      mountRing: 1,
      lake: { cx:15, cy:2.2, rx:13, ry:1.9 },        // reka Marica — krvava voda, pojas uz gornju ivicu
      forests: [ {cx:5,cy:13,r:3.2}, {cx:25,cy:14,r:3.0} ],
      fields:  [ {cx:16,cy:9,r:2.4} ],               // izgaženo bojište / vojni logor
    },
    road: [ {c:16,r:17},{c:16,r:13},{c:15,r:12},{c:14,r:9},{c:15,r:6} ],
    poi: {
      start:  { c:16, r:17, tip:'start',  building:'selo', opisano:'Markov logor u carevoj vojsci.' },
      divan:  { c:15, r:12, tip:'divan',  building:'dvor', opisano:'Carev divan — smotra i sablja.' },
      straza: { c:13, r:9,  tip:'straza', enemy:'straza',    opisano:'Mustaf-agina lična straža.' },
      mejdan: { c:15, r:6,  tip:'mejdan', enemy:'mustafaga', opisano:'Mejdan na obali Marice.' },
    },
    objectives: [
      { id:'sablja', poi:'divan', kind:'pickup', icon:'sablja',
        label:'Preuzmi sablju na carevoj smotri',
        toast:'Sablja se sama izvadi Marku iz korica! Tri slova: Novak kovač, Vukašin kralj, Kraljević Marko — očeva je.' },
      { id:'straza', poi:'straza', kind:'battle', enemy:'straza',
        label:'Probij se kroz Mustaf-aginu stražu', gate:['sablja'],
        gateToast:'Prvo preuzmi sablju na smotri, pa onda na Mustaf-agu.',
        winText:'Marko razbi Mustaf-aginu stražu i raščisti put do mejdana.' },
      { id:'mejdan', poi:'mejdan', kind:'battle', enemy:'mustafaga', unlock:'sablja_v',
        label:'Mejdan sa Mustaf-agom — osveti oca', gate:['straza'],
        gateToast:'Prvo razbij Mustaf-aginu stražu.',
        winText:'Marko prepozna očevu sablju i osveti kralja Vukašina — Mustaf-agi pade glava! Vukašinova sablja je sad Markova.' },
      { id:'caru', poi:'divan', kind:'return', outro:true,
        label:'Vrati se pred cara poočima', gate:['sablja','straza','mejdan'],
        gateToast:'Vrati se pred cara tek kad osvetiš oca.' },
    ],
    outro: {
      eyebrow:'KRAJ DRUGE PESME · MARKO POZNAJE OČINU SABLJU', title:'Nivo završen',
      portrait:'portret_marko', speaker:'Marko — caru poočimu',
      line:'„Ne pitaj me, care poočime! Poznao sam sablju baba moga.“',
      summary:'Osvećen je kralj Vukašin. Car umiri Marka stotinom dukata, a očeva sablja — sa tri zlatna balčaka — sad visi o Markovu bedru.' },
  },
};

/* ---- Nagrada janjičara (tri ćemera × 300 dukata) ---- */
ENEMIES.janjicar.nagrada = { dukati:900, hrana:3 };
ENEMIES.gonic.nagrada = { dukati:150, hrana:1 };
ENEMIES.straza.nagrada = { dukati:60, hrana:2 };
ENEMIES.mustafaga.nagrada = { dukati:100, hrana:3 };   // car ga umiri stotinom dukata

window.MK = { ART, TERRAIN, CURRENCY, MARKO_START, SKILL_TREE, COMPANIONS, EQUIPMENT,
  ENEMIES, LEVELUP_CHOICES, ACTIONS, QUESTIONS, LEVELS };
