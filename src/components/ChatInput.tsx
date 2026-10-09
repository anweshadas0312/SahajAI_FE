import React from 'react'
import { Paperclip, Send, Loader2, X, FileText, Maximize2, Minimize2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import type { UploadedFile } from '../types'

interface ChatInputProps {
  input: string
  setInput: (val: string) => void
  handleSend: () => void
  attachedFiles: UploadedFile[]
  isUploadingFile: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveFile: (fileId: string) => void
  isGenerating: boolean
  onRequireAuth?: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSend,
  attachedFiles,
  isUploadingFile,
  fileInputRef,
  handleFileUpload,
  handleRemoveFile,
  isGenerating,
  onRequireAuth,
}) => {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { isAuthenticated } = useAuth()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showExpand, setShowExpand] = React.useState(false)

  React.useEffect(() => {
    if (textareaRef.current) {
      if (isExpanded) {
        textareaRef.current.style.height = '70vh'
      } else if (!input) {
        textareaRef.current.style.height = ''
        setShowExpand(false)
        setIsExpanded(false)
      } else {
        textareaRef.current.style.height = 'auto'
        const currentHeight = textareaRef.current.scrollHeight
        textareaRef.current.style.height = `${currentHeight}px`
        if (currentHeight > 105) {
          setShowExpand(true)
        } else {
          setShowExpand(false)
          setIsExpanded(false)
        }
      }
    }
  }, [input, isExpanded])

  return (
    <div className={`p-2 sm:p-4 pb-3 sm:pb-4 sticky bottom-0 z-20 shrink-0 transition-colors ${isLight
      ? 'bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent'
      : 'bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent'
      }`}>
      <div className="max-w-3xl mx-auto">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.xls,.py,.js,.ts,.jsx,.tsx,.json,.html,.css,.sql,.xml"
          className="hidden"
        />

        {/* Attached Files Badges */}
        {(attachedFiles.length > 0 || isUploadingFile) && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            {attachedFiles.map(file => (
              <div
                key={file.id}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs shadow-sm ${isLight
                  ? 'bg-white border-gray-300 text-gray-800'
                  : 'bg-[#1c2436] border-gray-700 text-gray-200'
                  }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#EAB308]'}`} />
                <span className="max-w-[120px] sm:max-w-[150px] truncate font-medium">{file.original_name}</span>
                <span className={`text-[9px] sm:text-[10px] font-mono ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>✓ Ready</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className={`ml-0.5 sm:ml-1 p-0.5 rounded-md transition ${isLight ? 'hover:bg-gray-100 text-gray-400 hover:text-red-500' : 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                    }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {isUploadingFile && (
              <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs animate-pulse ${isLight
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-[#1c2436] border-yellow-500/50 text-[#EAB308]'
                }`}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        )}

        <div className={`relative flex items-end overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 ${isLight
          ? 'bg-white border-gray-300 shadow-md focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20'
          : 'bg-[#141a27] border-gray-700/80 shadow-xl focus-within:border-[#EAB308] focus-within:ring-1 focus-within:ring-[#EAB308]/40'
          }`}>

          {/* File Attachment Button */}
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                onRequireAuth?.()
                return
              }
              fileInputRef.current?.click()
            }}
            disabled={isUploadingFile || isGenerating}
            className={`flex items-center justify-center pl-2.5 sm:pl-3.5 pr-1 h-12 sm:h-14 transition cursor-pointer disabled:opacity-30 shrink-0 ${isLight ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-[#EAB308]'
              }`}
            title="Attach Document/File for context"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            className={`w-full bg-transparent pl-1.5 sm:pl-2 pr-11 sm:pr-14 py-[16px] sm:py-[18px] outline-none resize-none h-12 sm:h-14 transition-all duration-300 ${isExpanded ? 'max-h-[80vh]' : 'max-h-28'} overflow-y-auto text-xs sm:text-sm leading-tight custom-scrollbar ${isLight
              ? 'text-gray-950 placeholder-gray-400'
              : 'text-white placeholder-gray-500'
              }`}
            placeholder="Start Interacting..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isAuthenticated) {
                  onRequireAuth?.()
                  return
                }
                if (input.trim() || attachedFiles.length > 0) {
                  handleSend()
                }
              }
            }}
            disabled={isGenerating}
          />

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                onRequireAuth?.()
                return
              }
              handleSend()
            }}
            disabled={isAuthenticated && ((!input.trim() && attachedFiles.length === 0) || isGenerating || isUploadingFile)}
            className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2.5 p-2 sm:p-2.5 bg-[#EAB308] hover:bg-[#EAB308] text-gray-950 font-bold rounded-lg sm:rounded-xl transition duration-150 disabled:opacity-30 disabled:hover:bg-[#EAB308] cursor-pointer shadow-md shadow-yellow-500/20 shrink-0"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {showExpand && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2.5 p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${isLight
                ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          )}
        </div>

        <div className={`flex items-center justify-between mt-1.5 sm:mt-2 px-1 sm:px-2 text-[10px] sm:text-[11px] ${isLight ? 'text-gray-500' : 'text-gray-500'
          }`}>
          <span className="hidden sm:inline-flex items-center gap-1">
            Shift + Enter for new line • Attach multiple files with <Paperclip className="w-3 h-3 text-gray-400 inline" /> (Max 2 MB each)
          </span>
          <span className="sm:hidden flex items-center gap-1">
            Tap <Paperclip className="w-3 h-3 text-gray-400 inline" /> to attach multiple files (Max 2 MB each) • Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  )
}
