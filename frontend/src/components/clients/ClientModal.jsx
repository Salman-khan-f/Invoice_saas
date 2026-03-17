import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { clientApi } from '../../api/services'
import toast from 'react-hot-toast'
import { X, User, Loader2 } from 'lucide-react'

export default function ClientModal({ client, onClose, onSuccess }) {
  const isEdit = !!client

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: client || {}
  })

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? clientApi.update(client.id, data) : clientApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Client updated!' : 'Client created!')
      onSuccess()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save client'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-900/40 flex items-center justify-center">
              <User size={16} className="text-primary-400" />
            </div>
            <h2 className="font-semibold text-white">{isEdit ? 'Edit Client' : 'New Client'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Jane Doe"
                {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Company Name</label>
              <input className="input" placeholder="Acme Corp"
                {...register('companyName')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="jane@acme.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 234 567 8900"
                {...register('phone')} />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input className="input" placeholder="123 Main Street"
              {...register('address')} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">City</label>
              <input className="input" placeholder="New York"
                {...register('city')} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input" placeholder="NY"
                {...register('state')} />
            </div>
            <div>
              <label className="label">ZIP</label>
              <input className="input" placeholder="10001"
                {...register('zipCode')} />
            </div>
          </div>

          <div>
            <label className="label">Country</label>
            <input className="input" placeholder="United States"
              {...register('country')} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea rows={2} className="input resize-none" placeholder="Any notes about this client..."
              {...register('notes')} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <User size={15} />}
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
