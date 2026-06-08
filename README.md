# Kraljević Marko: Epska Saga — Nivo 1

Web RPG sa kviz-borbom, inspirisan ciklusom narodnih pesama o Marku Kraljeviću.
Ovo je **igriva verzija** prve pesme — *Oranje Marka Kraljevića*.

▶️ **Igraj online:** https://tnosugar.github.io/marko-kraljevic-public-igra/

> ⚙️ Ovaj repo je **automatski sinhronizovan** iz privatnog izvora
> (`tnosugar/marko-kraljevic-private`). Ne menjaj ga direktno — izmene se rade u
> privatnom repou i workflow ih prenosi ovamo.

## O igri

Marko prolazi kroz avanturu na HoMM-inspirisanoj mapi i bori se sa turskim
janjičarima rešavajući pitanja iz same pesme:

- **Verno pesmi:** Marko prvo uzme *ralo i volove* kod štale, pa njima obori
  janjičara na carevu drumu — alat za oranje postaje oružje.
- **Kviz gejtuje napad:** tačan odgovor pogađa protivnika bez kazne; netačan je
  promašaj i Turčin uzvraća.
- **Poternja:** po otetom blagu kreću dva goniča dok skupljaš dinare i vraćaš se majci.
- **Dve istorijske valute:** srebrni dinar (Srbija, 1371) i mletački dukat.
- **Latinica / Ћирилица** prekidač, atmosferski *Tweaks* panel.

## Pokretanje (lokalno)

Igra učitava skripte preko `fetch`, pa joj treba lokalni server (ne `file://`):

```bash
python3 -m http.server 8000
# pa otvori http://localhost:8000/
```

Na GitHub Pages radi direktno (HTTPS), bez servera.

## Tehnologija

Samostalan HTML + React (preko Babel standalone, bez build koraka). Logika i
sadržaj su u `marko/` (`data.js`, `screens_*.jsx`, `components.jsx`), grafika u
`marko/art/`, `assets/`, `uploads/`.

## Licenca i zasluge

Tekstovi pesama: javno dobro (srpska narodna epika, sakupio Vuk Karadžić).

> „Il' je bilo ili nije bilo, ljudi vele da je od istine.”
