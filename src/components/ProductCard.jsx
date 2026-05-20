import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`

export default function ProductCard({ _id, name, price, originalPrice, images, ratings, category, stock }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const image       = images?.[0]?.url || 'https://placehold.co/400x400/1f2937/9ca3af?text=No+Image'
  const discount    = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null
  const isOutOfStock = stock === 0

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (isOutOfStock || added) return
    addToCart({ _id, name, price, image, category })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const renderStars = (avg = 0) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(avg) ? 'text-amber-400' : 'text-gray-700'}>★</span>
    ))

  return (
    <Link to={`/products/${_id}`} className="card group cursor-pointer block hover:border-orange-500/30 transition-all duration-300">
      <div className="relative overflow-hidden aspect-square bg-gray-800">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">{category}</span>
        {discount && !isOutOfStock && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl">Out of Stock</span>
          </div>
        )}
        {!isOutOfStock && stock > 0 && stock <= 5 && (
          <span className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Only {stock} left
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors">{name}</h3>
        <div className="flex items-center gap-1.5">
          <div className="flex text-xs">{renderStars(ratings?.average)}</div>
          <span className="text-gray-600 text-xs">({ratings?.count || 0})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-base font-bold">{fmt(price)}</span>
            {originalPrice && <span className="text-gray-600 text-xs line-through">{fmt(originalPrice)}</span>}
          </div>
          <button onClick={handleAddToCart} disabled={isOutOfStock || added}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 disabled:cursor-not-allowed
              ${added ? 'bg-green-500 text-white'
                : isOutOfStock ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'}`}>
            {added ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}