import { memo, useMemo, useRef, useState } from 'react'
import { createApexGrid, type ApexGridElement } from 'react-apex-grid'
import type { ColumnConfiguration } from 'apex-grid'
import type { Holding, SectorData } from '../types'
import { fmtINR, fmtPct, glClass } from '../utils/format'

// Typed grid created once at module scope
const HoldingGrid = createApexGrid<Holding>()

// apex-grid 3.5 formatter / cellClasses callback shape
type FmtParams = { value: unknown; record: Holding }

interface Props {
  name: string
  sector: SectorData
}

function SectorSectionInner({ name, sector }: Props) {
  const [open, setOpen] = useState(true)
  // apex-grid ref must be typed to ApexGridElement<T>
  const gridRef = useRef<ApexGridElement<Holding>>(null)

  const { totalInvestment, totalPresentValue, totalGainLoss, stocks } = sector
  const glPct = totalInvestment > 0 ? ((totalGainLoss / totalInvestment) * 100) : 0

  const columns = useMemo<ColumnConfiguration<Holding>[]>(() => [
    {
      key: 'name',
      headerText: 'Particulars',
      width: '180px',
      pin: 'start',
      sort: true,
      filter: true,
    },
    {
      key: 'exchange',
      headerText: 'Exchange',
      width: '90px',
      sort: true,
    },
    {
      key: 'purchasePrice',
      headerText: 'Buy Price',
      dataType: 'number',
      width: '100px',
      sort: true,
      formatter: ({ value }: FmtParams) =>
        value != null ? `₹${Number(value).toFixed(2)}` : '—',
    },
    {
      key: 'quantity',
      headerText: 'Qty',
      dataType: 'number',
      width: '70px',
      sort: true,
    },
    {
      key: 'investment',
      headerText: 'Investment',
      dataType: 'number',
      width: '120px',
      sort: true,
      formatter: ({ value }: FmtParams) =>
        value != null ? fmtINR(Number(value), true) : '—',
    },
    {
      key: 'portfolioPercent',
      headerText: 'Port %',
      dataType: 'number',
      width: '80px',
      sort: true,
      formatter: ({ value }: FmtParams) =>
        value != null ? `${Number(value).toFixed(2)}%` : '—',
    },
    {
      key: 'cmp',
      headerText: 'CMP',
      dataType: 'number',
      width: '100px',
      sort: true,
      formatter: ({ value }: FmtParams) =>
        value != null ? `₹${Number(value).toFixed(2)}` : '—',
    },
    {
      key: 'presentValue',
      headerText: 'Present Value',
      dataType: 'number',
      width: '120px',
      sort: true,
      formatter: ({ value }: FmtParams) =>
        value != null ? fmtINR(Number(value), true) : '—',
    },
    {
      key: 'gainloss',
      headerText: 'Gain/Loss',
      dataType: 'number',
      width: '130px',
      sort: true,
      formatter: ({ value, record }: FmtParams) => {
        if (value == null) return '—'
        const n = Number(value)
        const pct = record?.gainlossPercentage ?? 0
        const sign = n >= 0 ? '+' : ''
        return `${sign}${fmtINR(n, true)} (${fmtPct(pct)})`
      },
      cellClasses: ({ value }: FmtParams) => {
        const n = Number(value ?? 0)
        return n > 0 ? 'gain' : n < 0 ? 'loss' : 'neutral'
      },
    },
    {
      key: 'peRatio',
      headerText: 'P/E',
      dataType: 'number',
      width: '80px',
      sort: true,
      formatter: ({ value }: FmtParams) =>
        value != null ? Number(value).toFixed(2) : 'N/A',
    },
    {
      key: 'latestEarnings',
      headerText: 'EPS',
      dataType: 'number',
      width: '80px',
      sort: true,
      formatter: ({ value }: FmtParams) =>
        value != null ? `₹${Number(value).toFixed(2)}` : 'N/A',
    },
  ], [])

  return (
    <div className="sector-block">
      {/* Collapsible header */}
      <div
        className={`sector-header ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
      >
        <svg className="sector-header__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>

        <span className="sector-header__name">{name}</span>

        <div className="sector-header__stats">
          <div className="sector-header__stat">
            <span className="sector-header__stat-label">Stocks</span>
            <span className="sector-header__stat-value">{stocks.length}</span>
          </div>
          <div className="sector-header__stat">
            <span className="sector-header__stat-label">Invested</span>
            <span className="sector-header__stat-value">{fmtINR(totalInvestment, true)}</span>
          </div>
          <div className="sector-header__stat">
            <span className="sector-header__stat-label">Present Value</span>
            <span className="sector-header__stat-value">{fmtINR(totalPresentValue, true)}</span>
          </div>
          <div className={`sector-header__stat ${glClass(totalGainLoss)}`}>
            <span className="sector-header__stat-label">Gain / Loss</span>
            <span className="sector-header__stat-value">
              {totalGainLoss >= 0 ? '+' : ''}{fmtINR(totalGainLoss, true)} ({fmtPct(glPct, 1)})
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {open && (
        <div className="sector-grid-wrap">
          <HoldingGrid
            ref={gridRef}
            data={stocks}
            columns={columns}
            style={{ height: Math.min(400, 42 + stocks.length * 36) }}
          />
        </div>
      )}
    </div>
  )
}

export const SectorSection = memo(SectorSectionInner)
