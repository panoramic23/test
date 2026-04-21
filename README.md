# Luck The System

Web app che aggrega offerte Amazon tramite Product Advertising API (PA-API) e pubblica solo i prodotti con prezzo eccezionalmente basso rispetto alla loro media storica.

## Funzionalità

- Dashboard web con immagini, nome, prezzo, sconto e link affiliato.
- API backend (`FastAPI`) con endpoint per:
  - leggere offerte correnti;
  - trigger manuale scansione dell'agente.
- Agente AI-like (euristico) in background che:
  - interroga periodicamente Amazon;
  - mantiene una storia prezzi locale;
  - calcola uno score di anomalia prezzo;
  - pubblica solo prodotti sotto soglia (es. -35% o più rispetto alla media).
- Modalità demo senza credenziali Amazon (`AMAZON_USE_MOCK=true`).

## Setup rapido

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Apri `http://127.0.0.1:8000`.

## Configurazione Amazon PA-API

Compila `.env` con le tue chiavi:

- `AMAZON_ACCESS_KEY`
- `AMAZON_SECRET_KEY`
- `AMAZON_ASSOCIATE_TAG`
- `AMAZON_REGION`
- `AMAZON_HOST`

> Nota: in assenza di credenziali, la modalità mock resta utile per sviluppo UI/agent.

## Avvio agente continuo

L'agente parte automaticamente all'avvio del backend e gira ogni `SCAN_INTERVAL_SECONDS` (default: 1800).

Puoi forzare una scansione con:

```bash
curl -X POST http://127.0.0.1:8000/api/scan
```

## Test

```bash
pytest -q
```
