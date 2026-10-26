from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.elexon_service import fetch_fuelhh_wind, fetch_windfor_forecasts
from app.analysis import align_forecasts_to_actuals, compute_metrics
import pandas as pd

app = FastAPI(title="Wind Forecast Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache data for simplicity in this demo
_cache = {}

@app.get("/api/analysis")
async def get_analysis():
    """Fetches data for Jan 2026, aligns, and returns metrics + timeseries."""
    # Use the full month of January 2026
    start = "2026-01-01"
    end = "2026-01-31"
    
    try:
        # In a real app, you would handle pagination/limits here
        df_actuals = await fetch_fuelhh_wind(start, end)
        df_forecasts = await fetch_windfor_forecasts(start, end)
        
        aligned = align_forecasts_to_actuals(df_actuals, df_forecasts, decision_hour_offset=12)
        metrics = compute_metrics(aligned)
        
        # Prepare data for the chart (limit to a sample if too large, e.g., first 100 points)
        chart_data = aligned[["startTime", "actual_mw", "forecast_mw"]].head(100).to_dict(orient="records")
        
        return {
            "metrics": metrics,
            "chart_data": chart_data,
            "message": "Data processed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health():
    return {"status": "ok"}