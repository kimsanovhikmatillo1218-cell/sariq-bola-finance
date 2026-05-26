export default function Panel({ title, children }) {
    return (
      <div className="panel entrance">
        {title && <h2 className="panelTitle">{title}</h2>}
        {children}
      </div>
    )
  }