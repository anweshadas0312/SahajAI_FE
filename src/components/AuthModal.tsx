import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { Sparkles, User as UserIcon, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose?: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (isRegister) {
      if (!username || !email || !password) {
        setError('Please fill in all fields')
        setIsSubmitting(false)
        return
      }
      const res = await register(username, email, password)
      if (!res.success) {
        setError(res.error || 'Registration failed')
      } else if (onClose) {
        onClose()
      }
    } else {
      if (!identifier || !password) {
        setError('Please enter username/email and password')
        setIsSubmitting(false)
        return
      }
      const res = await login(identifier, password)
      if (!res.success) {
        setError(res.error || 'Login failed')
      } else if (onClose) {
        onClose()
      }
    }
    setIsSubmitting(false)
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError('Google Sign-In failed to return credentials')
      return
    }
    setIsSubmitting(true)
    setError('')
    const res = await loginWithGoogle(credentialResponse.credential)
    if (!res.success) {
      setError(res.error || 'Google Sign-In failed')
    } else if (onClose) {
      onClose()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="auth-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="auth-modal-card relative w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-7 overflow-hidden transition-colors">
        {/* Glow accent */}
        <div className="auth-glow-top absolute -top-16 -right-16 w-36 h-36 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="auth-glow-bottom absolute -bottom-16 -left-16 w-36 h-36 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="auth-icon-badge inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] mb-3 shadow-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="auth-modal-title text-2xl font-bold text-white tracking-tight">sahajAI Workspace</h2>
          <p className="auth-modal-subtitle text-sm text-gray-400 mt-1">
            {isRegister ? 'Create your isolated workspace account' : 'Sign in to access your personal AI workspace'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="auth-modal-label block text-xs font-medium text-gray-300 mb-1.5">Username</label>
                <div className="relative">
                  <UserIcon className="auth-modal-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="auth-modal-input w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition"
                  />
                </div>
              </div>

              <div>
                <label className="auth-modal-label block text-xs font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="auth-modal-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="auth-modal-input w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="auth-modal-label block text-xs font-medium text-gray-300 mb-1.5">Username or Email</label>
              <div className="relative">
                <Mail className="auth-modal-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or user@sahaj.ai"
                  className="auth-modal-input w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="auth-modal-label block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="auth-modal-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-modal-input w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-modal-submit-btn w-full mt-2 py-3 px-4 bg-[#FACC15] hover:bg-[#EAB308] text-gray-950 font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-yellow-500/20 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Please wait...' : isRegister ? 'Create Workspace' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google OAuth Login / Register */}
        <div className="my-4">
          <div className="relative my-3.5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="auth-modal-divider-line w-full border-t border-gray-800" />
            </div>
            <span className="auth-modal-divider-text relative px-3 bg-[#111827] text-[11px] uppercase tracking-wider text-gray-500 font-medium">
              or continue with
            </span>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In was cancelled or failed')}
              theme="filled_black"
              shape="pill"
              size="large"
              text={isRegister ? 'signup_with' : 'signin_with'}
              width="360"
            />
          </div>
        </div>

        {/* Toggle between Login and Register */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            className="auth-modal-switch-btn text-xs text-gray-400 hover:text-[#FACC15] transition cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  )
}
