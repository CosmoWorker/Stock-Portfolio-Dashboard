import './index.css'
import { usePortfolio } from './hooks/usePortfolio'
import { HeadlineBand } from './components/HeadlineBand'
import { SectorTreemap } from './components/SectorTreemap'
import { SectorBars } from './components/SectorBars'
import { SectorSection } from './components/SectorSection'

export default function App() {
  const { data, history, updatedAt, source, loading, error } = usePortfolio()

  // First-load spinner
  if (loading && !data) {
    return (
      <div className="state-full">
        <div className="spinner" />
        <span>Fetching portfolio…</span>
      </div>
    )
  }

  // Hard error (no data at all yet)
  if (error && !data) {
    return (
      <div className="state-full">
        <div className="error-banner">⚠ {error}</div>
        <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          Make sure the server is running on port 3000.
        </span>
      </div>
    )
  }

  if (!data) return null

  const sectorEntries = Object.entries(data.sectors)

  return (
    <div className="dashboard">
      {/* Headline */}
      <HeadlineBand
        summary={data.summary}
        history={history}
        updatedAt={updatedAt}
        source={source}
      />

      {/* Charts row */}
      <div className="charts-row">
        <SectorTreemap sectors={data.sectors} />
        <SectorBars sectors={data.sectors} />
      </div>

      {/* Sector grids */}
      <div className="sectors">
        {sectorEntries.map(([name, sector]) => (
          <SectorSection key={name} name={name} sector={sector} />
        ))}
      </div>
    </div>
  )
}
