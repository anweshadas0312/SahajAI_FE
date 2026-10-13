import React, { useState, useEffect } from 'react'
import { Cpu, X, Globe, Key, Eye, EyeOff, Zap } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import type { LlmProvider } from '../types'

interface LlmProviderModalProps {
  isOpen: boolean
  provider: LlmProvider | null
  onClose: () => void
  onSave: (data: Partial<LlmProvider>) => Promise<void>
}

export const LlmProviderModal: React.FC<LlmProviderModalProps> = ({
  isOpen,
  provider,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [name, setName] = useState('')
  const [providerType, setProviderType] = useState('')
  const [modelName, setModelName] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [timeoutSec, setTimeoutSec] = useState<number>(600)
  const [isActive, setIsActive] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (provider) {
      setName(provider.name || '')
      setProviderType(provider.provider_type || '')
      setModelName(provider.model_name || '')
      setEndpoint(provider.endpoint || '')
      setApiKey(provider.api_key || '')
      setTimeoutSec(provider.timeout || 600)
      setIsActive(provider.is_active ?? true)
    } else {
      setName('')
      setProviderType('')
      setModelName('')
      setEndpoint('')
      setApiKey('')
      setTimeoutSec(600)
      setIsActive(true)
    }
  }, [provider, isOpen])

  if (!isOpen) return null

  const inputThemeClasses = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
    : 'bg-[#182030] border-gray-700/80 text-white placeholder:text-gray-500 focus:border-[#EAB308]'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !providerType.trim() || !modelName.trim()) return

    setIsSubmitting(true)
    await onSave({
      id: provider?.id,
      name,
      provider_type: providerType,
      model_name: modelName,
      endpoint,
      api_key: apiKey,
      timeout: Number(timeoutSec) || 600,
      is_active: isActive,
    })
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto transition-colors ${isLight ? 'bg-slate-900/35' : 'bg-black/80'
        }`}
    >
      <div className={`relative w-full max-w-xl text-gray-900 dark:text-gray-100 rounded-3xl p-6 sm:p-7 transition-colors my-auto ${isLight
        ? 'bg-white border border-slate-200 shadow-[0_24px_80px_rgba(15,23,42,0.22)]'
        : 'bg-[#111827] border border-gray-800 shadow-2xl'
        }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-[#EAB308] border border-amber-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {provider ? 'Edit LLM Provider' : 'Add New LLM Provider'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter direct credentials and endpoint for your AI engine.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300 mb-1.5">
                DISPLAY NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Mistral Local"
                required
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none transition ${inputThemeClasses}`}
              />
            </div>

            {/* Provider Type */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300 mb-1.5">
                PROVIDER TYPE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={providerType}
                onChange={e => setProviderType(e.target.value)}
                placeholder="Mistral"
                required
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none transition ${inputThemeClasses}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Model Name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300 mb-1.5">
                MODEL NAME <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Cpu className="w-4 h-4 absolute left-3.5 text-gray-400" />
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  placeholder="mistral:latest"
                  required
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-mono outline-none transition ${inputThemeClasses}`}
                />
              </div>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300 mb-1.5">
                TIMEOUT (SEC) <span className="text-gray-400 font-normal lowercase">(def: 600)</span>
              </label>
              <div className="relative flex items-center">
                <Zap className="w-4 h-4 absolute left-3 text-gray-400" />
                <input
                  type="number"
                  value={timeoutSec}
                  onChange={e => setTimeoutSec(Number(e.target.value))}
                  placeholder="600"
                  className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono outline-none transition ${inputThemeClasses}`}
                />
              </div>
            </div>
          </div>

          {/* Base URL / Endpoint */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300 mb-1.5">
              BASE URL / FULL ENDPOINT <span className="text-gray-400 font-normal lowercase">(optional - e.g. http://122.163.121.176:3041/api/chat)</span>
            </label>
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 absolute left-3.5 text-gray-400" />
              <input
                type="text"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                placeholder="https://api.mistral.ai/v1/chat/completions"
                className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-mono outline-none transition ${inputThemeClasses}`}
              />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-700 dark:text-gray-300 mb-1.5">
              API KEY <span className="text-gray-400 font-normal lowercase">(blank for local models)</span>
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 absolute left-3.5 text-gray-400" />
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="(leave empty to keep existing)"
                className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono outline-none transition ${inputThemeClasses}`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50 ${isLight ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#E67E22] hover:bg-[#D35400]'
                }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
