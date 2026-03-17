import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { invoiceApi } from '../api/services'
import toast from 'react-hot-toast'
import { Plus, Search, Eye, Download, Trash2, Send, FileText, Filter } from 'lucide-react'
import { formatCurrency, getStatusBadge, formatDate } from '../utils/helpers'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ConfirmDialog from '../components/shared/ConfirmDialog'

const STATUSES = ['ALL', 'PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'DRAFT', 'CANCELLED']

export default function InvoicesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [deleteId, setDeleteId] = useState(null)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceApi.getAll().then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => invoiceApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['invoices']); toast.success('Invoice cancelled'); setDeleteId(null) },
    onError: () => toast.error('Failed to delete invoice'),
  })

  const downloadPdf = async (id, invoiceNumber) => {
    try {
      const res = await invoiceApi.downloadPdf(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = `${invoiceNumber}.pdf`
      a.click(); URL.revokeObjectURL(url)
      toast.success('PDF downloaded')
    } catch { toast.error('Failed to download PDF') }
  }

  const sendEmail = async (id) => {
    try {
      await invoiceApi.sendEmail(id)
      toast.success('Invoice sent to client!')
    } catch { toast.error('Failed to send email') }
  }

  const filtered = invoices.filter(inv => {
    const matchSearch =
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientSnapshot?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="animate-fadeIn space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="text-slate-500 text-sm mt-0.5">{invoices.length} total invoices</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-10" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No invoices found</p>
          <Link to="/invoices/new" className="btn-primary mx-auto mt-5">
            <Plus size={15} /> Create Invoice
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <Link to={`/invoices/${inv.id}`}
                      className="font-mono text-xs font-semibold text-primary-400 hover:text-primary-300">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium text-slate-200">{inv.clientSnapshot?.name || '—'}</div>
                    {inv.clientSnapshot?.companyName && (
                      <div className="text-xs text-slate-500">{inv.clientSnapshot.companyName}</div>
                    )}
                  </td>
                  <td className="text-slate-400 text-xs">{formatDate(inv.issueDate)}</td>
                  <td className="text-slate-400 text-xs">{formatDate(inv.dueDate)}</td>
                  <td className="font-semibold">{formatCurrency(inv.total)}</td>
                  <td className={inv.balanceDue > 0 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                    {formatCurrency(inv.balanceDue)}
                  </td>
                  <td><span className={getStatusBadge(inv.status)}>{inv.status}</span></td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/invoices/${inv.id}`}
                        className="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors" title="View">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => downloadPdf(inv.id, inv.invoiceNumber)}
                        className="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors" title="Download PDF">
                        <Download size={14} />
                      </button>
                      <button onClick={() => sendEmail(inv.id)}
                        className="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-primary-400 transition-colors" title="Send Email">
                        <Send size={14} />
                      </button>
                      <button onClick={() => setDeleteId(inv.id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-900/30 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors" title="Cancel">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Cancel Invoice"
          message="Are you sure you want to cancel this invoice?"
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
