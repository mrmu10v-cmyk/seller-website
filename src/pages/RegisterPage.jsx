import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass,   setShowPass]   = useState(false)
  const [localError, setLocalError] = useState('')
  const { register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (localError) setLocalError('')
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setLocalError('Please fill all fields'); return }
    if (form.password.length < 6) { setLocalError('Password must be at least 6 characters long'); return }
    if (form.password !== form.confirm) { setLocalError('Passwords do not match'); return }
    const result = await register(form.name, form.email, form.password)
    if (result.success) navigate('/')
  }

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-950 border-r border-gray-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <Link to="/" className="text-5xl font-heading font-extrabold text-white mb-6 block">
            Lux<span className="text-brand-500">ora</span>
          </Link>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Join thousands of happy customers. Quality products, fast delivery.
          </p>
          <div className="mt-10 space-y-3">
            {['✓ Free shipping on orders above $50', '✓ Easy 30-day returns', '✓ 24/7 customer support'].map(t => (
              <p key={t} className="text-gray-400 text-sm">{t}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="text-4xl font-heading font-extrabold text-white">
              LUX<span className="text-brand-500">ora</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Completely free — register now</p>
          </div>

          <button onClick={handleGoogle} type="button"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl px-4 py-3 mb-6 transition-all shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Register with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs uppercase tracking-wider">or use email</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠</span> {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Hammad Hussain" autoComplete="name"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="person@email.com" autoComplete="email"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="At least 6 characters"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
              <input name="confirm" type={showPass ? 'text' : 'password'} value={form.confirm}
                onChange={handleChange} placeholder="Re-enter password"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Login
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
            ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}