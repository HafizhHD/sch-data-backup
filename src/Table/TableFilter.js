import React from 'react'
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
// A great library for fuzzy filtering/sorting items
import {matchSorter} from 'match-sorter'

export function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
  }) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
      setGlobalFilter(value || undefined)
    }, 200)
  
    return (
      <span>
        Search:{' '}
        <input
          value={value || ""}
          onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={`${count} records...`}
          style={{
            fontSize: '1.1rem',
            border: '0',
          }}
        />
      </span>
    )
  }
  
  // Define a default UI for filtering
  export function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
  }) {
    const count = preFilteredRows.length
  
    return (
      <input
        value={filterValue || ''}
        onChange={e => {
          setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
        }}
        placeholder={`Search...`}
      />
    )
  }
  
  // This is a custom filter UI for selecting
  // a unique option from a list
  export function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
      const options = new Set()
      preFilteredRows.forEach(row => {
        if(row.values[id] !== undefined && !options.has(row.values[id])) options.add(row.values[id])
      })
      return [...options.values()]
    }, [id, preFilteredRows])
  
    // Render a multi-select box
    return (
      <select
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined)
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  // This is a custom filter UI for selecting
  // a unique option from a list
  export function SelectArrayColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
      const options = new Set()
      preFilteredRows.forEach(row => {
        console.log('ini row', row.values[id]);
        console.log('ini tipe row', row.values[id] instanceof Array)
        console.log('ini length row', row.values[id].length);
        if(row.values[id] instanceof Array && row.values[id].length > 0) {
          for(var i = 0; i< row.values[id].length; i++) {
            var x = row.values[id][i]
            if(x !== undefined && !options.has(x)) options.add(x)
          }
        }
      })
      return [...options.values()]
    }, [id, preFilteredRows])
  
    // Render a multi-select box
    return (
      <select
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined)
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }
  
  // This is a custom filter UI that uses a
  // slider to set the filter value between a column's
  // min and max values
  export function SliderColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) {
    // Calculate the min and max
    // using the preFilteredRows
  
    const [min, max] = React.useMemo(() => {
      let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
      let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
      preFilteredRows.forEach(row => {
        min = Math.min(row.values[id], min)
        max = Math.max(row.values[id], max)
      })
      return [min, max]
    }, [id, preFilteredRows])
  
    return (
      <>
        <input
          type="range"
          min={min}
          max={max}
          value={filterValue || min}
          onChange={e => {
            setFilter(parseInt(e.target.value, 10))
          }}
        />
        <button onClick={() => setFilter(undefined)}>Off</button>
      </>
    )
  }
  
  // This is a custom UI for our 'between' or number range
  // filter. It uses two number boxes and filters rows to
  // ones that have values between the two
  export function NumberRangeColumnFilter({
    column: { filterValue = [], preFilteredRows, setFilter, id },
  }) {
    const [min, max] = React.useMemo(() => {
      let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
      let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
      preFilteredRows.forEach(row => {
        min = Math.min(row.values[id], min)
        max = Math.max(row.values[id], max)
      })
      return [min, max]
    }, [id, preFilteredRows])
  
    return (
      <div
        style={{
          display: 'flex',
        }}
      >
        <input
          value={filterValue[0] || ''}
          type="number"
          onChange={e => {
            const val = e.target.value
            setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
          }}
          min={min}
          placeholder={`Min (${min})`}
          style={{
            width: '70px',
            marginRight: '0.5rem',
          }}
        />
        to
        <input
          value={filterValue[1] || ''}
          type="number"
          onChange={e => {
            const val = e.target.value
            setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
          }}
          min={min}
          placeholder={`Max (${max})`}
          style={{
            width: '70px',
            marginLeft: '0.5rem',
          }}
        />
      </div>
    )
  }

  export function DateRangeColumnFilter({
    column: { filterValue = [], preFilteredRows, setFilter, id }}) 
  {
    const [min, max] = React.useMemo(() => {
        let min = new Date('2022-08-13')
        let max = new Date()
        max.setFullYear(max.getFullYear() + 1)
        preFilteredRows.forEach(row => {
            min = row.values[id] ? new Date(row.values[id]) <= min ? new Date(row.values[id]) : min : min
            max = row.values[id] ? new Date(row.values[id]) >= max ? new Date(row.values[id]) : max : max
        });
        return [min, max];
    }, [id, preFilteredRows]);
    // console.log(min, max)
    return (
        <div
            style={{
                display: "flex"
            }}
        >
            <input
                value={filterValue[0] || min.toISOString().slice(0, 10)}
                type="date"
                min={min.toISOString().slice(0, 10)}
                max={filterValue[1] || max.toISOString().slice(0, 10)}
                onChange={e => {
                    const val = e.target.value;
                    // console.log(e.target.value);
                    setFilter((old = []) => [val ? (val) : undefined, old[1]]);
                }}
                style={{
                    width: "130px",
                    marginRight: "0.2rem"
                }}
            />
            to
      <input
                value={filterValue[1] || max.toISOString().slice(0, 10)}
                type="date"
                min={filterValue[0] || min.toISOString().slice(0, 10)}
                max={max.toISOString().slice(0, 10)}
                onChange={e => {
                    const val = e.target.value;
                    setFilter((old = []) => [old[0], val ? (val) : undefined]);
                }}
                style={{
                    width: "130px",
                    marginLeft: "0.2rem"
                }}
            />
        </div>
    );
}

  export function filterGreaterThanOrEqual(rows, id, filterValue) {
    return rows.filter(row => {
      const rowValue = row.values[id]
      return rowValue >= filterValue
    })
  }

  export function filterLessThanOrEqual(rows, id, filterValue) {
    return rows.filter(row => {
      const rowValue = row.values[id]
      return rowValue <= filterValue
    })
  }
  
  export function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
  }
  
  // Let the table remove the filter if the string is empty
  fuzzyTextFilterFn.autoRemove = val => !val

  export function dateBetweenFilterFn(rows, id, filterValues) {
    let sd = new Date(filterValues[0]);
    let ed = new Date(filterValues[1]);
    // console.log(rows, id, filterValues)
    return rows.filter(r => {
        var time = new Date(r.values[id]);
        // console.log(time, ed, sd)
        if (filterValues.length === 0) return rows;
        return (time >= sd && time <= ed);
    });
}

dateBetweenFilterFn.autoRemove = val => !val;
  