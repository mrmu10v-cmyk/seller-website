import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <Link to="/" className="text-2xl font-heading font-extrabold text-white mb-3 block">
              Lux<span className="text-orange-500">ora</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Quality products at unbeatable prices. Fast delivery, easy returns guaranteed.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Electronics',  path: '/products?category=Electronics' },
                { label: 'Accessories',  path: '/products?category=Accessories' },
                { label: 'Footwear',     path: '/products?category=Footwear' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.path} className="text-gray-500 hover:text-orange-400 text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'Login',     path: '/login'    },
                { label: 'Register',  path: '/register' },
                { label: 'My Orders', path: '/orders'   },
                { label: 'Profile',   path: '/profile'  },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.path} className="text-gray-500 hover:text-orange-400 text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
  <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
  <ul className="space-y-2 text-sm">
    <li>
      📧{" "}
      <a
        href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#sent?compose=GsNJsMxfNHHlbVSlSHlxMdldwvvxJZZsGLZqCBtZZmmfzBTMpWZjMfzQrNKMgmXnNXcXmXhfdLmJqqRKsVZpRdcfxWwdtJzXXfwzwGdHCsdRQdfxVKbMQBZQNCvnmqsTtHSGBngzSlTpMcxDbKql"
        className="text-gray-500 hover:text-orange-400 transition-colors"
      >
        TheLuxora.pk@gmail.com
      </a>
    </li>

    <li>
    🌐{" "}
      <a
        href="https://www.instagram.com/itsluxora__?igsh=bDFqd21qdnZyemdt"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-orange-400 transition-colors"
      >
        @itsluxora__
      </a>
    </li>

    <li>🕐 24/7 Support</li>
    <li>🚚 Free shipping above $50</li>
    <li>🔄 30-day returns</li>
  </ul>
</div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">© {year} Luxora. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service'].map(t => (
              <a key={t} href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}