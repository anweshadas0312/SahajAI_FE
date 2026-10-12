import React from 'react'
import { ArrowRight, BookOpen, Sparkles, PenTool, Lightbulb, FileText, ExternalLink, Copy, Check, Pencil, RotateCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThinkingBulb } from './ThinkingBulb'
import { ChartRenderer } from './ChartRenderer'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useWorkspace } from '../context/WorkspaceContext'


const starterPrompts = [
  {
    category: 'Knowledge',
    title: 'Explain Any Concept',
    desc: 'Break down complex topics, science, history, or how things work in plain English',
    icon: BookOpen,
    prompt: 'Explain how quantum computing works using simple, everyday analogies that anyone can understand.',
  },
  {
    category: 'Research',
    title: 'Summarize & Analyze',
    desc: 'Condense long articles, extract key points, or compare different perspectives',
    icon: Sparkles,
    prompt: 'What are the key differences between renewable energy sources like solar and wind, and what are their trade-offs?',
  },
  {
    category: 'Writing',
    title: 'Draft & Polish Writing',
    desc: 'Craft articulate emails, cover letters, essays, or summaries with clear tone',
    icon: PenTool,
    prompt: 'Help me draft a clear, persuasive professional email announcing a new project initiative to stakeholders.',
  },
  {
    category: 'Planning',
    title: 'Brainstorm & Plan',
    desc: 'Explore fresh ideas, design productive routines, or plan upcoming projects',
    icon: Lightbulb,
    prompt: 'Suggest 5 creative and practical ideas to organize my weekly goals and boost everyday focus.',
  },
]

interface MessageListProps {
  isGenerating: boolean
  loadingStatus?: string
  handleSend: (prompt?: string) => void
  copiedIndex: number | null
  handleCopyCode: (code: string, idx: number) => void
  bottomRef: React.RefObject<HTMLDivElement | null>
  onEditPrompt?: (prompt: string) => void
  handleEditAndResend?: (targetIdx: number, newPromptText: string) => void
  handleRegenerate?: (assistantIdx: number) => void
}

