import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

let socket = null

export default function ChatWidget() {
  const { user, isLoggedIn, token } = useAuth()
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [connected, setConnected] = useState(false)
  const [typing,    setTyping]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const bottomRef     = useRef(null)
  const typingTimeout = useRef(null)
  const room = user?._id?.toString()

  useEffect(() => {
    if (!isOpen || !isLoggedIn || !token || !room) return

    // Load history
    setLoading(true)
    api.get(`/chat/${room}`)
      .then(({ data }) => setMessages(data.data))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Connect socket
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_room', room)
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setConnected(false))

    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    socket.on('user_typing', ({ role, isTyping }) => {
      if (role === 'admin') setTyping(isTyping)
    })

    return () => {
      socket?.disconnect()
      socket = null
      setConnected(false)
    }
  }, [isOpen, isLoggedIn, token, room])

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = () => {
    if (!input.trim() || !socket?.connected) return
    socket.emit('send_message', { room, message: input.trim() })
    socket.emit('typing', { room, isTyping: false })
    setInput('')
    clearTimeout(typingTimeout.current)
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    if (!socket?.connected) return
    socket.emit('typing', { room, isTyping: true })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing', { room, isTyping: false })
    }, 1500)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (!isLoggedIn) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '440px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-white text-sm font-semibold">Support Chat</span>
            </div>
            <button onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl leading-none transition-colors">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">👋</p>
                <p className="text-white text-sm font-semibold">Hi {user?.name?.split(' ')[0]}!</p>
                <p className="text-gray-500 text-xs mt-1">How can we help you today?</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg._id} className={`flex ${msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                  ${msg.senderRole === 'customer'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                  }`}>
                  {msg.senderRole === 'admin' && (
                    <p className="text-orange-400 font-semibold text-[10px] mb-0.5">Support</p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <p className={`text-[10px] mt-0.5 text-right ${msg.senderRole === 'customer' ? 'text-orange-200' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-3 py-2.5 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-2.5 border-t border-gray-700 flex gap-2 shrink-0">
            <input
              value={input}
              onChange={handleInput}
              onKeyDown={handleKey}
              placeholder={connected ? 'Type a message...' : 'Connecting...'}
              disabled={!connected}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-colors"
            />
            <button onClick={sendMessage} disabled={!connected || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setIsOpen(v => !v)}
        className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-105 flex items-center justify-center ml-auto">
        {isOpen
          ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        }
      </button>
    </div>
  )
}