import yfinance as yf
import pandas as pd
import numpy as np

emptydf = pd.DataFrame()

def average(global_df=None, percent=None, days=None):
    if (global_df is None or percent is None):
        return 0

    if days is None:
        filtered_df = global_df.Close * global_df.Volume
    else:
        filtered_df = global_df.tail(days+2).Close * global_df.tail(days+2).Volume

    filtered_df = filtered_df.pct_change() * 100
    print(percent, filtered_df)
    filtered_df = filtered_df.map(lambda x: x if x >= percent else None)
    filtered_df = filtered_df.replace([np.inf, -np.inf], pd.NA)
    filtered_df = filtered_df.replace([np.nan], pd.NA)
    filtered_df = filtered_df.dropna(axis=1, how='all')

    timeline = filtered_df[(filtered_df > 0).any(axis=1)].index.to_list()

    print(timeline)
    
    return filtered_df.columns.to_list(), timeline


