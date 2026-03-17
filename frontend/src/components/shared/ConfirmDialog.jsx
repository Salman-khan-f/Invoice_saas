import { AlertTriangle, Loader2 } from 'lucide-react'

export default function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl animate-fadeIn">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1 justify-center">
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
