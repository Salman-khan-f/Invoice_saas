import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceApi } from '../api/services'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit2, Download, Send, Plus, DollarSign, Calendar, User, FileText } from 'lucide-react'
import { formatCurrency, getStatusBadge, formatDate } from '../utils/helpers'
import PaymentModal from '../components/invoices/PaymentModal'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [paymentOpen, setPaymentOpen] = useState(false)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getById(id).then(r => r.data.data),
  })

  const downloadPdf = async () => {
    try {
      const res = await invoiceApi.downloadPdf(id)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url
      a.download = `${invoice.invoiceNumber}.pdf`; a.click()
      URL.revokeObjectURL(url); toast.success('PDF downloaded')
    } catch { toast.error('Download failed') }
  }

  const sendEmail = async () => {
    try {
      await invoiceApi.sendEmail(id)
      toast.success('Invoice sent to client!')
    } catch { toast.error('Failed to send email') }
  }

  if (isLoading) return <LoadingSpinner />
  if (!invoice) return null

  const client = invoice.clientSnapshot || {}
  const currSymbol = invoice.currency === 'EUR' ? '€' : invoice.currency === 'GBP' ? '£' : '$'

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title font-mono">{invoice.invoiceNumber}</h1>
            <span className={getStatusBadge(invoice.status)}>{invoice.status}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button onClick={() => setPaymentOpen(true)} className="btn-primary">
              <DollarSign size={15} /> Record Payment
            </button>
          )}
          <button onClick={downloadPdf} className="btn-secondary">
            <Download size={15} /> PDF
          </button>
          <button onClick={sendEmail} className="btn-secondary">
            <Send size={15} /> Email
          </button>
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Link to={`/invoices/${id}/edit`} className="btn-secondary">
              <Edit2 size={15} /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main invoice */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client + dates */}
          <div className="card p-5 grid grid-cols-2 gap-5">
            <div>
              <p className="section-title mb-2">Bill To</p>
              <p className="font-semibold text-slate-200">{client.name}</p>
              {client.companyName && <p className="text-sm text-slate-400">{client.companyName}</p>}
              <p className="text-sm text-slate-400 mt-1">{client.email}</p>
              {client.phone && <p className="text-sm text-slate-500">{client.phone}</p>}
              {client.address && <p className="text-sm text-slate-500 mt-1">{client.address}</p>}
            </div>
            <div className="space-y-3">
              <div>
                <p className="section-title">Issue Date</p>
                <p className="text-sm text-slate-300 mt-1">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="section-title">Due Date</p>
                <p className="text-sm text-slate-300 mt-1">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="section-title">Currency</p>
                <p className="text-sm text-slate-300 mt-1">{invoice.currency || 'USD'}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Item / Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Tax</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map(item => (
                  <tr key={item.id}>
                    <td>
                      <p className="font-medium text-slate-200">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                    </td>
                    <td className="text-right text-slate-300">{item.quantity}</td>
                    <td className="text-right text-slate-300">{currSymbol}{parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td className="text-right text-slate-400">{item.taxRate}%</td>
                    <td className="text-right font-semibold">{currSymbol}{parseFloat(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end px-5 py-4 border-t border-slate-800">
              <div className="w-56 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-200">{currSymbol}{parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax</span>
                  <span className="text-slate-200">{currSymbol}{parseFloat(invoice.taxAmount || 0).toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Discount</span>
                    <span className="text-red-400">-{currSymbol}{parseFloat(invoice.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-700">
                  <span className="text-white">Total</span>
                  <span className="text-primary-400">{currSymbol}{parseFloat(invoice.total || 0).toFixed(2)}</span>
                </div>
                {invoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Paid</span>
                      <span className="text-emerald-400">{currSymbol}{parseFloat(invoice.paidAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-amber-400">Balance Due</span>
                      <span className="text-amber-400">{currSymbol}{parseFloat(invoice.balanceDue || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {invoice.notes && (
                <div>
                  <p className="section-title mb-1.5">Notes</p>
                  <p className="text-sm text-slate-400">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="section-title mb-1.5">Terms</p>
                  <p className="text-sm text-slate-400">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="card p-5">
            <p className="section-title mb-3">Payment Summary</p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Total</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Paid</span>
                <span className="text-sm font-semibold text-emerald-400">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-sm font-medium text-amber-400">Balance</span>
                <span className="text-sm font-bold text-amber-400">{formatCurrency(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {(invoice.payments || []).length > 0 && (
            <div className="card p-5">
              <p className="section-title mb-3">Payment History</p>
              <div className="space-y-3">
                {invoice.payments.map(p => (
                  <div key={p.id} className="bg-slate-800/50 rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-emerald-400">{formatCurrency(p.amount)}</span>
                      <span className="text-xs text-slate-500">{formatDate(p.paymentDate)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.paymentMethod}
                      {p.reference ? ` · ${p.reference}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {paymentOpen && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setPaymentOpen(false)}
          onSuccess={() => {
            setPaymentOpen(false)
            qc.invalidateQueries(['invoice', id])
            qc.invalidateQueries(['invoices'])
            qc.invalidateQueries(['dashboard'])
          }}
        />
      )}
    </div>
  )
}
