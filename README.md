# Calcolatore costo orario dipendente

Web app statica (HTML/CSS/JS) per stimare il costo orario e giornaliero reale di un dipendente includendo:

- CCNL selezionato (ferie, ROL, ex festività, TFR, soglia età apprendistato)
- retribuzione lorda, superminimo, straordinari, trasferte e bonus
- contributi aziendali, assicurazioni/fondi, malattia stimata
- simulazione su giornate/ore di progetto
- salvataggio profili dipendente in `localStorage`
- caricamento catalogo CCNL da feed JSON esterno

## Avvio locale

```bash
python3 -m http.server 8080
```

Poi apri `http://localhost:8080`.

## Deploy online rapido

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Opzione A: Netlify (consigliato)
1. Carica il repository su GitHub.
2. In Netlify: **Add new site** → **Import an existing project**.
3. Seleziona il repository e deploya (nessun comando build necessario).
4. Il file `netlify.toml` è già pronto per SPA fallback e supporto embed iframe.

### Opzione B: Vercel
1. Importa il repository in Vercel.
2. Deploy diretto senza build command.
3. Il file `vercel.json` è già pronto per rewrite su `index.html` e supporto embed.

## Collegamento automatico da GitHub Actions

Sono inclusi 2 workflow già pronti:

- `.github/workflows/deploy-netlify.yml`
- `.github/workflows/deploy-vercel.yml`

Per abilitarli, imposta i segreti nel repository GitHub:

### Netlify secrets
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

### Vercel secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Dopo il salvataggio dei secrets, pushando su `main` partirà il deploy automatico.

## Embed in sito aziendale

```html
<iframe
  src="https://tuodominio.example/calcolatore-costo-orario/"
  width="100%"
  height="900"
  style="border:0;"
  loading="lazy"
></iframe>
```

## Formato feed CCNL JSON

```json
[
  {
    "id": "commercio-terziario",
    "name": "CCNL Commercio e Terziario",
    "updatedAt": "2026-03-01",
    "source": "https://fonte.example/ccnl/commercio",
    "ferieDays": 26,
    "rolHours": 56,
    "exFestivitaHours": 32,
    "tfrRate": 7.41,
    "apprenticeshipAgeLimit": 29
  }
]
```

> Nota: i valori del catalogo predefinito sono dimostrativi e vanno sostituiti con dati ufficiali aggiornati.
