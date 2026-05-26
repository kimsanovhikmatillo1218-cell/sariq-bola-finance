export default function Field({ label, value, set, type = 'text', text }) {
    return (
      <div className="field">
        <label>{label}</label>
        {text
          ? <textarea value={value ?? ''} onChange={e => set(e.target.value)} placeholder={label} />
          : <input type={type} value={value ?? ''} onChange={e => set(e.target.value)} placeholder={label} />
        }
      </div>
    )
  }