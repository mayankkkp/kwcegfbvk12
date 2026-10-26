# Wind Forecast Analysis Portal

A full-stack web application for a UK energy utility's day-ahead trading team. It shows the latest Elexon wind generation forecasts and quantifies their forecast error, so traders can size thermal procurement with the error band in mind rather than guessing.

**Live demo:** https://kwcegfbvk12-inly.vercel.app/

---

## What it does

The utility buys thermal power day-ahead to back up weather-dependent wind generation. If the wind forecast is wrong, they either overpay for unnecessary thermal or face shortfall risk. This app addresses two needs from the brief:

1. **See the latest renewable forecasts** available when day-ahead purchase decisions are made.
2. **Quantify forecast accuracy** so procurement decisions account for the measured error.

Scope follows the brief: national-level wind only, actuals from Elexon `FUELHH` and forecasts from Elexon `WINDFOR`, filtered to `fuelType = "WIND"`.

### Analysis methodology

For each half-hour delivery period, the app picks the **latest forecast that was published before a configurable decision cutoff** (default: 12 hours before delivery). This avoids look-ahead bias — a decision made on day D cannot use a forecast published after that decision. Error is computed as `forecast − actual`. Reported metrics:

- **MAE** (mean absolute error) — average miss size, the most interpretable number for procurement.
- **RMSE** — penalises large misses more heavily than MAE.
- **Bias** — systematic over- or under-prediction. Positive bias means the forecast over-predicts wind, which risks under-procuring thermal.

**Note on dates:** the brief specifies purchase decisions for January 2026. Elexon has not published data for that future month, so the demo points at a historical month with real data. The date range is a two-line change in `backend/app/main.py`.

---

## Repository layout

```text
wind-forecast-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Marks app/ as a Python package
│   │   ├── main.py              # FastAPI app, routes, CORS, orchestration
│   │   ├── elexon_service.py    # Elexon API calls (chunked to 7-day windows)
│   │   └── analysis.py          # Forecast/actual alignment + error metrics
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Backend container image
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Dashboard layout, data fetching
│   │   ├── App.css              # Styling
│   │   └── components/
│   │       ├── ForecastChart.jsx  # Actual-vs-forecast line chart (Recharts)
│   │       └── ErrorMetrics.jsx   # MAE / RMSE / bias metric cards
│   ├── index.html               # Vite HTML entry
│   ├── package.json             # Node dependencies and scripts
│   ├── vite.config.js           # Vite config, /api dev proxy
│   ├── Dockerfile               # Frontend dev container image
│   └── .dockerignore
├── docker-compose.yml           # Runs frontend + backend together locally
├── vercel.json                  # Vercel Services routing (frontend + backend)
└── README.md



## How to start the application

#### Option A — Docker (recommended)
Requires Docker Desktop (Linux containers mode).

bash
git clone https://github.com/mayankkkp/kwcegfbvk12.git
cd wind-forecast-app
docker compose up --build
Frontend: http://localhost:5173

Backend health: http://localhost:8000/api/health

Backend API docs: http://localhost:8000/docs

The Vite dev server proxies /api/* to the backend service over the Docker network, so no CORS configuration is needed in development. Source changes hot-reload in both containers.

To stop: Ctrl+C in the terminal, then docker compose down.

Option B — Run without Docker
Backend:

bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
Frontend (in a second terminal):

bash
cd frontend
npm install
npm run dev
Frontend at http://localhost:5173, backend at http://localhost:8000.

