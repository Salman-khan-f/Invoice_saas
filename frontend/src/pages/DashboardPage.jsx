import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/services'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  DollarSign, Clock, AlertTriangle, Users, FileText,
  TrendingUp, Plus, ArrowRight
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, getStatusBadge } from '../utils/helpers'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then(r => r.data.data),
  })

  if (isLoading) return <LoadingSpinner />

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data?.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/30',
      change: '+12.5%',
    },
    {
      label: 'Pending',
      value: formatCurrency(data?.pendingAmount),
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-900/30',
      sub: `${data?.pendingInvoices || 0} invoices`,
    },
    {
      label: 'Overdue',
      value: formatCurrency(data?.overdueAmount),
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-900/30',
      sub: `${data?.overdueInvoices || 0} invoices`,
    },
    {
      label: 'Total Clients',
      value: data?.totalClients || 0,
      icon: Users,
      color: 'text-primary-400',
      bg: 'bg-primary-900/30',
    },
  ]

  const chartData = (data?.monthlyRevenue || []).map(m => ({
    month: m.month,
    revenue: parseFloat(m.amount || 0),
  }))

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your business</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.bg}`}>
              <s.icon size={22} className={s.color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{s.value}</p>
              {s.sub && <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>}
              {s.change && <p className="text-xs text-emerald-400 mt-0.5 font-medium">{s.change} this month</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-white">Revenue Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-900/20 px-3 py-1 rounded-full">
              <TrendingUp size={14} />
              Revenue
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#e2e8f0' }}
                formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Summary */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Invoice Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Invoices', count: data?.totalInvoices || 0, color: 'bg-slate-600' },
              { label: 'Paid', count: data?.paidInvoices || 0, color: 'bg-emerald-500' },
              { label: 'Pending', count: data?.pendingInvoices || 0, color: 'bg-amber-500' },
              { label: 'Overdue', count: data?.overdueInvoices || 0, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                <span className="text-sm text-slate-400 flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-white">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-3">Quick Actions</p>
            <div className="space-y-2">
              <Link to="/invoices/new"
                className="flex items-center justify-between text-sm text-slate-300 hover:text-primary-400 py-1.5 transition-colors">
                <span>Create Invoice</span><ArrowRight size={14} />
              </Link>
              <Link to="/clients"
                className="flex items-center justify-between text-sm text-slate-300 hover:text-primary-400 py-1.5 transition-colors">
                <span>Manage Clients</span><ArrowRight size={14} />
              </Link>
              <Link to="/invoices"
                className="flex items-center justify-between text-sm text-slate-300 hover:text-primary-400 py-1.5 transition-colors">
                <span>View All Invoices</span><ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="table-container">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Recent Invoices</h2>
          <Link to="/invoices" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentInvoices || []).length === 0 ? (
              <tr><td colSpan={5} className="text-center text-slate-500 py-8">No invoices yet</td></tr>
            ) : (data?.recentInvoices || []).map(inv => (
              <tr key={inv.id}>
                <td>
                  <Link to={`/invoices/${inv.id}`} className="font-mono text-primary-400 hover:text-primary-300 text-xs font-semibold">
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className="font-medium text-slate-200">{inv.clientName}</td>
                <td className="font-semibold">{formatCurrency(inv.total)}</td>
                <td className="text-slate-400">{inv.dueDate}</td>
                <td><span className={getStatusBadge(inv.status)}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
