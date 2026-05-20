import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return parsed.map(item => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      }))
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item._id === product._id)
      if (exists) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { 
        ...product, 
        price: Number(product.price) || 0,
        quantity: 1 
      }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId))
  }

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) { removeFromCart(productId); return }
    setCartItems(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, quantity: newQty } : item
      )
    )
  }

  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0)
  const shippingCost = cartSubtotal >= 5000 ? 0 : 500
  const grandTotal = cartSubtotal + shippingCost

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartSubtotal,
      shippingCost,
      grandTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}