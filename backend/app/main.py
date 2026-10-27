from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.elexon_service import fetch_fuelhh_wind, fetch_windfor_forecasts
from app.analysis import align_forecasts_to_actuals, compute_metrics
from datetime import date, timedelta

app = FastAPI(title="Wind Forecast Analysis API")

# --- ADD CACHE HERE ---
_cache = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analysis")
async def get_analysis(
    start: str = Query(default="2025-01-01"),
    end: str = Query(default="2025-01-31"),
):
    """
    Fetch actuals and forecasts for the given range, align them, return metrics + chart data.
    start / end are ISO dates (YYYY-MM-DD). Range is capped at 31 days to keep requests bounded.
    """
    # Validate date format
    try:
        start_d = date.fromisoformat(start)
        end_d = date.fromisoformat(end)
    except ValueError:
        raise HTTPException(status_code=400, detail="Dates must be in YYYY-MM-DD format")

    if end_d <= start_d:
        raise HTTPException(status_code=400, detail="end must be after start")

    if (end_d - start_d).days > 31:
        raise HTTPException(status_code=400, detail="Date range must not exceed 31 days")

    # Elexon cannot have data for future dates — clamp end to today
    today = date.today()
    if start_d > today:
        raise HTTPException(status_code=400, detail="Start date is in the future; no data exists")

    try:
        df_actuals = await fetch_fuelhh_wind(start, end)
        df_forecasts = await fetch_windfor_forecasts(start, end)

        aligned = align_forecasts_to_actuals(df_actuals, df_forecasts, decision_hour_offset=12)
        metrics = compute_metrics(aligned)

        # Cap chart at ~200 points so the response stays light
        chart_data = aligned[["startTime", "actual_mw", "forecast_mw"]].head(200).to_dict(orient="records")
        # Convert timestamps to ISO strings for JSON
        for row in chart_data:
            row["startTime"] = row["startTime"].isoformat()

        return {
            "metrics": metrics,
            "chart_data": chart_data,
            "range": {"start": start, "end": end},
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health():
    return {"status": "ok"}