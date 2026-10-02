import Chart from 'react-apexcharts'
import type { Summary } from '../types'
import { fmtINR, fmtPct, fmtTime, glClass } from '../utils/format'

interface Props {
  summary: Summary
  history: number[]
  updatedAt: Date | null
  source: 'live' | 'cache' | null
}

export function HeadlineBand({ summary, history, updatedAt, source }: Props) {
  const { totalPresentValue, totalGainLoss, totalGainLossPercentage } = summary
  const gl = totalGainLoss

  const sparkOptions: ApexCharts.ApexOptions = {
    chart: {
      id: 'pv-sparkline',
      type: 'line',
      sparkline: { enabled: true },
      animations: { enabled: true, speed: 400 },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: [gl >= 0 ? '#16a34a' : '#dc2626'],
    },
    tooltip: {
      enabled: true,
      fixed: { enabled: false },
      x: { show: false },
      y: {
        formatter: (val) => fmtINR(val, true),
      },
      marker: { show: false },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0,
        colorStops: [{
          offset: 0,
          color: gl >= 0 ? '#16a34a' : '#dc2626',
          opacity: 0.25,
        }, {
          offset: 100,
          color: gl >= 0 ? '#16a34a' : '#dc2626',
          opacity: 0,
        }],
      },
    },
  }

  const sparkSeries = [{ name: 'Portfolio Value', data: history }]

  return (
    <div className="card headline-band">
      <div className="headline-band__left">
        <div className="headline-band__pv">{fmtINR(totalPresentValue)}</div>
        <div className="headline-band__meta">
          <span className={`headline-band__gl ${glClass(gl)}`}>
            {gl >= 0 ? '+' : ''}{fmtINR(gl, true)}&nbsp;
            <span style={{ fontWeight: 400 }}>({fmtPct(totalGainLossPercentage)})</span>
          </span>
          {updatedAt && (
            <span className="headline-band__updated">
              Updated {fmtTime(updatedAt)}
            </span>
          )}
          {source && (
            <span className={`badge badge--${source}`}>{source}</span>
          )}
        </div>
      </div>

      <div className="headline-band__sparkline">
        {history.length > 1 ? (
          <Chart
            type="area"
            height={60}
            width="100%"
            options={sparkOptions}
            series={sparkSeries}
          />
        ) : (
          <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: 12 }}>
            Collecting data…
          </div>
        )}
      </div>
    </div>
  )
}
