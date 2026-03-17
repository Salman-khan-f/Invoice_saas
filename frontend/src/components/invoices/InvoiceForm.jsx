import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { clientApi } from '../../api/services'
import { Plus, Trash2, Loader2 } from 'lucide-react'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']

export default function InvoiceForm({ invoice, onSubmit, loading }) {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.getAll().then(r => r.data.data),
  })

  const today = new Date().toISOString().split('T')[0]
  const defaultDue = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: invoice ? {
      clientId: invoice.clientId,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      currency: invoice.currency || 'USD',
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      discount: invoice.discount || '',
      items: invoice.items?.map(i => ({
        name: i.name,
        description: i.description || '',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxRate: i.taxRate || 0,
      })) || [{ name: '', description: '', quantity: 1, unitPrice: '', taxRate: 0 }],
    } : {
      issueDate: today,
      dueDate: defaultDue,
      currency: 'USD',
      items: [{ name: '', description: '', quantity: 1, unitPrice: '', taxRate: 0 }],
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchItems = watch('items')
  const watchDiscount = watch('discount')

  const calcSubtotal = () =>
    (watchItems || []).reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unitPrice) || 0
      return sum + qty * price
    }, 0)

  const calcTax = () =>
    (watchItems || []).reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unitPrice) || 0
      const tax = parseFloat(item.taxRate) || 0
      return sum + (qty * price * tax) / 100
    }, 0)

  const subtotal = calcSubtotal()
  const tax = calcTax()
  const discount = parseFloat(watchDiscount) || 0
  const total = subtotal + tax - discount

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Client + Dates */}
      <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Client *</label>
          <select className="input" {...register('clientId', { required: 'Select a client' })}>
            <option value="">— Select Client —</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.companyName ? ` (${c.companyName})` : ''}</option>
            ))}
          </select>
          {errors.clientId && <p className="text-red-400 text-xs mt-1">{errors.clientId.message}</p>}
        </div>
        <div>
          <label className="label">Issue Date *</label>
          <input type="date" className="input" {...register('issueDate', { required: true })} />
        </div>
        <div>
          <label className="label">Due Date *</label>
          <input type="date" className="input" {...register('dueDate', { required: true })} />
        </div>
        <div>
          <label className="label">Currency</label>
          <select className="input" {...register('currency')}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-slate-200">Line Items</h2>
          <button type="button" onClick={() => append({ name: '', description: '', quantity: 1, unitPrice: '', taxRate: 0 })}
            className="btn-secondary text-xs py-1.5 px-3">
            <Plus size={14} /> Add Item
          </button>
        </div>

        <div className="divide-y divide-slate-800/50">
          {fields.map((field, idx) => {
            const qty = parseFloat(watchItems?.[idx]?.quantity) || 0
            const price = parseFloat(watchItems?.[idx]?.unitPrice) || 0
            const taxPct = parseFloat(watchItems?.[idx]?.taxRate) || 0
            const lineTotal = qty * price * (1 + taxPct / 100)
            return (
              <div key={field.id} className="p-5">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="label">Item Name *</label>
                    <input className="input" placeholder="Service or product name"
                      {...register(`items.${idx}.name`, { required: 'Required' })} />
                    {errors.items?.[idx]?.name && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                  <div className="col-span-12 sm:col-span-7">
                    <label className="label">Description</label>
                    <input className="input" placeholder="Optional description"
                      {...register(`items.${idx}.description`)} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="label">Qty *</label>
                    <input type="number" step="0.01" min="0.01" className="input"
                      {...register(`items.${idx}.quantity`, { required: true, min: 0.01 })} />
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <label className="label">Unit Price *</label>
                    <input type="number" step="0.01" min="0" className="input" placeholder="0.00"
                      {...register(`items.${idx}.unitPrice`, { required: true, min: 0 })} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="label">Tax %</label>
                    <input type="number" step="0.1" min="0" max="100" className="input"
                      {...register(`items.${idx}.taxRate`)} />
                  </div>
                  <div className="col-span-10 sm:col-span-3 flex items-end">
                    <div className="input bg-slate-800/30 text-right font-semibold text-primary-400">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-2 flex items-end justify-end">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)}
                        className="w-9 h-9 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 flex items-center justify-center transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Totals */}
        <div className="flex justify-end px-5 py-4 border-t border-slate-800 bg-slate-900/50">
          <div className="w-56 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tax</span>
              <span className="text-slate-200">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-400">Discount</span>
              <input type="number" step="0.01" min="0" className="input w-24 text-right py-1 text-sm"
                placeholder="0.00" {...register('discount')} />
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-700">
              <span className="text-white">Total</span>
              <span className="text-primary-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Notes</label>
          <textarea rows={3} className="input resize-none" placeholder="Add any notes for your client..."
            {...register('notes')} />
        </div>
        <div>
          <label className="label">Terms & Conditions</label>
          <textarea rows={3} className="input resize-none" placeholder="Payment terms, late fees, etc."
            {...register('terms')} />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <button type="submit" disabled={loading} className="btn-primary px-8">
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}
