import React, { useMemo, useEffect, Fragment, useState } from 'react';
import { useTable, useSortBy, useExpanded, usePagination, useGlobalFilter, useFilters, useRowSelect } from 'react-table';
import { BiCaretDown, BiCaretUp } from 'react-icons/bi';
import './Table.scss';
import { DefaultColumnFilter, fuzzyTextFilterFn, dateBetweenFilterFn } from './TableFilter'
import { CSVLink, CSVDownload } from "react-csv";

import { FaFilePdf, FaTable, FaBell } from "react-icons/fa";

function Table({ DATA, COLUMNS, pageNum, setPageNum, isPrevious, isNext, schoolRequest, search, keyword, renderRowSubComponent, showCheckbox = false, notifContext = '' }) {
    const filterTypes = React.useMemo(
        () => ({
          // Add a new fuzzyTextFilterFn filter type.
          fuzzyText: fuzzyTextFilterFn,
          dateBetween: dateBetweenFilterFn,
          // Or, override the default text filter to use
          // "startWith"
          text: (rows, id, filterValue) => {
            return rows.filter(row => {
              const rowValue = row.values[id]
              return rowValue !== undefined
                ? String(rowValue)
                    .toLowerCase()
                    .startsWith(String(filterValue).toLowerCase())
                : true
            })
          },
        }),
        []
      )
    
      const defaultColumn = React.useMemo(
        () => ({
          // Let's set up our default Filter UI
          Filter: DefaultColumnFilter,
        }),
        []
      )

      const IndeterminateCheckbox = React.forwardRef(
        ({ indeterminate, ...rest }, ref) => {
          const defaultRef = React.useRef()
          const resolvedRef = ref || defaultRef
      
          React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
          }, [resolvedRef, indeterminate])
      
          return (
            <>
              <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
          )
        }
      )

    const data = useMemo( () => DATA , [DATA]);

    const initialState = { hiddenColumns: ['emailUser', 'parentEmail', '_id'], pageSize: 100 };
    
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        rows,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        visibleColumns,
        selectedFlatRows,
        state: { selectedRowIds },
        state: {pageIndex, pageSize, expanded},
        state,
        setGlobalFilter
    } = useTable({
        columns: COLUMNS,
        data: data,
        defaultColumn, // Be sure to pass the defaultColumn option
        filterTypes,
        initialState
    }, useFilters
    , useGlobalFilter
    , useSortBy
    , useExpanded
    , usePagination
    , useRowSelect
    , hooks => {
        if(showCheckbox) hooks.visibleColumns.push(columns => [
          // Let's make a column for selection
          {
            id: 'selection',
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </div>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            ),
          },
          ...columns,
        ])
      })

    const { globalFilter } = state;
    const [regex, setRegex] = useState(keyword[0]);
    const [npsn, setNpsn] = useState(keyword[1]);
    const [kec, setKec] = useState(keyword[2]);
    const [kot, setKot] = useState(keyword[3]);
    const [prov, setProv] = useState(keyword[4]);
    const [dataList, setDataList] = useState([]);
    const [firstCur, setFirstCur] = useState(true);

    const csvLink = React.createRef();

    useEffect(() => {
        console.log(firstCur);
        if(!firstCur) {
            csvLink.current.link.click();
            setFirstCur(true);
        }
    }, [dataList])

    const downloadAsCSV = () => {
        const currentRecords = rows;
        // console.log(currentRecords);
        var data_to_download = [];
        for (var i = 0; i < currentRecords.length; i++) {
            let record_to_download = {};
            prepareRow(currentRecords[i]);
            // console.log(currentRecords[i].cells);
            for (var colIndex = 0; colIndex < currentRecords[i].cells.length; colIndex++) {
                if(currentRecords[i].cells[colIndex].column.id !== 'rowNumber' &&
                currentRecords[i].cells[colIndex].column.id !== 'selection' &&
                currentRecords[i].cells[colIndex].column.id !== 'buttonStatus') {
                    if(currentRecords[i].cells[colIndex].value && Object.prototype.toString.call(currentRecords[i].cells[colIndex].value) === "[object Date]" && !isNaN(currentRecords[i].cells[colIndex].value))
                        record_to_download[currentRecords[i].cells[colIndex].column.Header] =
                        currentRecords[i].cells[colIndex].value.toISOString().split('T')[0];
                    else record_to_download[currentRecords[i].cells[colIndex].column.Header] =
                        currentRecords[i].cells[colIndex].value;
                }
            }
            data_to_download.push(record_to_download);
        }
        setDataList(data_to_download);
    }

    const downloadAsCSV2 = () => {
        var data_to_download = [];
        setFirstCur(false);
        schoolRequest().then(currentRecords => {

        for (var i = 0; i < currentRecords.length; i++) {
            let record_to_download = {};
            let x = currentRecords[i];
            // console.log(currentRecords[i].cells);
            record_to_download['Nama Sekolah'] = x.nama;
            record_to_download['NPSN'] = x.npsn;
            record_to_download['Tingkat'] = x.bentuk_pendidikan;
            record_to_download['Status'] = x.status_pendidikan;
            record_to_download['Jml Guru dan Tendik'] = x.ptk;
            record_to_download['Jml Pegawai'] = x.pegawai;
            record_to_download['Jml Peserta Didik'] = x.pd;
            record_to_download['Jml Romb Belajar'] = x.rombel;
            record_to_download['Jml R Kelas'] = x.jml_rk;
            record_to_download['Jml R Lab'] = x.jml_lab;
            record_to_download['Jml Perpustakaan'] = x.jml_perpus;
            record_to_download['Kecamatan'] = x.induk_kecamatan;
            record_to_download['Kota/Kab'] = x.induk_kabupaten;
            record_to_download['Provinsi'] = x.induk_provinsi;
            data_to_download.push(record_to_download);
        }
        })
        .catch(err => {
        })
        .finally(() => {
            console.log('Ini', data_to_download);
            setDataList(data_to_download);
        });
        return [{}];
    }

    return (
        <>
        <div className="tools">
            <div className="table_props">
                {/* <span>Total: {rows.length} Data</span> */}
                <input
                    type="text"
                    className="table_props_input"
                    placeholder="Nama Sekolah..."
                    value={ regex || '' }
                    onChange={(e) => {
                        setRegex(e.currentTarget.value);
                    }}
                    onBlur={() => {
                        search(regex, npsn, kec, kot, prov);
                    }}
                    onKeyDown={(event) => {
                        if(event.key === 'Enter') {
                            search(regex, npsn, kec, kot, prov);
                        }
                    }}
                />
                <input
                    type="text"
                    className="table_props_input"
                    placeholder="NPSN..."
                    value={ npsn || '' }
                    onChange={(e) => {
                        setNpsn(e.currentTarget.value);
                    }}
                    onBlur={() => {
                        search(regex, npsn, kec, kot, prov);
                    }}
                    onKeyDown={(event) => {
                        if(event.key === 'Enter') {
                            search(regex, npsn, kec, kot, prov);
                        }
                    }}
                />
                <input
                    type="text"
                    className="table_props_input"
                    placeholder="Kecamatan..."
                    value={ kec || '' }
                    onChange={(e) => {
                        setKec(e.currentTarget.value);
                    }}
                    onBlur={() => {
                        search(regex, npsn, kec, kot, prov);
                    }}
                    onKeyDown={(event) => {
                        if(event.key === 'Enter') {
                            search(regex, npsn, kec, kot, prov);
                        }
                    }}
                />
                <input
                    type="text"
                    className="table_props_input"
                    placeholder="Kota/Kabupaten..."
                    value={ kot || '' }
                    onChange={(e) => {
                        setKot(e.currentTarget.value);
                    }}
                    onBlur={() => {
                        search(regex, npsn, kec, kot, prov);
                    }}
                    onKeyDown={(event) => {
                        if(event.key === 'Enter') {
                            search(regex, npsn, kec, kot, prov);
                        }
                    }}
                />
                <input
                    type="text"
                    className="table_props_input"
                    placeholder="Provinsi..."
                    value={ prov || '' }
                    onChange={(e) => {
                        setProv(e.currentTarget.value);
                    }}
                    onBlur={() => {
                        search(regex, npsn, kec, kot, prov);
                    }}
                    onKeyDown={(event) => {
                        if(event.key === 'Enter') {
                            search(regex, npsn, kec, kot, prov);
                        }
                    }}
                />
            </div>
            <div>
                <button className="btn_tools" onClick={downloadAsCSV2}><FaTable/>Download as CSV</button>
                {!firstCur ? <p>Tunggu sebentar...</p> : null}
                <CSVLink data={dataList} filename={'Rekap_Data_Sekolah.csv'} ref={csvLink} target="_blank" className="hidden"/>
            </div>
        </div>
        <div className="utils">
            <div className="pagination">
                {/* <button onClick={() => setPageNum(0)} disabled={!isPrevious}>
                {'<<'}
                </button> */}
                <button onClick={() => setPageNum(pageNum-1)} disabled={!isPrevious}>
                {'<'}
                </button>
                <button onClick={() => setPageNum(pageNum+1)} disabled={!isNext}>
                {'>'}
                </button>
                {/* <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {'>>'}
                </button> */}
                <span>
                Page {' '}
                <strong>
                    {pageNum + 1}{/* of {pageOptions.length}*/}
                </strong>
                </span>
                <span>
                | Go to page:
                    <input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onBlur={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            setPageNum(page)
                        }}
                    />
                </span>
                {/* <select
                value={pageSize}
                onChange={e => {
                    setPageSize(Number(e.target.value))
                }}
                >
                {[20, 50, 100].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                    </option>
                ))}
                </select> */}
            </div>
        </div>
        <div className="table_container">
       <table {...getTableProps()}>
           <thead>
               {headerGroups.map(headerGroup => (
                   <>
                   <tr {...headerGroup.getHeaderGroupProps()}>
                       {headerGroup.headers.map(column => (
                           <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                               {column.render('Header')}
                                <span>
                                    {column.isSorted
                                    ? column.isSortedDesc
                                        ? (<BiCaretDown/>)
                                        : (<BiCaretUp/>)
                                    : ''}
                                </span>
                            </th>
                       ))}
                   </tr>
                   {/* <tr>
                        {headerGroup.headers.map(column => (
                            <th>{column.canFilter ? column.render('Filter') : null}</th>
                        ))}
                   </tr> */}
                   </>
               ))}
           </thead>
           <tbody {...getTableBodyProps()}>
                {page.map((row, i) => {
                    prepareRow(row)
                    return (
                        <Fragment key={row.getRowProps().key}>
                            <tr>
                                {row.cells.map(cell => {
                                    // console.log(cell);
                                    return <td {...cell.getCellProps()} className={(cell.value && !Array.isArray(cell.value)) || (Array.isArray(cell.value) && cell.value.length > 0) || cell.column.id === 'selection'
                                    || cell.column.id === 'rowNumber' ? "cell" : "cell"}> {cell.column.id !== 'rowNumber' ? 
                                         cell.render('Cell')
                                        : i + 1 + (pageIndex * pageSize)} </td>
                                })}
                            </tr>
                            {row.isExpanded ? (
                                <tr>
                                    <td colSpan={visibleColumns.length}>
                                        {/*
                                            Inside it, call our renderRowSubComponent function. In reality,
                                            you could pass whatever you want as props to
                                            a component like this, including the entire
                                            table instance. But for this example, we'll just
                                            pass the row
                                            */}
                                        {renderRowSubComponent({ row })}
                                    </td>
                                </tr>
                            ) : null}
                        </Fragment>
                    )
                })}
           </tbody>
       </table>
       </div>
       </>
    )
}

export default Table
