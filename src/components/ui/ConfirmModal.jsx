export default function ConfirmModal({ modal, close }) {
    if (!modal.open) return null
    return (
      <div className="confirmOverlay" onClick={close}>
        <div className="confirmBox" onClick={e => e.stopPropagation()}>
          <p>{modal.message}</p>
          <div className="actions">
            <button className="dangerBtn" onClick={() => { modal.onConfirm?.(); close() }}>Ha, o'chirish</button>
            <button className="secondary" onClick={close}>Bekor</button>
          </div>
        </div>
      </div>
    )
  }