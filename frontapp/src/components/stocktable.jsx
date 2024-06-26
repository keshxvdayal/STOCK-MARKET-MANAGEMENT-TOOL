/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react';
import "../App.css";

import axios from 'axios';
import Header from './header';

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const columns = [
    columnHelper.accessor('time', {
        header: () => 'Time',
        cell: info => info.getValue(),
        footer: info => info.column.id,
        columns: [
            columnHelper.accessor('stock', {
                header: () => 'Stock',
                cell: info => info.getValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('volume', {
                header: () => 'Volume',
                cell: info => info.renderValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('high', {
                header: () => 'High',
                cell: info => {console.log(info); return info.renderValue()},
                footer: info => info.column.id,
            }),
            columnHelper.accessor('low', {
                header: () => 'Low',
                cell: info => info.renderValue(),
                footer: info => info.column.id,
            }),
            columnHelper.accessor('open', {
                header: 'Open',
                footer: info => info.column.id,
            }),
            columnHelper.accessor('close', {
                header: 'Close',
                footer: info => info.column.id,
            }),
        ]
    }),
];


export default function StockTable({tableData=[]}) {
    const [data, _setData] = useState([...tableData]);
    const [grouping, setGrouping] = useState([]);
    const rerender = React.useReducer(() => ({}), {})[1];
  
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      state: {
        grouping,
      },
      onGroupingChange: setGrouping,
      getExpandedRowModel: getExpandedRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      debugTable: true,
    });
  
    return (
      <div className="p-2">
        <table className='border-2 w-full'>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th className='border-2 p-1 text-center' key={header.id} colSpan={header.colSpan}>
                    {/* {header.isPlaceholder ? null : (
                      <div>
                        {header.column.getCanGroup() ? (
                          // If the header can be grouped, let's add a toggle
                          <button
                            {...{
                              onClick: header.column.getToggleGroupingHandler(),
                              style: {
                                cursor: 'pointer',
                              },
                            }}
                          >
                            {header.column.getIsGrouped()
                              ? `🛑(${header.column.getGroupedIndex()}) `
                              : `👊 `}
                          </button>
                        ) : null}{' '}
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )} */}
                    {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='border-2'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* <tfoot>
            {table.getFooterGroups().map(footerGroup => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot> */}
        </table>
        <div className="h-4" />
        <button onClick={() => rerender()} className="border p-2">
          Rerender
        </button>
      </div>
    )
}
  
