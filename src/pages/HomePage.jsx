import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ChatWidget from '../components/ChatWidget'

function ThreeHero() {
  const mountRef = useRef(null)
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth, H = mount.clientHeight
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.set(0, 0, 5)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const group  = new THREE.Group()
    scene.add(group)
    const shapes = []

    const torus1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.06, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    )
    torus1.rotation.x = Math.PI / 3
    group.add(torus1)
    shapes.push({ mesh: torus1, rx: 0.003, ry: 0.005 })

    const torus2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.03, 8, 60),
      new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.35 })
    )
    torus2.rotation.x = Math.PI / 1.5
    torus2.rotation.z = Math.PI / 4
    group.add(torus2)
    shapes.push({ mesh: torus2, rx: -0.004, ry: 0.003 })

    ;[[2.5,1,-1],[-2.5,-1,-1],[1.8,-2,0.5],[-1.5,2,0.5],[0,2.5,-1]].forEach((pos, i) => {
      const gem = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.15 + (i % 3) * 0.06, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xf97316 : 0xfcd34d, wireframe: true })
      )
      gem.position.set(...pos)
      group.add(gem)
      shapes.push({ mesh: gem, rx: 0.01 * (i + 1), ry: 0.008 * (i + 1), float: i })
    })

    const pGeo = new THREE.BufferGeometry()
    const pos  = new Float32Array(600)
    for (let i = 0; i < 600; i++) pos[i] = (Math.random() - 0.5) * 14
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xf97316, size: 0.025, transparent: true, opacity: 0.5 }))
    scene.add(particles)

    let mx = 0, my = 0
    const onMouse = (e) => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener('mousemove', onMouse)
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    let frameId, t = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      t += 0.01
      group.rotation.y += (mx * 0.3 - group.rotation.y) * 0.05
      group.rotation.x += (-my * 0.2 - group.rotation.x) * 0.05
      shapes.forEach((s, i) => {
        s.mesh.rotation.x += s.rx
        s.mesh.rotation.y += s.ry
        if (s.float !== undefined) s.mesh.position.y += Math.sin(t + s.float) * 0.003
      })
      particles.rotation.y += 0.0005
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])
  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />
}

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/products?limit=8&sort=-createdAt')
      .then(({ data }) => setFeatured(data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = [
    { name: 'Electronics', icon: '⚡', color: 'from-blue-500/20 to-transparent'   },
    { name: 'Footwear',    icon: '👟', color: 'from-green-500/20 to-transparent'  },
    { name: 'Accessories', icon: '⌚', color: 'from-purple-500/20 to-transparent' },
    { name: 'Clothing',    icon: '👕', color: 'from-pink-500/20 to-transparent'   },
    { name: 'Sports',      icon: '🏆', color: 'from-amber-500/20 to-transparent'  },
    { name: 'Kitchen',     icon: '🍳', color: 'from-orange-500/20 to-transparent' },
  ]

  return (
    <div className="bg-gray-950">

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0"><ThreeHero /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 text-sm font-medium">New Arrivals Every Week</span>
            </div>

            <h1 className="text-6xl lg:text-5xl font-bold leading-none text-white mb-6">
              FIND YOUR<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                PERFECT
              </span><br />
              PRODUCTS
            </h1>

            <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-8">
              Thousands of quality products. Fast delivery, easy returns, best prices guaranteed.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 text-base">
                Shop Now →
              </Link>
              <Link to="/products" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold px-8 py-4 rounded-xl transition-all text-base">
                Browse Categories
              </Link>
            </div>

            <div className="flex gap-8 pt-6 border-t border-gray-800">
              {[{ n: '50K+', l: 'Products' }, { n: '10K+', l: 'Customers' }, { n: '4.9★', l: 'Rating' }, { n: '24h', l: 'Support' }].map(s => (
                <div key={s.l}>
                  <p className="text-2xl font-bold text-white">{s.n}</p>
                  <p className="text-gray-500 text-xs">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-orange-500 text-sm font-medium mb-1">Browse By</p>
            <h2 className="text-3xl font-bold text-white">Categories</h2>
          </div>
          <Link to="/products" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link key={cat.name} to={`/products?category=${cat.name}`}
              className={`card bg-gradient-to-br ${cat.color} p-5 flex flex-col items-center gap-3 hover:scale-105 hover:border-orange-500/40 transition-all duration-300`}>
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-white text-sm font-semibold">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-orange-500 text-sm font-medium mb-1">Latest</p>
            <h2 className="text-3xl font-bold text-white">Featured Products</h2>
          </div>
          <Link to="/products" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">View All →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
            <p className="text-6xl mb-4">🛍️</p>
            <p className="text-white font-semibold text-lg">No products yet</p>
            <p className="text-gray-500 text-sm mt-2">Admin will add products soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map(product => <ProductCard key={product._id} {...product} />)}
          </div>
        )}
      </section>

      {/* Features bar */}
      <section className="border-t border-gray-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🚚', title: 'Free Delivery',  desc: 'On orders above Rs.50'  },
              { icon: '🔄', title: 'Easy Returns',   desc: '30-day return policy' },
              { icon: '🔒', title: 'Secure Payment', desc: '100% protected'       },
              { icon: '💬', title: '24/7 Support',   desc: 'Always here for you'  },
            ].map(f => (
              <div key={f.title} className="space-y-2">
                <span className="text-4xl block">{f.icon}</span>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  )
}