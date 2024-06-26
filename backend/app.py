from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_caching import Cache
import json

import main

app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
CORS(app)

stocks_data_class = main.StocksData(["BHP", "CBA", "CSL", "NAB", "WBC", "JTL", "NGS", "T3D", "MSG", "SAN"], "AX")


@app.route('/get_tickers', methods=['GET'])
def get_tickers():
    return jsonify(stocks_data_class.stocks), 200

@app.route('/get_all', methods=['GET'])
def get_all():
    stocks_data, stocks = stocks_data_class.get_all()

    return jsonify(json.loads(stocks_data), stocks), 200

@app.route('/get_consecutive', methods=['GET'])
#@cache.cached(timeout=60*60)
def get_consecutive():
    days = int(request.args.get("days", "3"))

    stocks_data, stocks, timeline = stocks_data_class.consecutive_filter(days)

    # Return the list as JSON
    return jsonify(json.loads(stocks_data), stocks, timeline), 200

@app.route('/get_inprice', methods=['GET'])
def get_inprice():
    price = float(request.args.get("price", "0.1"))

    stocks_data, stocks, timeline = stocks_data_class.price_filter(price)

    # Return the list as JSON
    return jsonify(json.loads(stocks_data), stocks, timeline), 200

@app.route('/get_avg', methods=['GET'])
def get_avg():
    percent = float(request.args.get("percent", "30"))
    
    stocks_data, stocks, timeline = stocks_data_class.average_filter(percent)

    # Return the list as JSON
    return jsonify(json.loads(stocks_data), stocks, timeline), 200

@app.route('/clear_filters', methods=['GET'])
def clear_filters():
    stocks_data_class.clear_filter()

    # Return the list as JSON
    return jsonify({"msg": "cleared"}), 200


if __name__ == '__main__':
    app.run(debug=True, port=8082)