export const MessageList: React.FC<MessageListProps> = ({
  isGenerating,
  loadingStatus = 'Thinking...',
  handleSend,
  copiedIndex,
  handleCopyCode,
  bottomRef,
  handleEditAndResend,
  handleRegenerate,
}) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { messages } = useWorkspace()

  const [editingIdx, setEditingIdx] = React.useState<number | null>(null)
  const [editingText, setEditingText] = React.useState<string>('')

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${messages.length === 0 && !isGenerating
      ? 'p-2 sm:p-4 flex flex-col'
      : 'p-3 sm:p-6 flex flex-col'
      }`}>
      {messages.length === 0 && !isGenerating ? (
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center sm:my-auto py-6 sm:py-8 px-2 sm:px-4 shrink-0 pb-[100px]">
          <div className="mb-2 sm:mb-3 flex items-center justify-center">
            <ThinkingBulb state="lit" size={46} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 text-center">
            Welcome to <span className="text-[#EAB308]">sahaj</span><span className={theme === 'dark' ? "text-white" : "text-black"}>AI</span>
          </h2>
          <p
            className={`text-xs sm:text-sm max-w-md text-center mb-3.5 sm:mb-5 px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'
              }`}
          >
            In <strong className={isLight ? 'text-gray-900 font-bold' : 'text-gray-200'}>
              Proudly supporting the Make in INDIA initiative.
            </strong>{' '}
            — built with innovation and technology for the world.
          </p>

          {/* Starter Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-2xl">
            {starterPrompts.map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={i}
                  style={{ '--card-index': i } as React.CSSProperties}
                  onClick={() => handleSend(card.prompt)}
                  className={`starter-card-anim group relative p-3 sm:p-3.5 rounded-xl border cursor-pointer text-left select-none transition-all duration-200 ${isLight
                    ? 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-md'
                    : 'bg-[#141a27] border-gray-800/90 hover:border-[#EAB308]/60 hover:bg-[#182030]'
                    }`}
                >
                  <div className="starter-card-shimmer" />

                  <div className="flex items-start justify-between mb-2 sm:mb-2.5 relative z-10">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className={`starter-icon-wrap p-1.5 rounded-xl transition-all duration-300 shadow-sm ${isLight
                        ? 'bg-amber-50 text-amber-700 group-hover:bg-amber-400 group-hover:text-gray-950 group-hover:scale-110 group-hover:rotate-[-4deg]'
                        : 'bg-[#EAB308]/10 text-[#EAB308] group-hover:bg-[#EAB308] group-hover:text-[#0b0f19] group-hover:scale-110 group-hover:rotate-[-4deg]'
                        }`}>
                        <Icon className="w-3.5 h-3.5 transition-colors" />
                      </div>
                      <span className={`starter-tag text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border transition-colors ${isLight
                        ? 'bg-gray-100 text-gray-600 border-gray-200 group-hover:border-amber-300 group-hover:text-amber-800'
                        : 'bg-gray-800/80 text-gray-300 border-gray-700/60 group-hover:border-[#EAB308]/40 group-hover:text-[#EAB308]'
                        }`}>
                        {card.category}
                      </span>
                    </div>
                    <div className={`flex items-center group-hover:translate-x-1 opacity-60 group-hover:opacity-100 transition-all duration-200 ${isLight ? 'text-gray-400 group-hover:text-amber-600' : 'text-gray-500 group-hover:text-[#EAB308]'
                      }`}>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h4 className={`text-[11px] sm:text-xs font-semibold transition-colors mb-0.5 relative z-10 ${isLight ? 'text-gray-950 group-hover:text-amber-700' : 'text-white group-hover:text-[#EAB308]'
                    }`}>
                    {card.title}
                  </h4>
                  <p className={`text-[10px] sm:text-[11px] leading-relaxed transition-colors relative z-10 ${isLight ? 'text-gray-600 group-hover:text-gray-800' : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                    {card.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl w-full mx-auto space-y-4 sm:space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === 'user' ? (
                editingIdx === idx ? (
                  /* Inline Prompt Edit Box */
                  <div className="flex flex-col items-end w-full my-2">
                    <div
                      className={`w-full max-w-[88%] sm:max-w-[82%] mr-9 sm:mr-11 rounded-2xl p-4 border shadow-lg flex flex-col gap-3 transition-colors ${isLight
                        ? 'bg-[#f3f4f6] border-gray-300 text-gray-950'
                        : 'bg-[#182030] border-gray-700 text-white'
                        }`}
                    >
                      <textarea
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            if (editingText.trim() && handleEditAndResend) {
                              const textToSubmit = editingText.trim()
                              setEditingIdx(null)
                              handleEditAndResend(idx, textToSubmit)
                            }
                          }
                        }}
                        rows={Math.max(2, editingText.split('\n').length)}
                        className={`w-full bg-transparent outline-none resize-none text-xs sm:text-sm leading-relaxed ${isLight ? 'text-gray-950 placeholder-gray-400' : 'text-white placeholder-gray-500'
                          }`}
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingIdx(null)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${isLight
                            ? 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                            : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                            }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingText.trim() && handleEditAndResend) {
                              const textToSubmit = editingText.trim()
                              setEditingIdx(null)
                              handleEditAndResend(idx, textToSubmit)
                            }
                          }}
                          disabled={!editingText.trim() || isGenerating}
                          className="px-4 py-1.5 rounded-full text-xs font-bold bg-black text-white dark:bg-black dark:text-white hover:bg-gray-900 transition cursor-pointer disabled:opacity-40 shadow-sm"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Normal User Message Bubble */
                  <div className="flex flex-col items-end group">
                    {/* User Message Bubble + Avatar */}
                    <div className="flex items-start justify-end gap-2 sm:gap-3.5 w-full">
                      <div
                        className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4.5 break-words ${isLight
                          ? 'bg-[#EAB308] text-gray-950 border border-amber-500/40 rounded-tr-none font-medium'
                          : 'bg-[#1c2436] text-white border border-gray-700/80 rounded-tr-none'
                          }`}
                      >
                        {msg.files && msg.files.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {msg.files.map(f => (
                              <a
                                key={f.id}
                                href={`/api/files/${f.id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs hover:underline transition cursor-pointer group/file ${isLight
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-900 hover:border-amber-400'
                                  : 'bg-[#141a27] border-gray-700 hover:border-[#EAB308] text-[#EAB308]'
                                  }`}
                                title="Click to view file"
                              >
                                <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-amber-800' : 'text-[#EAB308]'}`} />
                                <span className="font-medium">{f.original_name}</span>
                                <ExternalLink className={`w-3 h-3 ${isLight ? 'text-amber-700' : 'text-gray-400 group-hover/file:text-[#EAB308]'}`} />
                              </a>
                            ))}
                          </div>
                        )}
                        {!msg.isAutoPrompt && (
                          <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                        )}
                      </div>

                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#EAB308] text-gray-950 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-black shadow-sm border border-yellow-500/40 uppercase">
                        {user?.username ? user.username[0] : 'U'}
                      </div>
                    </div>

                    {/* Outside Action Buttons (Below Prompt Bubble, Aligned Right) */}
                    {msg.content && (
                      <div className="flex items-center gap-1 mt-1 pr-9 sm:pr-11 opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(msg.content, idx)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${isLight
                            ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/80'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                          title="Copy prompt"
                        >
                          {copiedIndex === idx ? (
                            <Check className={`w-3.5 h-3.5 ${isLight ? 'text-gray-950' : 'text-white'}`} />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIdx(idx)
                            setEditingText(msg.content)
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${isLight
                            ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/80'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                          title="Edit prompt"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* Assistant Message Row */
                <div className="w-full flex flex-col items-start group">
                  {/* Assistant Header with Bulb & Status */}
                  <div className="flex items-center gap-2.5 mb-1.5 pl-1">
                    <ThinkingBulb
                      state={isGenerating && idx === messages.length - 1 ? 'thinking' : 'lit'}
                      size={26}
                    />
                    {isGenerating && idx === messages.length - 1 && !msg.content && (
                      <div
                        className={`text-xs sm:text-sm font-medium tracking-wide flex items-center select-none ${isLight ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        aria-live="polite"
                        aria-label={loadingStatus || 'Thinking'}
                      >
                        <span
                          key={(loadingStatus || 'Thinking...').replace(/\.+$/, '').trim() || 'Thinking'}
                          className="sahaj-status-fade sahaj-thinking-text"
                        >
                          {(loadingStatus || 'Thinking...').replace(/\.+$/, '').trim() || 'Thinking'}
                        </span>
                        <span className="sahaj-thinking-dots" aria-hidden="true">
                          <span className="sahaj-dot dot-1">.</span>
                          <span className="sahaj-dot dot-2">.</span>
                          <span className="sahaj-dot dot-3">.</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {msg.content ? (
                    <div
                      className={`w-full rounded-2xl p-4 sm:p-5 break-words transition-all ${isLight
                        ? 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                        : 'bg-[#141a27] text-gray-200 border border-gray-800'
                        }`}
                    >
                      <div className="relative group text-xs sm:text-sm leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-hidden break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, children, ...props }) => (
                              <p className="break-words leading-relaxed my-1.5" {...props}>
                                {children}
                              </p>
                            ),
                            a: ({ node, href, children, ...props }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-600 dark:text-[#EAB308] hover:text-amber-700 dark:hover:text-[#EAB308] underline underline-offset-3 font-semibold break-all inline-flex items-center gap-1 cursor-pointer transition hover:opacity-90"
                                {...props}
                              >
                                <span>{children}</span>
                                <ExternalLink className="w-3.5 h-3.5 inline-block shrink-0 opacity-80" />
                              </a>
                            ),
                            table: ({ node, children, ...props }) => (
                              <div className="overflow-x-auto max-w-full my-3 border border-gray-800 rounded-lg">
                                <table className="min-w-full text-left text-xs divide-y divide-gray-800" {...props}>
                                  {children}
                                </table>
                              </div>
                            ),
                            pre: ({ node, children, ...props }: any) => (
                              <pre className="bg-[#0f141f] border border-[#232d3f] p-3 rounded-lg overflow-x-auto max-w-full text-xs font-mono my-2 text-gray-200" {...props}>
                                {children}
                              </pre>
                            ),
                            code: ({ node, inline, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const lang = match ? match[1].toLowerCase() : '';
                              const rawContent = String(children).replace(/\n$/, '').trim();

                              if (lang === 'chart' || lang === 'pie' || lang === 'bar' || lang === 'line') {
                                try {
                                  const parsed = JSON.parse(rawContent);
                                  if (parsed && typeof parsed === 'object') {
                                    if (!parsed.type && (lang === 'pie' || lang === 'bar' || lang === 'line')) {
                                      parsed.type = lang;
                                    }
                                    return <ChartRenderer dataPayload={parsed} />;
                                  }
                                } catch (e) {
                                  if (isGenerating && idx === messages.length - 1) {
                                    return (
                                      <div className="my-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-500 dark:text-amber-400 text-xs flex items-center gap-2 not-prose">
                                        <span className="animate-spin inline-block w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full" />
                                        <span>Generating chart visualization...</span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="my-2 p-3.5 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 dark:text-red-400 text-xs font-medium not-prose">
                                      <div className="font-bold flex items-center gap-1.5 mb-1">
                                        <span>⚠️</span>
                                        <span>Chart Rendering Limitation</span>
                                      </div>
                                      <p className="opacity-90">Unable to parse chart specification payload.</p>
                                    </div>
                                  );
                                }
                              }

                              if (inline) {
                                return (
                                  <code className="bg-[#141a27] text-[#EAB308] px-1.5 py-0.5 rounded font-mono text-xs break-all" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <code className="block w-fit min-w-full font-mono text-xs" {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>

                        <div className="flex justify-end items-center gap-3 pt-2">
                          {handleRegenerate && (
                            <button
                              type="button"
                              onClick={() => handleRegenerate(idx)}
                              disabled={isGenerating}
                              className={`flex items-center gap-1.5 text-[11px] transition cursor-pointer disabled:opacity-40 ${isLight ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-[#EAB308]'
                                }`}
                              title="Try again / Regenerate response"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${isGenerating && idx === messages.length - 1 ? 'animate-spin' : ''}`} />
                              <span>Try Again</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyCode(msg.content, idx)}
                            className={`flex items-center gap-1.5 text-[11px] transition cursor-pointer ${isLight ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-[#EAB308]'
                              }`}
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className={`w-3.5 h-3.5 ${isLight ? 'text-gray-950' : 'text-white'}`} />
                                <span className={isLight ? 'text-gray-950 font-bold' : 'text-white font-bold'}>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
