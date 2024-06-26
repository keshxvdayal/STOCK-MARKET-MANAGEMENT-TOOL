import yfinance as yf
import pandas as pd


emptydf = pd.DataFrame()

def consecutive_positive(global_df=None, days=None):
    if (global_df is None or days is None):
        return 0

    emptydf = global_df.tail(days+2).Close.pct_change()

    # Check if the percentage change is positive for all days - 2
    positive_mask = emptydf[2:].map(lambda x: (x > 0)).all()

    # Filter stocks meeting the criteria
    up_stocks = positive_mask[positive_mask].index.to_list()
    timeline = global_df.tail(days).index.to_list()

    return up_stocks, timeline, global_df.tail(days)
