import { useApp } from '../state/AppState.jsx'

export default function Toast() {
  const { toast } = useApp()
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className="toast">
          {toast.text}
        </div>
      )}
    </div>
  )
}
