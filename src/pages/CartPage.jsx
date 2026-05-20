import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartSubtotal, shippingCost, grandTotal, cartCount } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-5 px-4">
      <div className="text-8xl">🛒</div>
      <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
      <p className="text-gray-500">Add some products to get started</p>
      <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all">
        Browse Products →
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">
            Shopping Cart <span className="text-gray-500 font-normal text-2xl">({cartCount})</span>
          </h1>
          <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">
            🗑 Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4">
                <Link to={`/products/${item._id}`} className="shrink-0">
                  <img src={item.image || 'https://placehold.co/80x80/1f2937/6b7280?text=?'} alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-800 border border-gray-700" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item._id}`} className="text-white font-semibold text-sm hover:text-orange-400 transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-gray-500 text-xs mt-0.5">{item.category}</p>
                  <p className="text-orange-400 font-bold mt-1">{fmt(item.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm">−</button>
                    <span className="px-3 py-2 text-white text-sm font-medium min-w-[2.5rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm">+</button>
                  </div>
                  <p className="text-white font-bold text-sm">{fmt(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-600 hover:text-red-400 transition-colors text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal ({cartCount} items)</span>
                <span className="text-white font-medium">{fmt(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-400 font-medium' : 'text-white font-medium'}>
                  {shippingCost === 0 ? 'FREE' : fmt(shippingCost)}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-gray-600 text-xs">Add {fmt(5000 - cartSubtotal)} more for free shipping</p>
              )}
              <div className="border-t border-gray-700 pt-3 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-orange-400 font-bold text-xl">{fmt(grandTotal)}</span>
              </div>
            </div>
            {isLoggedIn ? (
              <button onClick={() => navigate('/checkout')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all">
                Proceed to Checkout →
              </button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all">
                  Login to Checkout →
                </Link>
                <p className="text-center text-gray-600 text-xs">or <Link to="/register" className="text-orange-400 hover:underline">create an account</Link></p>
              </div>
            )}
            <Link to="/products" className="block text-center text-gray-500 hover:text-gray-300 text-sm mt-4 transition-colors">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}