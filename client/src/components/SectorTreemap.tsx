import Chart from 'react-apexcharts'
import type { SectorData } from '../types'
import { gainLossColor } from '../utils/format'

interface Props {
  sectors: Record<string, SectorData>
}

export function SectorTreemap({ sectors }: Props) {
  // One series per sector; each stock is a data point sized by presentValue, coloured by gainlossPercentage
  const series = Object.entries(sectors).map(([sectorName, sec]) => ({
    name: sectorName,
    data: sec.stocks.map(s => ({
      x: s.name,
      y: s.presentValue,
      fillColor: gainLossColor(s.gainlossPercentage),
    })),
  }))

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'treemap',
      toolbar: { show: false },
      animations: { enabled: true, speed: 500 },
    },
    dataLabels: {
      enabled: true,
      formatter: (text) => String(text),
      style: {
        fontSize: '11px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        colors: ['#fff'],
      },
    },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
      },
    },
    legend: { show: false },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val, { seriesIndex, dataPointIndex }) => {
          const stock = Object.values(sectors)[seriesIndex]?.stocks[dataPointIndex]
          if (!stock) return `₹${val}`
          const sign = stock.gainlossPercentage >= 0 ? '+' : ''
          return `₹${val.toLocaleString('en-IN')} (${sign}${stock.gainlossPercentage.toFixed(2)}%)`
        },
      },
    },
  }

  return (
    <div className="card">
      <div className="chart-card__title">Portfolio Treemap — sized by value, coloured by gain/loss</div>
      <Chart
        type="treemap"
        height={320}
        width="100%"
        options={options}
        series={series}
      />
    </div>
  )
}
