import httpx
import pandas as pd
from datetime import datetime, timedelta

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"

async def fetch_fuelhh_wind(start_date: str, end_date: str):
    """Fetches actual wind generation (FUELHH), splitting into <=7 day chunks."""
    import httpx
    import pandas as pd
    
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    
    all_data = []
    
    async with httpx.AsyncClient() as client:
        current = start
        while current < end:
            chunk_end = min(current + timedelta(days=7), end)
            
            url = f"{BASE_URL}/datasets/FUELHH"
            params = {
                "publishDateTimeFrom": current.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "publishDateTimeTo": chunk_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "fuelType": "WIND",
                "format": "json"
            }
            resp = await client.get(url, params=params, timeout=30.0)
            resp.raise_for_status()
            data = resp.json().get("data", [])
            all_data.extend(data)
            
            current = chunk_end
        
        if not all_data:
            return pd.DataFrame()
        
        df = pd.DataFrame(all_data)
        df["startTime"] = pd.to_datetime(df["startTime"])
        df = df[["startTime", "generation"]].rename(columns={"generation": "actual_mw"})
        return df

async def fetch_windfor_forecasts(start_date: str, end_date: str):
    """Fetches wind generation forecasts (WINDFOR), splitting into <=7 day chunks."""
    import httpx
    import pandas as pd
    
    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    
    all_data = []
    
    async with httpx.AsyncClient() as client:
        current = start
        while current < end:
            chunk_end = min(current + timedelta(days=7), end)
            
            url = f"{BASE_URL}/datasets/WINDFOR"
            params = {
                "publishDateTimeFrom": current.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "publishDateTimeTo": chunk_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "format": "json"
            }
            resp = await client.get(url, params=params, timeout=30.0)
            resp.raise_for_status()
            data = resp.json().get("data", [])
            all_data.extend(data)
            
            current = chunk_end
        
        if not all_data:
            return pd.DataFrame()
        
        df = pd.DataFrame(all_data)
        df["startTime"] = pd.to_datetime(df["startTime"])
        df["publishTime"] = pd.to_datetime(df["publishTime"])
        df = df[["startTime", "publishTime", "generation"]].rename(columns={"generation": "forecast_mw"})
        return df