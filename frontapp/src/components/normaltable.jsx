/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react';
import "../App.css";

import axios from 'axios';
import Header from './header';


export default function NormalTable({tableData=[]}) {
  
  return (
    <table className="table min-w-full m-0">
      <thead className="">
        <tr className="table_head">
          <th className="font-bolder text-white text-md">Stock</th>
          <th className="font-bolder text-white text-md">Close (USD)</th>
          <th className="font-bolder text-white text-md">High (USD)</th>
          <th className="font-bolder text-white text-md">Low (USD)</th>
          <th className="font-bolder text-white text-md">Open (USD)</th>
          <th className="font-bolder text-white text-md">Volume (USD)</th>
        </tr>
      </thead>
      <tbody className=''>
        {tableData.map((z, i) => (
          <React.Fragment key={z.Time + i}>
            <tr>
              <td colSpan="6" className="text-sm mt-6 font-bold p-3 para border-b-2 border-black">
                {new Date(z.Time).toString()}
              </td>
            </tr>
            {z.Stocks.map((stock, j) => (
              <tr key={stock.Stock + j} className="table_data">
                <td className="p-4 stocks">{stock.Stock}</td>
                <td className="p-1">{stock.Close}</td>
                <td className="p-1">{stock.High}</td>
                <td className="p-1">{stock.Low}</td>
                <td className="p-1">{stock.Open}</td>
                <td className="p-1">{stock.Volume}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  
  )
}
  
