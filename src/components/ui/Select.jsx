export default function Select({ label, value, set, opts, display }) {
    return (
      <div className="field">
        <label>{label}</label>
        <select value={value ?? ''} onChange={e => set(e.target.value)}>
          {opts.map(o => <option key={o} value={o}>{display ? display(o) : o}</option>)}
        </select>
      </div>
    )
  }