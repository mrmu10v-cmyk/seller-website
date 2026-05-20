import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ChatWidget from '../components/ChatWidget'

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Footwear', 'Clothing', 'Kitchen', 'Sports', 'Books', 'Other']
const SORT_OPTIONS = [
  { label: 'Newest First',    value: '-createdAt'       },
  { label: 'Price: Low-High', value: 'price'            },
  { label: 'Price: High-Low', value: '-price'           },
  { label: 'Top Rated',       value: '-ratings.average' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [total,    setTotal]    = useState(0)
  const [pages,    setPages]    = useState(1)

  const [search,   setSearch]   = useState(searchParams.get('search')   || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [sort,     setSort]     = useState(searchParams.get('sort')     || '-createdAt')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1)
  const [inStock,  setInStock]  = useState(searchParams.get('inStock') === 'true')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page',  page)
      params.set('limit', 12)
      params.set('sort',  sort)
      if (search   && search !== '')      params.set('search',   search)
      if (category && category !== 'All') params.set('category', category)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (inStock)  params.set('inStock', 'true')
      const { data } = await api.get(`/products?${params.toString()}`)
      setProducts(data.data)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [search, category, sort, minPrice, maxPrice, page, inStock])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    const p = {}
    if (search)             p.search   = search
    if (category !== 'All') p.category = category
    if (sort !== '-createdAt') p.sort  = sort
    if (minPrice)           p.minPrice = minPrice
    if (maxPrice)           p.maxPrice = maxPrice
    if (page > 1)           p.page     = page
    if (inStock)            p.inStock  = 'true'
    setSearchParams(p)
  }, [search, category, sort, minPrice, maxPrice, page, inStock])

  const handleSearch   = (e) => { setSearch(e.target.value); setPage(1) }
  const handleCategory = (cat) => { setCategory(cat); setPage(1) }
  const resetFilters   = () => {
    setSearch(''); setCategory('All'); setSort('-createdAt')
    setMinPrice(''); setMaxPrice(''); setInStock(false); setPage(1)
  }
  const hasFilters = search || category !== 'All' || minPrice || maxPrice || inStock

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">Products</h1>
          <p className="text-gray-500 text-sm">{loading ? 'Loading...' : `${total} products found`}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0 space-y-6">
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <input type="text" value={search} onChange={handleSearch}
                  placeholder="Search products..."
                  className="input pr-10 text-sm" />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="label">Category</label>
              <div className="space-y-0.5">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => handleCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                      ${category === cat
                        ? 'bg-orange-500/15 text-orange-400 font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Price Range (Rs.)</label>
              <div className="flex gap-2">
                <input type="number" value={minPrice} placeholder="Min" min="0"
                  onChange={e => { setMinPrice(e.target.value); setPage(1) }}
                  className="input text-sm py-2" />
                <input type="number" value={maxPrice} placeholder="Max" min="0"
                  onChange={e => { setMaxPrice(e.target.value); setPage(1) }}
                  className="input text-sm py-2" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div onClick={() => { setInStock(!inStock); setPage(1) }}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${inStock ? 'bg-orange-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                  ${inStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-gray-400 text-sm">In Stock Only</span>
            </label>

            {hasFilters && (
              <button onClick={resetFilters}
                className="w-full py-2 text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-xl transition-all">
                × Clear Filters
              </button>
            )}
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-500 text-sm">
                {!loading && `Showing ${products.length} of ${total}`}
              </p>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
                className="bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Skeleton */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-gray-800" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-800 rounded w-1/2" />
                      <div className="h-5 bg-gray-800 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && products.length === 0 && (
              <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
                <p className="text-6xl mb-4">🔍</p>
                <p className="text-white font-semibold text-lg mb-2">No products found</p>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search term</p>
                <button onClick={resetFilters}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-xl text-sm font-medium transition-all border border-gray-700">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Grid */}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map(product => (
                  <ProductCard key={product._id} {...product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 disabled:opacity-40 transition-all">
                  ← Previous
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`e${i}`} className="text-gray-600 px-2">...</span>
                    : <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                          ${page === p ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        {p}
                      </button>
                  )
                }
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 disabled:opacity-40 transition-all">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  )
}