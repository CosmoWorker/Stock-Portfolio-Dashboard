import Chart from 'react-apexcharts'
import type { SectorData } from '../types'

interface Props {
  sectors: Record<string, SectorData>
}

export function SectorBars({ sectors }: Props) {
  const entries = Object.entries(sectors)
    .map(([name, s]) => ({ name, gl: s.totalGainLoss }))
    .sort((a, b) => b.gl - a.gl) // best to worst

  const categories = entries.map(e => e.name)
  const values = entries.map(e => e.gl)

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { enabled: true, speed: 500 },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
        colors: {
          ranges: [
            { from: -Infinity, to: -0.01, color: '#dc2626' },
            { from: 0, to: Infinity, color: '#16a34a' },
          ],
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        const n = Number(val)
        const abs = Math.abs(n)
        const sign = n >= 0 ? '+' : '-'
        if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`
        return `${sign}₹${abs.toLocaleString('en-IN')}`
      },
      style: {
        fontSize: '11px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories,
      labels: {
        formatter: (val) => {
          const n = Number(val)
          const abs = Math.abs(n)
          if (abs >= 1_00_000) return `₹${(abs / 1_00_000).toFixed(1)}L`
          return `₹${abs.toLocaleString('en-IN')}`
        },
        style: { fontFamily: 'Inter, sans-serif', fontSize: '11px' },
      },
    },
    yaxis: {
      labels: {
        style: { fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500' },
      },
    },
    grid: {
      borderColor: '#e4e7ec',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) =>
          val >= 0
            ? `+₹${val.toLocaleString('en-IN')}`
            : `-₹${Math.abs(val).toLocaleString('en-IN')}`,
      },
    },
  }

  const series = [{ name: 'Gain / Loss', data: values }]

  return (
    <div className="card">
      <div className="chart-card__title">Sector Gain / Loss</div>
      <Chart
        type="bar"
        height={320}
        width="100%"
        options={options}
        series={series}
      />
    </div>
  )
}
