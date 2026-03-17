import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <Loader2 size={32} className="animate-spin text-primary-500" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}
