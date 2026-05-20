import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const CATEGORIES = ['Electronics', 'Accessories', 'Footwear', 'Clothing', 'Kitchen', 'Sports', 'Books', 'Other']
const EMPTY_FORM  = { name: '', description: '', price: '', originalPrice: '', stock: '', category: 'Electronics', isActive: true }

function AdminNav() {
  const loc = window.location.pathname
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-white">
            Shop<span className="text-orange-500">Zone</span>
            <span className="text-gray-500 font-normal text-base ml-2">Admin</span>
          </Link>
          <nav className="hidden md:flex gap-1">
            {[
              { label: 'Dashboard', path: '/admin'          },
              { label: 'Products',  path: '/admin/products' },
              { label: 'Orders',    path: '/admin/orders'   },
              { label: 'Chat',      path: '/admin/chat'     },
            ].map(link => (
              <Link key={link.label} to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${loc === link.path ? 'bg-orange-500/10 text-orange-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link to="/" className="text-sm px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all">← View Store</Link>
      </div>
    </header>
  )
}

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [images,     setImages]     = useState([])
  const [previews,   setPreviews]   = useState([])
  const [existingImgs, setExistingImgs] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')
  const [deleteId,   setDeleteId]   = useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products/admin/all')
      setProducts(data.data)
    } catch { setError('Failed to load products') }
    finally  { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (publicId) => {
    if (!editId) return
    try {
      await api.delete(`/products/${editId}/images/${publicId}`)
      setExistingImgs(prev => prev.filter(img => img.publicId !== publicId))
    } catch { setError('Failed to delete image') }
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setImages([]); setPreviews([]); setExistingImgs([])
    setEditId(null); setShowForm(false); setError(''); setSuccess('')
  }

  const openAdd = () => {
    resetForm()
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (product) => {
    setForm({
      name:          product.name,
      description:   product.description,
      price:         product.price,
      originalPrice: product.originalPrice || '',
      stock:         product.stock,
      category:      product.category,
      isActive:      product.isActive,
    })
    setEditId(product._id)
    setImages([]); setPreviews([])
    setExistingImgs(product.images || [])
    setError(''); setSuccess('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editId && images.length === 0) {
      setError('At least one image is required'); return
    }
    if (editId && existingImgs.length === 0 && images.length === 0) {
      setError('Product must have at least one image'); return
    }

    setSubmitting(true); setError(''); setSuccess('')
    const fd = new FormData()
    fd.append('name',        form.name)
    fd.append('description', form.description)
    fd.append('price',       form.price)
    fd.append('stock',       form.stock)
    fd.append('category',    form.category)
    fd.append('isActive',    form.isActive)
    if (form.originalPrice) fd.append('originalPrice', form.originalPrice)
    images.forEach(img => fd.append('images', img))

    try {
      if (editId) {
        await api.put(`/products/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setSuccess('Product updated successfully! ✓')
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setSuccess('Product added successfully! ✓')
      }
      await load()
      setTimeout(() => resetForm(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
      setDeleteId(null)
      if (editId === id) resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
      setDeleteId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            Products <span className="text-gray-500 font-normal text-xl">({products.length})</span>
          </h1>
          {!showForm && (
            <button onClick={openAdd}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
              + Add Product
            </button>
          )}
          {showForm && (
            <button onClick={resetForm}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm border border-gray-700">
              ✕ Cancel
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editId ? '✏️ Edit Product' : '➕ New Product'}
            </h2>

            {error   && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div className="sm:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="e.g. Wireless Headphones Pro"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                    placeholder="Describe the product in detail..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Price (Rs.) *</label> {/* ✅ fix 1 */}
                  <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required
                    placeholder="49.99"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Original Price (Rs.) <span className="text-gray-600 font-normal">(for discount badge)</span> {/* ✅ fix 2 */}
                  </label>
                  <input name="originalPrice" type="number" step="0.01" min="0" value={form.originalPrice} onChange={handleChange}
                    placeholder="79.99 (optional)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Stock Quantity *</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required
                    placeholder="100"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" />
                  <p className="text-gray-600 text-xs mt-1">Set to 0 to mark as out of stock</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <div onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`w-11 h-6 rounded-full relative transition-colors ${form.isActive ? 'bg-orange-500' : 'bg-gray-700'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">
                      {form.isActive ? 'Active — visible to customers' : 'Inactive — hidden from store'}
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Product Images {editId ? '(add more)' : '* (required)'}
                  </label>

                  {editId && existingImgs.length > 0 && (
                    <div className="mb-3">
                      <p className="text-gray-500 text-xs mb-2">Current images (click × to remove)</p>
                      <div className="flex gap-3 flex-wrap">
                        {existingImgs.map((img) => (
                          <div key={img.publicId} className="relative group">
                            <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-700" />
                            <button type="button"
                              onClick={() => removeExistingImage(img.publicId)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 hover:border-orange-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors">
                    <p className="text-4xl mb-2">📸</p>
                    <p className="text-gray-300 text-sm font-medium">Click to upload images</p>
                    <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP — Max 5MB each — Up to 5 images</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

                  {previews.length > 0 && (
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {previews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-700" />
                          <button type="button" onClick={() => removeNewImage(i)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-800">
                <button type="submit" disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-all flex items-center gap-2">
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {editId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (editId ? '✓ Update Product' : '+ Add Product')}
                </button>
                <button type="button" onClick={resetForm}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-xl transition-all border border-gray-700">
                  Cancel
                </button>
                {editId && (
                  <button type="button" onClick={() => setDeleteId(editId)}
                    className="ml-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-6 py-3 rounded-xl transition-all border border-red-500/20">
                    🗑 Delete This Product
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <p className="text-5xl mb-4">🗑️</p>
              <h3 className="text-white font-bold text-xl mb-2">Delete Product?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This product will be permanently deleted along with all its images. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-colors border border-gray-700">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-gray-800 rounded-2xl h-16 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
            <p className="text-6xl mb-4">🛍️</p>
            <p className="text-white text-xl font-semibold mb-2">No products yet</p>
            <p className="text-gray-500 text-sm mb-6">Click "+ Add Product" to add your first product</p>
            <button onClick={openAdd}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm">
              + Add First Product
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/80">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {products.map(product => (
                    <tr key={product._id}
                      className={`hover:bg-gray-800/40 transition-colors ${editId === product._id ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : ''}`}>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || 'https://placehold.co/40x40/1f2937/6b7280?text=?'}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-800 shrink-0 border border-gray-700" />
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm line-clamp-1">{product.name}</p>
                            <p className="text-gray-600 text-xs">#{product._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-400 text-sm">{product.category}</td>

                      <td className="px-5 py-4">
                        <span className="text-orange-400 font-bold">Rs.{product.price}</span> {/* ✅ fix 3 */}
                        {product.originalPrice && (
                          <span className="text-gray-600 text-xs ml-1.5 line-through">Rs.{product.originalPrice}</span> /* ✅ fix 4 */
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`font-medium text-sm ${
                          product.stock === 0 ? 'text-red-400' :
                          product.stock <= 5  ? 'text-amber-400' : 'text-white'
                        }`}>
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full
                          ${product.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
                          {product.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)}
                            className="text-blue-400 hover:text-blue-300 text-xs px-3 py-1.5 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg transition-colors font-medium">
                            ✏️ Edit
                          </button>
                          <button onClick={() => setDeleteId(product._id)}
                            className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors font-medium">
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}