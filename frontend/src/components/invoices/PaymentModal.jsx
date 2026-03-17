import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { invoiceApi } from '../../api/services'
import toast from 'react-hot-toast'
import { X, DollarSign, Loader2 } from 'lucide-react'

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'Cash', 'Cheque', 'PayPal', 'Stripe', 'Other']

export default function PaymentModal({ invoice, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      amount: parseFloat(invoice.balanceDue || 0).toFixed(2),
      paymentMethod: 'Bank Transfer',
    }
  })

  const mutation = useMutation({
    mutationFn: (data) => invoiceApi.addPayment(invoice.id, data),
    onSuccess: () => {
      toast.success('Payment recorded!')
      onSuccess()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Payment failed'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-900/40 flex items-center justify-center">
              <DollarSign size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">Record Payment</h2>
              <p className="text-xs text-slate-500">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-5 space-y-4">
          <div>
            <label className="label">Amount *</label>
            <input type="number" step="0.01" min="0.01" className="input"
              {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })} />
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
            <p className="text-xs text-slate-500 mt-1">Balance due: ${parseFloat(invoice.balanceDue || 0).toFixed(2)}</p>
          </div>

          <div>
            <label className="label">Payment Date *</label>
            <input type="date" className="input"
              {...register('paymentDate', { required: 'Date is required' })} />
          </div>

          <div>
            <label className="label">Payment Method *</label>
            <select className="input" {...register('paymentMethod', { required: true })}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Reference / Transaction ID</label>
            <input className="input" placeholder="Optional reference number"
              {...register('reference')} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea rows={2} className="input resize-none" placeholder="Optional notes"
              {...register('notes')} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
              {mutation.isPending ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
