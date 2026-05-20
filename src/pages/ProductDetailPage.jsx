import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ChatWidget from '../components/ChatWidget'

const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()

  const [product,       setProduct]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [selImg,        setSelImg]        = useState(0)
  const [qty,           setQty]           = useState(1)
  const [added,         setAdded]         = useState(false)
  const [review,        setReview]        = useState({ rating: 5, comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError,   setReviewError]   = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.data))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) {
      addToCart({ _id: product._id, name: product.name, price: product.price, image: product.images?.[0]?.url || '', category: product.category })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    if (!review.comment.trim()) { setReviewError('Please write a comment'); return }
    setReviewLoading(true); setReviewError(''); setReviewSuccess('')
    try {
      await api.post(`/products/${id}/reviews`, review)
      setReviewSuccess('Review submitted! ✓')
      setReview({ rating: 5, comment: '' })
      const { data } = await api.get(`/products/${id}`)
      setProduct(data.data)
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review')
    } finally { setReviewLoading(false) }
  }

  const renderStars = (avg = 0, size = 'text-lg') =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${size} ${i < Math.floor(avg) ? 'text-amber-400' : 'text-gray-700'}`}>★</span>
    ))

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error || !product) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <p className="text-6xl">😕</p>
      <p className="text-white text-xl font-semibold">{error || 'Product not found'}</p>
      <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all">Back to Products</Link>
    </div>
  )

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-orange-400 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-300 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
              <img src={product.images?.[selImg]?.url || 'https://placehold.co/600x600/1f2937/9ca3af?text=No+Image'}
                alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                      ${selImg === i ? 'border-orange-500' : 'border-gray-700 hover:border-gray-500'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">{product.category}</span>
              {discount && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">-{discount}% OFF</span>}
              {product.stock === 0 && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-400">Out of Stock</span>}
            </div>

            <h1 className="text-3xl font-bold text-white leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3">
              <div className="flex">{renderStars(product.ratings?.average)}</div>
              <span className="text-orange-400 font-semibold">{product.ratings?.average || 0}</span>
              <span className="text-gray-500 text-sm">({product.ratings?.count || 0} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-orange-400">{fmt(product.price)}</span>
              {product.originalPrice && (
                <span className="text-gray-500 text-xl line-through">{fmt(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-gray-400 leading-relaxed">{product.description}</p>

            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-amber-400 text-sm font-medium">⚠ Only {product.stock} left in stock!</p>
            )}
            {product.stock > 10 && (
              <p className="text-green-400 text-sm">✓ In Stock ({product.stock} available)</p>
            )}

            {product.stock > 0 ? (
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">−</button>
                  <span className="px-4 py-3 text-white font-semibold min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">+</button>
                </div>
                <button onClick={handleAddToCart}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all duration-300
                    ${added ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                  {added ? '✓ Added to Cart!' : `Add to Cart • ${fmt(product.price * qty)}`}
                </button>
              </div>
            ) : (
              <button disabled className="w-full py-3.5 rounded-xl bg-gray-800 text-gray-500 font-bold cursor-not-allowed">
                Out of Stock
              </button>
            )}

            {product.stock > 0 && (
              <button onClick={() => { handleAddToCart(); navigate('/cart') }}
                className="w-full py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold transition-all">
                Buy Now →
              </button>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-gray-800 pt-12">
          <h2 className="text-2xl font-bold text-white mb-8">Customer Reviews ({product.ratings?.count || 0})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              {product.reviews?.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-gray-400">No reviews yet — be the first!</p>
                </div>
              ) : (
                product.reviews?.slice().reverse().map(r => (
                  <div key={r._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <span className="text-orange-400 text-xs font-bold">{r.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{r.name}</p>
                          <p className="text-gray-600 text-xs">{new Date(r.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex">{renderStars(r.rating, 'text-sm')}</div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5">Write a Review</h3>
              {!isLoggedIn ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-4">Login to write a review</p>
                  <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all">Login</Link>
                </div>
              ) : (
                <form onSubmit={handleReview} className="space-y-4">
                  <div>
                    <label className="label">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                          className={`text-2xl transition-transform hover:scale-110 ${star <= review.rating ? 'text-amber-400' : 'text-gray-700'}`}>★</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Comment</label>
                    <textarea value={review.comment} onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this product..." rows={4} className="input resize-none" />
                  </div>
                  {reviewError   && <p className="text-red-400 text-sm">{reviewError}</p>}
                  {reviewSuccess && <p className="text-green-400 text-sm">{reviewSuccess}</p>}
                  <button type="submit" disabled={reviewLoading} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold w-full py-3 rounded-xl transition-all">
                    {reviewLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  )
}