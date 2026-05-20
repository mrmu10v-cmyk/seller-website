import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    country: user?.address?.country || '',
  })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving,   setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [msg,      setMsg]      = useState({ type: '', text: '' })
  const [msgPw,    setMsgPw]    = useState({ type: '', text: '' })
  const [showPass, setShowPass] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg({ type: '', text: '' })
    const result = await updateProfile({
      name:  form.name,
      phone: form.phone,
      address: { street: form.street, city: form.city, country: form.country },
    })
    setMsg(result.success
      ? { type: 'success', text: 'Profile updated successfully! ✓' }
      : { type: 'error',   text: result.message || 'Something went wrong' }
    )
    setSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) {
      setMsgPw({ type: 'error', text: 'Passwords do not match' }); return
    }
    if (pwForm.newPassword.length < 6) {
      setMsgPw({ type: 'error', text: 'Password must be at least 6 characters' }); return
    }
    setSavingPw(true); setMsgPw({ type: '', text: '' })
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      })
      setMsgPw({ type: 'success', text: 'Password changed successfully! ✓' })
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setMsgPw({ type: 'error', text: err.response?.data?.message || 'Something went wrong' })
    } finally { setSavingPw(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>

        {/* User card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-orange-400 text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div>
            <p className="text-white font-bold text-xl">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full mt-1
              ${user?.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-orange-500/15 text-orange-400'}`}>
              {user?.role}
            </span>
          </div>
          <Link to="/orders" className="ml-auto bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-all">
            My Orders →
          </Link>
        </div>

        {/* Edit profile */}
        <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          {[
            { name: 'name',    label: 'Full Name',       placeholder: 'John Doe'     },
            { name: 'phone',   label: 'Phone Number',    placeholder: '+1 234...'    },
            { name: 'street',  label: 'Street Address',  placeholder: '123 Main St'  },
            { name: 'city',    label: 'City',            placeholder: 'New York'     },
            { name: 'country', label: 'Country',         placeholder: 'United States'},
          ].map(f => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input name={f.name} value={form[f.name]} placeholder={f.placeholder}
                onChange={e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                className="input" />
            </div>
          ))}
          {msg.text && (
            <p className={`text-sm ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
          )}
          <button type="submit" disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handlePasswordChange} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Change Password</h2>
          {[
            { name: 'currentPassword', label: 'Current Password' },
            { name: 'newPassword',     label: 'New Password'     },
            { name: 'confirm',         label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input name={f.name} type={showPass ? 'text' : 'password'}
                value={pwForm[f.name]} placeholder="••••••••"
                onChange={e => setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                className="input" />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)}
              className="w-4 h-4 accent-orange-500" />
            <span className="text-gray-400 text-sm">Show passwords</span>
          </label>
          {msgPw.text && (
            <p className={`text-sm ${msgPw.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msgPw.text}</p>
          )}
          <button type="submit" disabled={savingPw}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all">
            {savingPw ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}