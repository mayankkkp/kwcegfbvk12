import pandas as pd

def align_forecasts_to_actuals(df_actuals: pd.DataFrame, df_forecasts: pd.DataFrame, decision_hour_offset: int = 12):
    """
    For each actual delivery period, find the 'latest' forecast available 
    at a specific decision time (e.g., 12 hours before delivery).
    """
    if df_actuals.empty or df_forecasts.empty:
        return pd.DataFrame()

    # Merge on startTime to get all forecasts for a delivery period
    merged = pd.merge(df_actuals, df_forecasts, on="startTime", suffixes=("", "_fc"))
    
    # Calculate the decision time (e.g., 12 hours before the start of the delivery period)
    merged["decision_time"] = merged["startTime"] - pd.Timedelta(hours=decision_hour_offset)
    
    # Filter to only forecasts that were published *before* the decision time
    valid = merged[merged["publishTime"] <= merged["decision_time"]].copy()
    
    # For each startTime, pick the forecast with the latest publishTime
    valid = valid.sort_values("publishTime").groupby("startTime").last().reset_index()
    
    # Calculate error
    valid["error_mw"] = valid["forecast_mw"] - valid["actual_mw"]
    return valid

def compute_metrics(aligned_df: pd.DataFrame):
    """Computes MAE, RMSE, and Bias."""
    if aligned_df.empty:
        return {}
    
    errors = aligned_df["error_mw"]
    return {
        "mae": float(errors.abs().mean()),
        "rmse": float((errors ** 2).mean() ** 0.5),
        "bias": float(errors.mean()),
        "count": int(len(errors))
    }