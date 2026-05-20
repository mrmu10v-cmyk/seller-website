import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const STATUS_STYLE = {
  processing: 'bg-amber-400/10 text-amber-400',
  confirmed:  'bg-blue-400/10  text-blue-400',
  shipped:    'bg-purple-400/10 text-purple-400',
  delivered:  'bg-green-400/10 text-green-400',
  cancelled:  'bg-red-400/10   text-red-400',
}

const STATUS_OPTIONS = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled']

function AdminLayout({ children }) {
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
                <Link key={link.label} to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${window.location.pathname === link.path
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link to="/" className="btn-secondary text-sm px-4 py-2">← View Store</Link>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [updating, setUpdating] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [error,    setError]    = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' ? '/orders' : `/orders?status=${filter}`
      const { data } = await api.get(url)
      setOrders(data.data)
    } catch { setError('Failed to load orders') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleStatusChange = async (orderId, orderStatus) => {
    setUpdating(orderId)
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { orderStatus })
      setOrders(prev => prev.map(o => o._id === orderId ? data.data : o))
    } catch { setError('Failed to update status') }
    finally  { setUpdating(null) }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-heading font-bold text-white">Orders</h1>

        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 overflow-x-auto">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                ${filter === s
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:text-white'}`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-gray-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-white text-xl font-semibold">No orders found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/60">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map(order => (
                  <>
                    <tr
                      key={order._id}
                      className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    >
                      <td className="px-5 py-4">
                        <span className="text-brand-400 font-mono text-xs font-bold">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{order.user?.name}</p>
                        <p className="text-gray-500 text-xs">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-400">{order.items.length} items</td>
                      <td className="px-5 py-4">
                        <span className="text-brand-400 font-bold font-heading">Rs.{order.total}</span> {/* ✅ fix 1 */}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${STATUS_STYLE[order.orderStatus] || ''}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.orderStatus}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          disabled={updating === order._id}
                          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {expanded === order._id && (
                      <tr key={`${order._id}-exp`}>
                        <td colSpan={7} className="px-5 py-4 bg-gray-800/30">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs font-medium mb-2">ITEMS</p>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 mb-1.5">
                                  <img src={item.image || 'https://placehold.co/32x32/1f2937/9ca3af?text=?'}
                                    alt="" className="w-8 h-8 object-cover rounded bg-gray-800" />
                                  <div>
                                    <p className="text-white text-xs font-medium line-clamp-1">{item.name}</p>
                                    <p className="text-gray-500 text-xs">×{item.quantity} @ Rs.{item.price}</p> {/* ✅ fix 2 */}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-medium mb-2">SHIPPING</p>
                              <p className="text-white text-xs">{order.shippingAddress.fullName}</p>
                              <p className="text-gray-400 text-xs">{order.shippingAddress.phone}</p>
                              <p className="text-gray-400 text-xs">{order.shippingAddress.street}</p>
                              <p className="text-gray-400 text-xs">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-medium mb-2">PAYMENT</p>
                              <p className="text-white text-xs">{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Card'}</p>
                              <p className={`text-xs mt-1 ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                                {order.paymentStatus}
                              </p>
                              {order.notes && (
                                <p className="text-gray-500 text-xs mt-2">Note: {order.notes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}