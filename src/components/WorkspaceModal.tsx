import React, { useState } from 'react'
import { FolderPlus, X } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'

interface WorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
}

const COLOR_OPTIONS = [
  '#FACC15', // Yellow
  '#F59E0B', // Amber
  '#E2E8F0', // Slate White
  '#38BDF8', // Sky Blue
  '#A855F7', // Violet
  '#34D399', // Emerald
]

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace } = useWorkspace()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#FACC15')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    const success = await createWorkspace(name.trim(), description.trim(), color)
    setIsSubmitting(false)
    if (success) {
      setName('')
      setDescription('')
      setColor('#FACC15')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#161b22] border border-gray-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-white overflow-hidden my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Create New Workspace</h3>
            <p className="text-xs text-gray-400">Isolate your projects, prompts, and chat histories</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Workspace Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Research & Analysis, Python Backend"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief summary of what you explore in this workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0d1117] border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Accent Color</label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#161b22]' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-gray-950 font-semibold text-xs transition shadow-lg shadow-yellow-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
