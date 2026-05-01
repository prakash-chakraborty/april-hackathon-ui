export default function DonutChart({ value }) {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  const pct = Math.min(Math.max(num, 0), 100)
  const arcLen = Math.PI * 50
  const filled = (pct / 100) * arcLen

  return (
    <div className="gauge-chart">
      <svg width={130} height={82} viewBox="0 0 130 82">
        <path
          d="M 15 68 A 50 50 0 0 1 115 68"
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d="M 15 68 A 50 50 0 0 1 115 68"
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={10}
          strokeDasharray={`${filled} ${arcLen}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="gauge-pct">{pct}%</span>
      <div className="gauge-range">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
