import yfinance as yf
import pandas as pd


emptydf = pd.DataFrame()

def price_range(global_df=None, price=None):
    if (global_df is None or price is None):
        return 0

    filtered_df = global_df.Close.map(lambda x: x if x <= price else None)
    
    # Drop columns where all values are None
    filtered_df = filtered_df.dropna(axis=1, how='all')

    timeline = filtered_df.index.to_list()

    return filtered_df.columns.to_list(), timeline, filtered_df


