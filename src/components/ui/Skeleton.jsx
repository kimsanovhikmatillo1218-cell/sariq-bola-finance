/* Premium skeleton loading components */
export function SkeletonBlock({ w = '100%', h = 16, r = 8, mb = 0 }) {
  return (
    <div className="skeletonBlock" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
  )
}

export function SkeletonCard() {
  return (
    <div className="skeletonCard">
      <div className="skeletonCardIcon skeletonBlock" style={{ width:46, height:46, borderRadius:14, flexShrink:0 }} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        <SkeletonBlock h={11} w="55%" />
        <SkeletonBlock h={24} w="80%" r={6} />
        <SkeletonBlock h={10} w="40%" />
      </div>
    </div>
  )
}

export function SkeletonChartBox() {
  return (
    <div className="chartBox skeletonChartBox">
      <SkeletonBlock h={18} w="45%" mb={18} r={6} />
      {[85, 60, 45, 72, 30].map((w, i) => (
        <div key={i} className="chartRow" style={{ marginBottom: 10 }}>
          <SkeletonBlock h={13} w={60} r={6} />
          <div style={{ flex:1, margin:'0 10px' }}>
            <SkeletonBlock h={14} w={`${w}%`} r={99} />
          </div>
          <SkeletonBlock h={13} w={55} r={6} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTableRow({ cols = 6 }) {
  return (
    <tr className="skeletonRow">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <SkeletonBlock h={14} w={i === 0 ? '70%' : i === cols-1 ? 60 : '85%'} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="dash">
      <div className="dashKpiGrid">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="dashChartsGrid">
        <SkeletonChartBox />
        <SkeletonChartBox />
      </div>
    </div>
  )
}
