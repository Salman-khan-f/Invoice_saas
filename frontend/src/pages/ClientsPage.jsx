import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApi } from '../api/services'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, User, Building2, Mail, Phone, Loader2 } from 'lucide-react'
import ClientModal from '../components/clients/ClientModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function ClientsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.getAll().then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => clientApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(['clients'])
      toast.success('Client deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete client'),
  })

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="animate-fadeIn space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditClient(null); setModalOpen(true) }}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-10" placeholder="Search clients..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <User size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No clients found</p>
          <p className="text-slate-600 text-sm mt-1">Add your first client to get started</p>
          <button className="btn-primary mx-auto mt-5" onClick={() => { setEditClient(null); setModalOpen(true) }}>
            <Plus size={15} /> Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => (
            <div key={client.id} className="card p-5 hover:border-slate-700 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {client.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">{client.name}</h3>
                    {client.companyName && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={11} />{client.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditClient(client); setModalOpen(true) }}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-primary-900/40 hover:text-primary-400 text-slate-400 flex items-center justify-center transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(client.id)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-900/40 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-slate-400 flex items-center gap-2">
                  <Mail size={13} className="text-slate-600 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </p>
                {client.phone && (
                  <p className="text-slate-400 flex items-center gap-2">
                    <Phone size={13} className="text-slate-600 flex-shrink-0" />
                    {client.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ClientModal
          client={editClient}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); qc.invalidateQueries(['clients']) }}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Client"
          message="Are you sure you want to delete this client? This action cannot be undone."
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
