import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Chart, registerables } from 'chart.js'
import api from '../../api/axios'

Chart.register(...registerables)

function StatCard({ label, value, icon, change, color }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {change && (
          <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-heading font-bold text-white mb-1">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const revenueRef  = useRef(null)
  const statusRef   = useRef(null)
  const revenueChart = useRef(null)
  const statusChart  = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders/analytics')
        setAnalytics(data.data)
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    if (!analytics) return

    if (revenueRef.current) {
      if (revenueChart.current) revenueChart.current.destroy()
      const ctx = revenueRef.current.getContext('2d')
      revenueChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analytics.last7Days.map(d => d.date),
          datasets: [
            {
              label:            'Revenue (Rs.)',
              data:             analytics.last7Days.map(d => d.revenue),
              borderColor:      '#f97316',
              backgroundColor:  'rgba(249,115,22,0.08)',
              borderWidth:      2.5,
              pointBackgroundColor: '#f97316',
              pointRadius:      4,
              tension:          0.4,
              fill:             true,
            },
            {
              label:           'Orders',
              data:            analytics.last7Days.map(d => d.orders),
              borderColor:     '#a78bfa',
              backgroundColor: 'rgba(167,139,250,0.05)',
              borderWidth:     2,
              pointBackgroundColor: '#a78bfa',
              pointRadius:     4,
              tension:         0.4,
              yAxisID:         'y2',
              fill:            false,
            },
          ],
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { labels: { color: '#9ca3af', font: { size: 12 } } },
          },
          scales: {
            x:  { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
            y:  { ticks: { color: '#6b7280', callback: v => `Rs.${v}` }, grid: { color: '#1f2937' } }, // ✅ fix 1
            y2: { position: 'right', ticks: { color: '#6b7280' }, grid: { display: false } },
          },
        },
      })
    }

    if (statusRef.current) {
      if (statusChart.current) statusChart.current.destroy()
      const ctx = statusRef.current.getContext('2d')
      const statusData = analytics.ordersByStatus
      statusChart.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: statusData.map(s => s._id),
          datasets: [{
            data:            statusData.map(s => s.count),
            backgroundColor: ['#f97316','#a78bfa','#34d399','#60a5fa','#f87171'],
            borderColor:     '#111827',
            borderWidth:     3,
          }],
        },
        options: {
          responsive: true,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 16 } },
          },
        },
      })
    }

    return () => {
      revenueChart.current?.destroy()
      statusChart.current?.destroy()
    }
  }, [analytics])

  const stats = analytics ? [
    { label: 'Total Revenue',   value: `Rs.${analytics.stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-brand-500/20',  change: '+12%' }, // ✅ fix 2
    { label: 'Total Orders',    value: analytics.stats.totalOrders,                     icon: '📦', color: 'bg-purple-500/20', change: '+8%'  },
    { label: 'Active Products', value: analytics.stats.totalProducts,                   icon: '🛍️', color: 'bg-blue-500/20',   change: null   },
    { label: 'Customers',       value: analytics.stats.totalCustomers,                  icon: '👥', color: 'bg-green-500/20',  change: '+5%'  },
  ] : []

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-heading font-bold text-white">
              Shop<span className="text-brand-500">Zone</span>
              <span className="text-gray-500 font-normal text-base ml-2">Admin</span>
            </h1>
            <nav className="hidden md:flex gap-1">
              {[
                { label: 'Dashboard', path: '/admin'          },
                { label: 'Products',  path: '/admin/products' },
                { label: 'Orders',    path: '/admin/orders'   },
                { label: 'Chat',      path: '/admin/chat'     },
              ].map(link => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${window.location.pathname === link.path
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link to="/" className="btn-secondary text-sm px-4 py-2">← View Store</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse h-36 bg-gray-800" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="card p-6 lg:col-span-2">
                <h2 className="text-lg font-heading font-bold text-white mb-5">Last 7 Days</h2>
                <canvas ref={revenueRef} height={220} />
              </div>
              <div className="card p-6">
                <h2 className="text-lg font-heading font-bold text-white mb-5">Orders by Status</h2>
                <canvas ref={statusRef} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Manage Products', desc: 'Add, edit, delete products',    path: '/admin/products', icon: '🛍️' },
                { title: 'Manage Orders',   desc: 'View and update order status',  path: '/admin/orders',   icon: '📦' },
                { title: 'Support Chat',    desc: 'Reply to customer messages',    path: '/admin/chat',     icon: '💬' },
              ].map(card => (
                <Link key={card.title} to={card.path}
                  className="card p-5 flex items-center gap-4 hover:border-brand-500/40 transition-all">
                  <span className="text-3xl">{card.icon}</span>
                  <div>
                    <p className="text-white font-semibold font-heading">{card.title}</p>
                    <p className="text-gray-500 text-xs">{card.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}