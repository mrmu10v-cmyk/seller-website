import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/Luxora_Logo.jpeg'

export default function Navbar() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [showDrop, setShowDrop] = useState(false)
  const dropRef = useRef(null)
  const { cartCount } = useCart()
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 relative">

          {/* LEFT: Logo image + Nav links */}
          <div className="flex items-center gap-1 absolute left-0">
            <Link to="/" className="flex items-center mr-2">
              <img
                src={logo}
                alt="Luxora"
                className="h-12 w-12 object-contain"
              />
            </Link>

            <ul className="hidden md:flex items-center gap-1">
              {[
                { label: 'Home',     path: '/'         },
                { label: 'Products', path: '/products' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link to={path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive(path)
                        ? 'text-white bg-gray-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}`}>
                    {label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link to="/admin"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-purple-400 hover:bg-purple-500/10 transition-all">
                    ⚡ Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* CENTER: LUXORA text only */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-white font-heading font-extrabold text-3xl tracking-wide">
              LUX<span className="text-orange-500">ORA</span>
            </span>
          </Link>

          {/* RIGHT: Cart + User menu */}
          <div className="flex items-center gap-1 absolute right-0">

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-0.5">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            {isLoggedIn ? (
              <div className="hidden md:block relative" ref={dropRef}>
                <button
                  onClick={() => setShowDrop(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-800 transition-all">
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center overflow-hidden">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-orange-400 text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  <svg className={`w-3 h-3 text-gray-500 transition-transform ${showDrop ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDrop && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-white text-sm font-semibold">{user?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                    {[
                      { label: '👤  Profile',   path: '/profile' },
                      { label: '📦  My Orders', path: '/orders'  },
                    ].map(item => (
                      <Link key={item.path} to={item.path}
                        onClick={() => setShowDrop(false)}
                        className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition-colors">
                        {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setShowDrop(false)}
                        className="block px-4 py-2.5 text-purple-400 hover:bg-purple-500/10 text-sm transition-colors">
                        ⚡  Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-800">
                      <button onClick={() => { logout(); setShowDrop(false) }}
                        className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                        🚪  Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setIsOpen(v => !v)}
              className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu — same as before */}
      {isOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-3 space-y-1">
          {[
            { label: 'Home',     path: '/'         },
            { label: 'Products', path: '/products' },
          ].map(({ label, path }) => (
            <Link key={label} to={path} onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-colors">
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-purple-400 hover:bg-purple-500/10 text-sm">
              ⚡ Admin Panel
            </Link>
          )}
          <div className="border-t border-gray-800 pt-2 space-y-1">
            {isLoggedIn ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-white text-sm font-semibold">{user?.name}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
                <Link to="/profile"  onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-sm">👤 Profile</Link>
                <Link to="/orders"   onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-sm">📦 My Orders</Link>
                <button onClick={() => { logout(); setIsOpen(false) }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm">
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-1 pt-1">
                <Link to="/login"    onClick={() => setIsOpen(false)} className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}