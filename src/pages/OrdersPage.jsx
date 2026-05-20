import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`

const STATUS_STYLE = {
  processing: 'bg-amber-400/10 text-amber-400',
  confirmed:  'bg-blue-400/10  text-blue-400',
  shipped:    'bg-purple-400/10 text-purple-400',
  delivered:  'bg-green-400/10 text-green-400',
  cancelled:  'bg-red-400/10   text-red-400',
}

export function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data.data))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold text-white mb-8">My Orders</h1>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-white text-xl font-semibold mb-2">No orders yet</p>
            <p className="text-gray-500 mb-6">Your orders will appear here once you place one</p>
            <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all">Shop Now →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`}
                className="bg-gray-900 border border-gray-800 hover:border-orange-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all block">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-orange-400 font-mono text-sm font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[order.orderStatus] || 'bg-gray-700 text-gray-400'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {order.items.slice(0, 4).map((item, i) => (
                      <img key={i} src={item.image || 'https://placehold.co/40x40/1f2937/6b7280?text=?'}
                        alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-gray-800 border border-gray-700" />
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">+{order.items.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-orange-400">{fmt(order.total)}</p>
                  <p className="text-gray-500 text-xs mt-1">View Details →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!order) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <p className="text-6xl">😕</p>
      <p className="text-white text-xl font-semibold">Order not found</p>
      <Link to="/orders" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all">Back to Orders</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-8 text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-green-400 text-xl font-bold">Order Placed Successfully!</p>
            <p className="text-gray-400 text-sm mt-1">Your order has been confirmed</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_STYLE[order.orderStatus] || 'bg-gray-700 text-gray-400'}`}>
            {order.orderStatus}
          </span>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Items Ordered</h2>
            <div className="divide-y divide-gray-800">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <img src={item.image || 'https://placehold.co/56x56/1f2937/6b7280?text=?'}
                    alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-gray-800 border border-gray-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity} × {fmt(item.price)}</p>
                  </div>
                  <p className="text-orange-400 font-bold text-sm shrink-0">{fmt(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Shipping Address</h3>
              <p className="text-gray-300 text-sm font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-gray-400 text-sm">{order.shippingAddress.phone}</p>
              <p className="text-gray-400 text-sm mt-1">{order.shippingAddress.street},<br />{order.shippingAddress.city}, {order.shippingAddress.country}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Payment Info</h3>
              <p className="text-gray-400 text-sm">Method: <span className="text-white">{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Card'}</span></p>
              <p className="text-gray-400 text-sm mt-1">Status: <span className={order.paymentStatus === 'paid' ? 'text-green-400' : 'text-amber-400'}>{order.paymentStatus}</span></p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span className={order.shippingCost === 0 ? 'text-green-400' : 'text-white'}>{order.shippingCost === 0 ? 'FREE' : fmt(order.shippingCost)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-orange-400 text-xl">{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/orders"   className="flex-1 text-center py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold rounded-xl transition-all">← My Orders</Link>
            <Link to="/products" className="flex-1 text-center py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersPage