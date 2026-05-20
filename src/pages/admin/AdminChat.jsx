import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

let socket = null

function AdminNav() {
  const loc = window.location.pathname
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-heading font-bold text-white">
            Lux<span className="text-orange-500">ora</span>
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

export default function AdminChat() {
  const { token, user } = useAuth()
  const [rooms,      setRooms]      = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [connected,  setConnected]  = useState(false)
  const [typing,     setTyping]     = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [unread,     setUnread]     = useState({})
  const bottomRef     = useRef(null)
  const typingTimeout = useRef(null)
  const activeRoomRef = useRef(null)

  // Keep ref in sync
  useEffect(() => { activeRoomRef.current = activeRoom }, [activeRoom])

  // Load rooms
  const loadRooms = async () => {
    try {
      const { data } = await api.get('/chat/rooms')
      setRooms(data.data)
      const map = {}
      data.data.forEach(r => { map[r._id] = r.unread })
      setUnread(map)
    } catch {}
    finally { setLoadingRooms(false) }
  }
  useEffect(() => { loadRooms() }, [])

  // Socket
  useEffect(() => {
    if (!token) return
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    })
    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('receive_message', (msg) => {
      if (msg.room === activeRoomRef.current) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      } else {
        setUnread(prev => ({ ...prev, [msg.room]: (prev[msg.room] || 0) + 1 }))
      }
      // Update room preview
      setRooms(prev => {
        const exists = prev.find(r => r._id === msg.room)
        if (exists) {
          return prev.map(r => r._id === msg.room ? { ...r, lastMessage: msg.message, lastTime: msg.createdAt } : r)
        }
        return [{ _id: msg.room, lastMessage: msg.message, lastTime: msg.createdAt, senderName: msg.senderName, unread: 1 }, ...prev]
      })
    })

    socket.on('new_customer_message', ({ room, customerName }) => {
      if (room !== activeRoomRef.current) {
        setUnread(prev => ({ ...prev, [room]: (prev[room] || 0) + 1 }))
      }
    })

    socket.on('user_typing', ({ role, isTyping }) => {
      if (role === 'customer') setTyping(isTyping)
    })

    return () => { socket?.disconnect(); socket = null }
  }, [token])

  const openRoom = async (room) => {
    setActiveRoom(room)
    setMessages([])
    setUnread(prev => ({ ...prev, [room]: 0 }))
    socket?.emit('join_room', room)
    try {
      const { data } = await api.get(`/chat/${room}`)
      setMessages(data.data)
    } catch {}
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = () => {
    if (!input.trim() || !socket?.connected || !activeRoom) return
    socket.emit('send_message', { room: activeRoom, message: input.trim() })
    socket.emit('typing', { room: activeRoom, isTyping: false })
    setInput('')
    clearTimeout(typingTimeout.current)
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    if (!socket?.connected || !activeRoom) return
    socket.emit('typing', { room: activeRoom, isTyping: true })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing', { room: activeRoom, isTyping: false })
    }, 1500)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <AdminNav />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Rooms sidebar */}
        <div className="w-72 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <h2 className="text-white font-semibold text-sm">Customer Chats</h2>
            </div>
            <span className="text-gray-500 text-xs">{rooms.length} conversations</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingRooms && (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-800 animate-pulse rounded-xl" />)}
              </div>
            )}
            {!loadingRooms && rooms.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-gray-500 text-sm">No conversations yet</p>
              </div>
            )}
            {rooms.map(room => (
              <button key={room._id} onClick={() => openRoom(room._id)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-800 transition-colors
                  ${activeRoom === room._id ? 'bg-orange-500/10 border-l-2 border-l-orange-500' : 'hover:bg-gray-800/50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                    {room.senderName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${activeRoom === room._id ? 'text-orange-400' : 'text-white'}`}>
                        {room.senderName || 'Customer'}
                      </p>
                      {unread[room._id] > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0">
                          {unread[room._id]}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs truncate">{room.lastMessage || 'No messages yet'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-950 min-w-0">
          {!activeRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <p className="text-5xl">💬</p>
              <p className="text-white font-semibold text-xl">Select a conversation</p>
              <p className="text-gray-500 text-sm">Choose a customer from the left panel</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                  {rooms.find(r => r._id === activeRoom)?.senderName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {rooms.find(r => r._id === activeRoom)?.senderName || 'Customer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {typing ? '✍️ Typing...' : connected ? '🟢 Online' : '⚪ Connecting...'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-sm">No messages yet — start the conversation</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg._id} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                      ${msg.senderRole === 'admin'
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}>
                      {msg.senderRole === 'customer' && (
                        <p className="text-orange-400 font-semibold text-xs mb-0.5">{msg.senderName}</p>
                      )}
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-0.5 text-right ${msg.senderRole === 'admin' ? 'text-orange-200' : 'text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
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
              <div className="p-4 border-t border-gray-800 flex gap-3 shrink-0">
                <input value={input} onChange={handleInput} onKeyDown={handleKey}
                  placeholder={connected ? 'Type your reply...' : 'Connecting...'}
                  disabled={!connected}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 disabled:opacity-50 text-sm transition-colors" />
                <button onClick={sendMessage} disabled={!connected || !input.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                  Send →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}