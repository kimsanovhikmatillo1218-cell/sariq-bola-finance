export default function BranchSelector({ allowedBranches, branch, setBranch, tr }) {
    if (!allowedBranches.length) return null
    return (
      <div className="branches">
        {allowedBranches.map(b => (
          <button key={b.id} className={branch === b.id ? 'active' : ''} onClick={() => setBranch(b.id)}>
            {b.name}
          </button>
        ))}
        {allowedBranches.length > 1 && (
          <button className={branch === 'ALL' ? 'active' : ''} onClick={() => setBranch('ALL')}>
            {tr.all}
          </button>
        )}
      </div>
    )
  }