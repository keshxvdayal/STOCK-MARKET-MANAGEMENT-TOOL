import requests_cache
import yfinance as yf
import pandas as pd
from functools import reduce
from datetime import datetime

import filters.filter1 as filter1
import filters.filter2 as filter2
import filters.filter3 as filter3


class StocksData:
    def __init__(self, stocks=[], exchange="") -> None:
        self.setup = False

        self.session = requests_cache.CachedSession('yfinance.cache')
        self.session.headers['User-agent'] = 'my-program/1.0'

        self.stocks = stocks
        self.exchange = exchange
        self.sybmols = " ".join([f"{i}.{self.exchange}" for i in self.stocks])

        self.filterSet = {}
        self.avgFilterDays = None
        self.global_df = pd.DataFrame()
    
    def get_all(self, clear=False) -> dict:
        if len(self.global_df) > 1:
            return self.global_df.to_json(), self.stocks
            
        print("getting all data ", self.sybmols)
        ticks = yf.Tickers(self.sybmols, session=self.session)

        # get historical market data
        hist_df = ticks.history(period="1y", actions=False, prepost=False)
        self.global_df = hist_df.copy(deep=True)
        #self.download()
        self.setup = True

        return self.global_df.to_json(), self.stocks
    
    def get_stocks(self, stocks=[]):
        if len(stocks) == 0:
            return pd.DataFrame()
        
        str_stocks = ""
        tickers = None
        if len(stocks) == 1:
            str_stocks = stocks[0]
            tickers = yf.Ticker(str_stocks)
        else:
            str_stocks = " ".join(stocks) 
            tickers = yf.Tickers(str_stocks)

        # get historical market data
        hist_df = tickers.history(period="1y", actions=False, prepost=False)

        return hist_df
    
    # require setting up 
    
    def intersect(self):
        if self.setup == False:
            return 0
        
        values = list(self.filterSet.values())

        if len(values) == 0:
            return self.global_df.to_json(), self.stocks, []

        if len(values) == 1:
            stocks = values[0]["stocks"]
            return self.get_stocks(stocks).to_json(), stocks, values[0]["timeline"]
        
        stock_values = [ d['stocks'] for d in values ]
        timeline_values = [ d['timeline'] for d in values ]
        
        common_stocks = list( reduce( lambda x, y: x & y, map(set, stock_values) ) )
        #common_time = list( reduce( lambda x, y: x & y, map(set, timeline_values) ) )

        # Convert each list in arrays to a set
        sets = [set(array) for array in timeline_values]

        # Find the intersection of all sets
        common_timestamps = set.intersection(*sets)

        # Convert the result back to a list (if needed)
        common_timestamps_list = list(common_timestamps)

        # Print the common timestamps
        #print("Common Timestamps:", common_timestamps_list)

        # # Merge all DataFrames into one using a common 'key' column
        # merged_df = reduce(lambda left, right: pd.merge(left, right, on=['Ticker'], how='inner'), values)

        return self.get_stocks(common_stocks).to_json(), common_stocks, common_timestamps_list

    def consecutive_filter(self, days=3) -> tuple:
        if self.setup == False:
            return 0
        
        if days == 0:
            del self.filterSet["consecutiveFilter"]
            return self.intersect()
        
        # setting up timeframe, this is the timeframe to be used in average filter 
        self.avgFilterDays = days

        stocks, timeline, stocks_df = filter1.consecutive_positive(self.global_df, days)

        if len(stocks) > 0:
            self.filterSet["consecutiveFilter"] = {"stocks": stocks, "timeline": timeline}

        return self.intersect()

        # Create a list of tuples for the MultiIndex columns you want to keep
        # cols_to_keep = [(main_col, sub_col) for main_col in stocks_df.columns.get_level_values(0).unique() for sub_col in stocks if (main_col, sub_col) in stocks_df.columns]
        # self.global_df = stocks_df.loc[:, cols_to_keep].copy(deep=True)
        
        # stocks_data = []; up_stocks_dict = json.loads(self.global_df.Close.to_json())
        # for stock in stocks:
        #     data = {}
        #     data["symbol"] = stock
        #     data["closingPrices"] = up_stocks_dict[stock]
        #     stocks_data.append(data)

        # return stocks_data

    def price_filter(self, price=1) -> tuple:
        if self.setup == False:
            return 0

        if price == 0:
            del self.filterSet["priceFilter"]
            return self.intersect()
        
        stocks, timeline, stocks_df = filter2.price_range(self.global_df, price)

        if len(stocks) > 0:
            self.filterSet["priceFilter"] = {"stocks": stocks, "timeline": timeline}

        return self.intersect()
    
    def average_filter(self, avg=30) -> tuple:
        if self.setup == False:
            return 0
        
        if avg == 0:
            del self.filterSet["averageFilter"]
            return self.intersect()
        
        stocks, timeline = filter3.average(self.global_df, avg, self.avgFilterDays)
        
        if len(stocks) > 0:
            self.filterSet["averageFilter"] = {"stocks": stocks, "timeline": timeline}

        return self.intersect()
    
    def clear_filter(self):
        self.filterSet = {}

    def download(self):
        if self.setup == False:
            return 0
        
        self.global_df.to_excel("output.xlsx")


# stocks_data_class = StocksData(["BHP", "CBA", "CSL", "NAB", "WBC", "JTL", "NGS", "T3D", "MSG", "SAN"], "AX")
# stocks_data_class.get_all()
# stocks_data_class.price_filter(1)
# stocks_data_class.average_filter()

# print(stocks_data_class.price_filter())
# print(stocks_data_class.consecutive_filter())

# def pricerange_filter(range=0.1):
#     stocks, stocks_df = filter2.pricerange(range=0.1)
#     globaldf = up_stocks_df.copy(deep=True)

#     stocks_data = []; up_stocks_dict = json.loads(up_stocks_df.to_json())
#     for stock in up_stocks:
#         data = {}
#         data["symbol"] = stock
#         data["closingPrices"] = up_stocks_dict[stock]
#         stocks_data.append(data)

#     return stocks_data

# get all stock info
#print(msft.info)


# # show meta information about the history (requires history() to be called first)
# msft.history_metadata

# # show actions (dividends, splits, capital gains)
# msft.actions
# msft.dividends
# msft.splits
# msft.capital_gains  # only for mutual funds & etfs

# # show share count
# msft.get_shares_full(start="2022-01-01", end=None)

# # show financials:
# # - income statement
# msft.income_stmt
# msft.quarterly_income_stmt
# # - balance sheet
# msft.balance_sheet
# msft.quarterly_balance_sheet
# # - cash flow statement
# msft.cashflow
# msft.quarterly_cashflow
# # see `Ticker.get_income_stmt()` for more options

# # show holders
# msft.major_holders
# msft.institutional_holders
# msft.mutualfund_holders
# msft.insider_transactions
# msft.insider_purchases
# msft.insider_roster_holders

# # show recommendations
# msft.recommendations
# msft.recommendations_summary
# msft.upgrades_downgrades

# # Show future and historic earnings dates, returns at most next 4 quarters and last 8 quarters by default.
# # Note: If more are needed use msft.get_earnings_dates(limit=XX) with increased limit argument.
# msft.earnings_dates

# # show ISIN code - *experimental*
# # ISIN = International Securities Identification Number
# msft.isin

# # show options expirations
# msft.options

# # show news
# msft.news

# # get option chain for specific expiration
# opt = msft.option_chain('YYYY-MM-DD')
# # data available via: opt.calls, opt.puts