import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceApi } from '../api/services'
import toast from 'react-hot-toast'
import InvoiceForm from '../components/invoices/InvoiceForm'
import { ArrowLeft } from 'lucide-react'

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => invoiceApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries(['invoices'])
      qc.invalidateQueries(['dashboard'])
      toast.success('Invoice created!')
      navigate(`/invoices/${res.data.data.id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create invoice'),
  })

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Create Invoice</h1>
          <p className="text-slate-500 text-sm">Fill in the details below</p>
        </div>
      </div>

      <InvoiceForm
        onSubmit={(data) => mutation.mutate(data)}
        loading={mutation.isPending}
      />
    </div>
  )
}
