import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceApi } from '../api/services'
import toast from 'react-hot-toast'
import InvoiceForm from '../components/invoices/InvoiceForm'
import { ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function EditInvoicePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getById(id).then(r => r.data.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => invoiceApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['invoices'])
      qc.invalidateQueries(['invoice', id])
      toast.success('Invoice updated!')
      navigate(`/invoices/${id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update invoice'),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Edit Invoice</h1>
          <p className="text-slate-500 text-sm font-mono">{invoice?.invoiceNumber}</p>
        </div>
      </div>

      <InvoiceForm
        invoice={invoice}
        onSubmit={(data) => mutation.mutate(data)}
        loading={mutation.isPending}
      />
    </div>
  )
}
