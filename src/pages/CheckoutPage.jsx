import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Shipping', 'Payment', 'Review']

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [shipping, setShipping] = useState({
    fullName: user?.name    || '',
    phone:    user?.phone   || '',
    street:   user?.address?.street  || '',
    city:     user?.address?.city    || '',
    country:  user?.address?.country || '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const shippingCost = parseFloat(cartTotal) >= 50 ? 0 : 5
  const grand        = (parseFloat(cartTotal) + shippingCost).toFixed(2)

  const handleShippingChange = (e) =>
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const validateShipping = () => {
    const { fullName, phone, street, city, country } = shipping
    if (!fullName || !phone || !street || !city || !country) {
      setError('Please fill in all shipping fields')
      return false
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (step === 0 && !validateShipping()) return
    setStep(s => s + 1)
  }

  const handlePlaceOrder = async () => {
    setLoading(true); setError('')
    try {
      const items = cartItems.map(item => ({
        product:  item._id,
        name:     item.name,
        quantity: item.quantity,
      }))
      const { data } = await api.post('/orders', { items, shippingAddress: shipping, paymentMethod })
      clearCart()
      navigate(`/orders/${data.data._id}?success=true`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
      setStep(0)
    } finally { setLoading(false) }
  }

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <p className="text-6xl">🛒</p>
      <p className="text-white text-xl font-semibold">Your cart is empty</p>
      <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all">
        Browse Products
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 ${i === step ? 'text-orange-400' : 'text-gray-600'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-4 ${i < step ? 'bg-green-500' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                ⚠ {error}
              </div>
            )}

            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">Shipping Address</h2>
                {[
                  { name: 'fullName', label: 'Full Name',       placeholder: 'John Doe'          },
                  { name: 'phone',    label: 'Phone Number',    placeholder: '+92 300 1234567'   },
                  { name: 'street',   label: 'Street Address',  placeholder: '123 Main Street'   },
                  { name: 'city',     label: 'City',            placeholder: 'Karachi'           },
                  { name: 'country',  label: 'Country',         placeholder: 'Pakistan'          },
                ].map(f => (
                  <div key={f.name}>
                    <label className="label">{f.label}</label>
                    <input name={f.name} value={shipping[f.name]}
                      onChange={handleShippingChange} placeholder={f.placeholder} className="input" />
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">Payment Method</h2>
                {[
                  { value: 'cod',  label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives', disabled: false },
                  { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Coming soon', disabled: true },
                ].map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                      ${paymentMethod === opt.value ? 'border-orange-500 bg-orange-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
                    <input type="radio" value={opt.value} checked={paymentMethod === opt.value}
                      onChange={() => !opt.disabled && setPaymentMethod(opt.value)} className="hidden" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                      ${paymentMethod === opt.value ? 'border-orange-500' : 'border-gray-600'}`}>
                      {paymentMethod === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{opt.label}</p>
                      <p className="text-gray-500 text-xs">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-bold text-white">Order Review</h2>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.image || 'https://placehold.co/48x48/1f2937/6b7280?text=?'}
                        alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-gray-800 border border-gray-700" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity} × Rs.{item.price}</p> {/* ✅ fix 1 */}
                      </div>
                      <p className="text-orange-400 font-bold text-sm shrink-0">
                        Rs.{(item.price * item.quantity).toFixed(2)} {/* ✅ fix 2 */}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">Ship to: </span>
                    {shipping.fullName} • {shipping.phone}
                  </p>
                  <p className="text-sm text-gray-400">{shipping.street}, {shipping.city}, {shipping.country}</p>
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">Payment: </span>
                    {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Card'}
                  </p>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-xl transition-all">
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={handleNext}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all flex-1">
                  Continue →
                </button>
              ) : (
                <button onClick={handlePlaceOrder} disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-all flex-1">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : `Place Order • Rs.${grand}`} {/* ✅ fix 3 */}
                </button>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-fit sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">Rs.{cartTotal}</span> {/* ✅ fix 4 */}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-400' : 'text-white'}>
                  {shippingCost === 0 ? 'FREE' : `Rs.${shippingCost}`} {/* ✅ fix 5 */}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-orange-400 text-lg">Rs.{grand}</span> {/* ✅ fix 6 */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}