/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React, { useState, useEffect, useRef } from 'react';
import "../App.css";
import axios from 'axios';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import NormalTable from "./normaltable";
import ConsecutiveCarousel from "./carousel";
import Header from './header';

import useTimeList from "../hooks/timeList";

const extraColumns = ["Close", "High", "Low", "Open", "Volume"];

export function Card({ symbol = "stock", closingPrices = [] }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const prices = Object.values(closingPrices);
    const up = ((prices.slice(-1)[0] - prices[0]) * 100) / prices[0];
    setPercent(up.toFixed(2));
  }, [closingPrices]);

  return (
    <div className="card border border-black mb-3">
  <div className="card-body">
    <div className="flex justify-between items-center">
      <strong className="text-muted text-lg">{symbol.split(".")[0]}</strong>
      <div className="icon icon-shape bg-primary text-white text-lg rounded-full">
        <i className="bi bi-people"></i>
      </div>
    </div>
    <div className="mt-2 mb-0 text-lg">
      <span className="badge badge-pill bg-soft-success text-success me-2">
        <i className="bi bi-arrow-up me-1"></i>{percent}%
      </span>
    </div>
  </div>
</div>

  );
}

let intervalId1, intervalId2, intervalId3;
const base = "http://127.0.0.1:8082" //"http://127.0.0.1:8082";
const StockViewer = () => {
  const [stocksData, setStocksData] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ start: 0, limit: 30 });
  const [consecutiveData, setConsecutiveData] = useState([]);
  
  const consecutiveRef = useRef(0);
  const priceRangeRef = useRef(0);
  const avgRef = useRef(0);

  const { genList } = useTimeList();

  const getAll = async () => {
    axios.get(base+'/get_all', {
      headers: {
        "bypass-tunnel-reminder": "bypass" //remove in production
      }
    })
      .then(response => {
        const json = response.data;
        if (json.error) {
          alert(json.error);
          return 0;
        }

        setStocksData(json);
        setTimeList(genList(0, 30, json[1].length > 1 ? true : false));
      })
      .catch(error => {
        console.error('Error fetching stock data:', error);
      });
  }

  const paginate = (start = 30, limit = 30) => {
    setPagination({ start, limit });
    setTimeList(genList(start, limit, stocksData[1].length > 1 ? true : false));
  };

  const handleConsecutiveChange = async (days=3) => {
    clearTimeout(intervalId2)
    intervalId2 = setTimeout(async () => {
      const response = await axios.get(base+'/get_consecutive?days='+days, {
        headers: {
          "bypass-tunnel-reminder": "bypass" // remove in production
        }
      });
      const json = response.data;
      if (json.error) {
        alert(json.error);
        return 0;
      }

      console.log(json)

      //setConsecutiveData(json); // Update consecutiveData instead of stocksData
      setStocksData(json);
      setTimeList(genList(0, 30, json[1].length > 1 ? true : false, json[2]));
    }, 2000);
  }

  const handlePriceChange = async (price=0.1) => {
    clearTimeout(intervalId1)
    intervalId1 = setTimeout(async () => {
      const response = await axios.get(base+'/get_inprice?price='+price, {
        headers: {
          "bypass-tunnel-reminder": "bypass"
        }
      });
      const json = response.data;
      if (json.error) {
        alert(json.error);
        return 0;
      }

      setStocksData(json);
      setTimeList(genList(0, 30, json[1].length > 1 ? true : false, json[2]));
    }, 2000);
  }

  const handleAvgChange = async (percent=30) => {
    clearTimeout(intervalId3)
    intervalId3 = setTimeout(async () => {
      const response = await axios.get(base+'/get_avg?percent='+percent, {
        headers: {
          "bypass-tunnel-reminder": "bypass" // remove in production
        }
      });
      const json = response.data;
      if (json.error) {
        alert(json.error);
        return 0;
      }
      console.log(json)

      setStocksData(json);
      setTimeList(genList(0, 30, json[1].length > 1 ? true : false, json[2]));
    }, 2000);
  }

  const handleClearClick = async (e) => {
    const response = await axios.get(base+'/clear_filters', {
      headers: {
        "bypass-tunnel-reminder": "bypass" // remove in production
      }
    });

    consecutiveRef.current.value = 0;
    priceRangeRef.current.value = 0;
    avgRef.current.value = 0;
    getAll();
  }

  // getting all stock data - this is shown when first time it loads
  useEffect(() => {
    getAll();
  }, []);

  // formatting and paginating the stock data 
  useEffect(() => {
    if (!stocksData.length) return () => {};

    const stocksList = stocksData[1];
    const tabledata = [];

    if (stocksList.length > 1) {
      for (let index = 0; index < timeList.length; index++) {
        const time = timeList[index];
        let data = { Time: time, Stocks: [] };

        for (let j = 0; j < stocksList.length; j++) {
          const stock = stocksList[j];
          const selectedCols = Object.keys(stocksData[0]).filter(z => z.includes(stock));
          data.Stocks.push({ Stock: stock });

          for (let k = 0; k < extraColumns.length; k++) {
            const xcol = extraColumns[k];
            const col = selectedCols.find(z => z.includes(xcol));
            data.Stocks[j] = { ...data.Stocks[j], [xcol]: stocksData[0][col][time] };
          }
        }
        tabledata.push(data);
      }
    } else {
      for (let index = 0; index < timeList.length; index++) {
        const time = timeList[index];
        let data = { Time: time, Stocks: [] };

        for (let j = 0; j < stocksList.length; j++) {
          const stock = stocksList[j];
          data.Stocks.push({ Stock: stock });

          for (let k = 0; k < extraColumns.length; k++) {
            const xcol = extraColumns[k];
            data.Stocks[j] = { ...data.Stocks[j], [xcol]: stocksData[0][xcol][time] };
          }
        }
        tabledata.push(data);
      }
    }

    setTableData(tabledata);
  }, [stocksData, timeList]);


  return (

    <div className="flex flex-col lg:flex-row h-full">
      <div className="h-screen flex-grow">
        <Header />
        <main className="py-6 h-full">
        
          <div className="container mx-auto px-4 h-full">
            {/* carousel */}
            {/* <h3 className="text-slate-600">Stocks that went up for 3 consecutive days</h3>
            <br /> */}
            {/* <ConsecutiveCarousel consecutiveData={consecutiveData} /> */}

            {/* stock table */}
            {/* filters */}
            <br />
            <div className="flex flex-col sm:flex-row sm:items-end my-3">
              <h3 className="mb-0 text-3xl font-bold mr-auto">STOCKS</h3>
              <div className="flex flex-col sm:flex-row items-end sm:items-center">
                <button
                  className="btn btn-primary mb-2 sm:mb-0 sm:mr-3"
                  onClick={() => paginate(pagination.start - pagination.limit, pagination.limit)}
                >
                  Prev Page
                </button>
                <button
                  className="btn btn-primary mb-2 sm:mb-0 sm:mr-3"
                  onClick={() => paginate(pagination.start + pagination.limit, pagination.limit)}
                >
                  Next Page
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="mb-2 sm:mb-0 sm:mr-2 flex-grow">
                  <label className="block">Consecutive Days:</label>
                  <input
                    type="number"
                    className="form-control w-48 "
                    defaultValue={0}
                    onChange={(e) => handleConsecutiveChange(parseInt(e.target.value))}
                    min={1}
                    max={5}
                    ref={consecutiveRef}
                  />
                </div>
                <div className="mb-2 sm:mb-0 sm:mr-2 flex-grow">
                  <label className="block">Price Range (equal to or below):</label>
                  <input
                    type="number"
                    className="form-control w-48 "
                    defaultValue={0}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                    step={0.01}
                    min={0.01}
                    ref={priceRangeRef}
                  />
                </div>
                <div className="mb-2 sm:mb-0 sm:mr-2 flex-grow">
                  <label className="block">Average (equal to or above):</label>
                  <input
                    type="number"
                    className="form-control w-48"
                    defaultValue={0}
                    onChange={(e) => handleAvgChange(parseFloat(e.target.value))} 
                    min={0}
                    ref={avgRef}
                  />
                </div>
              </div>
              <button className="btn btn-warning mt-2 sm:mt-0 sm:ml-6" onClick={handleClearClick}>
                Clear
              </button>
            </div>

            <div className="card shadow m-0 bg-purple-500 h-[90%]">
              <div className="table-responsive rounded-2xl font-bold text-2xl bg-white">
                <NormalTable tableData={tableData} />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default StockViewer;
