import React, { useState, useRef, useEffect, useCallback } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  User as UserIcon,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Sun,
  Moon,
  RotateCw,
  ShieldCheck,
} from 'lucide-react'
import { ThinkingBulb } from './ThinkingBulb'

interface AuthModalProps {
  isOpen: boolean
  onClose?: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isRegister, setIsRegister] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CAPTCHA Challenge State
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')

  const refreshCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(code)
    setCaptchaInput('')
  }, [])

  useEffect(() => {
    if (isOpen) {
      refreshCaptcha()
    }
  }, [isOpen, isRegister, refreshCaptcha])

  // Draw visually distorted security CAPTCHA canvas
  useEffect(() => {
    if (!captchaCode || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Background fill
    ctx.fillStyle = theme === 'light' ? '#f1f5f9' : '#0a0f1d'
    ctx.fillRect(0, 0, width, height)

    // Noise wave lines
    const colors = ['#EAB308', '#38BDF8', '#F43F5E', '#A855F7', '#10B981', '#F59E0B']
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = colors[i % colors.length]
      ctx.lineWidth = 1 + Math.random() * 1.2
      ctx.beginPath()
      ctx.moveTo(Math.random() * 15, Math.random() * height)
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        width - Math.random() * 15, Math.random() * height
      )
      ctx.stroke()
    }

    // Noise dots
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw characters with random rotation, spacing & color
    const charSpacing = (width - 24) / captchaCode.length
    for (let i = 0; i < captchaCode.length; i++) {
      ctx.save()
      const char = captchaCode[i]
      const x = 14 + i * charSpacing
      const y = height / 2 + 6 + (Math.random() * 4 - 2)
      const angle = (Math.random() - 0.5) * 0.35

      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.font = 'bold 20px "Courier New", monospace'
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillText(char, 0, 0)
      ctx.restore()
    }
  }, [captchaCode, theme])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validate CAPTCHA
    if (!captchaInput.trim()) {
      setError('Please enter the 6-character security verification code.')
      setIsSubmitting(false)
      return
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect CAPTCHA verification code. A new code has been generated.')
      refreshCaptcha()
      setIsSubmitting(false)
      return
    }

    if (isRegister) {
      if (!username || !email || !password) {
        setError('Please fill in all fields')
        setIsSubmitting(false)
        return
      }
      const res = await register(username, email, password)
      if (!res.success) {
        setError(res.error || 'Registration failed')
        refreshCaptcha()
      } else if (onClose) {
        onClose()
      }
    } else {
      if (!identifier || !password) {
        setError('Please enter your email and password')
        setIsSubmitting(false)
        return
      }
      const res = await login(identifier, password)
      if (!res.success) {
        setError(res.error || 'Login failed')
        refreshCaptcha()
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
    <div
      onClick={e => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
      className="auth-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto transition-all"
    >
      <div className="auth-modal-card relative w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden transition-colors my-auto">
        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-[#EAB308] hover:bg-gray-800 transition cursor-pointer z-10"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#EAB308]" /> : <Moon className="w-4 h-4 text-amber-500" />}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* Glow accent */}
        <div className="auth-glow-top absolute -top-16 -right-16 w-36 h-36 bg-[#EAB308]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="auth-glow-bottom absolute -bottom-16 -left-16 w-36 h-36 bg-[#EAB308]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-3 flex items-center justify-center">
            <ThinkingBulb state="lit" size={52} />
          </div>
          <h2 className="auth-modal-title text-2xl font-extrabold tracking-tight">
            <span className="text-yellow-500">sahaj</span><span className={theme === 'dark' ? "text-white" : "text-black"}>AI</span>
          </h2>
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
                    className="auth-modal-input w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] transition"
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
                    className="auth-modal-input w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="auth-modal-label block text-xs font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="auth-modal-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="user@sahaj.ai"
                  className="auth-modal-input w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="auth-modal-label block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="auth-modal-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-modal-input w-full pl-10 pr-10 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none p-1 rounded-md transition cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Security CAPTCHA Challenge */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="auth-modal-label flex items-center gap-1.5 text-xs font-medium text-gray-300">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Security Verification</span>
              </label>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="flex items-center gap-1 text-[11px] text-[#EAB308] hover:underline transition cursor-pointer"
                title="Generate new CAPTCHA"
              >
                <RotateCw className="w-3 h-3" />
                <span>Change Code</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Canvas Preview Badge */}
              <div
                onClick={refreshCaptcha}
                title="Click to refresh CAPTCHA code"
                className="relative border border-gray-700/80 rounded-xl overflow-hidden bg-gray-950 shrink-0 shadow-inner cursor-pointer hover:border-[#EAB308]/60 transition"
              >
                <canvas
                  ref={canvasRef}
                  width={140}
                  height={42}
                  className="block"
                />
              </div>

              {/* CAPTCHA Input Field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter 6-char code"
                  className="auth-modal-input w-full px-3.5 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 text-sm tracking-wider uppercase font-mono focus:outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-modal-submit-btn w-full mt-2 py-3 px-4 bg-[#EAB308] hover:bg-[#EAB308] text-gray-950 font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-yellow-500/20 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Please wait...' : isRegister ? 'Sign Up' : 'Sign In'}</span>
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
              width="310"
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
            className="auth-modal-switch-btn text-xs text-gray-400 hover:text-[#EAB308] transition cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  )
}
