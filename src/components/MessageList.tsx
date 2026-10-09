import React from 'react'
import { ArrowRight, BookOpen, Sparkles, PenTool, Lightbulb, FileText, ExternalLink, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThinkingBulb } from './ThinkingBulb'
import { ChartRenderer } from './ChartRenderer'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useWorkspace } from '../context/WorkspaceContext'

// Fallback helper to extract chart data if AI model outputs text bullet points, tables, or prose instead of ```chart codeblock
const extractChartFromText = (text: string) => {
  if (!text || text.includes('```chart')) return null

  const lower = text.toLowerCase()
  const lines = text.split('\n')
  const items: { name: string; value: number }[] = []

  for (const line of lines) {
    const cleanLine = line.replace(/[\*\_\`]/g, '').trim()
    if (!cleanLine) continue

    // Pattern 1: Table row | Gold | 22956 | or | Gold | $22,956 |
    if (cleanLine.startsWith('|') && cleanLine.endsWith('|')) {
      const cells = cleanLine.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 2) {
        const nameCandidate = cells[0]
        const valCandidate = parseFloat(cells[1].replace(/[\$,]/g, ''))
        if (nameCandidate && !isNaN(valCandidate) && valCandidate > 0) {
          const lowerC = nameCandidate.toLowerCase()
          const isMeta = ['category', 'item', 'metal', 'type', 'name', '---', 'header', 'label', 'parameter', 'id'].some(k => lowerC.includes(k))
          if (!isMeta) {
            if (!items.some(it => it.name.toLowerCase() === lowerC)) {
              items.push({ name: nameCandidate, value: valCandidate })
            }
          }
        }
      }
      continue
    }

    // Pattern 2: Key-value lines: "Gold: 22,956" or "• Gold: 48.9%" or "Gold - $22,956"
    const match = cleanLine.match(/^[-*•\d\.\)]*\s*([A-Za-z0-9\s\-\/]+?)[:=]\s*(?:[^0-9\n]*?)\$?([0-9]+(?:[\.,][0-9]+)?)%?/i)
    if (match) {
      const rawName = match[1].trim()
      const rawVal = parseFloat(match[2].replace(/,/g, ''))
      if (rawName && !isNaN(rawVal) && rawVal > 0) {
        const lowerName = rawName.toLowerCase()
        const isMeta = ['date range', 'metal types', 'order number', 'total sales', 'explanation', 'most sold metals', 'average cost', 'item types', 'pie chart', 'bar chart', 'summary', 'key topics', 'data table', 'chart title', 'subtitle', 'price level', 'order count'].some(k => lowerName.includes(k))
        if (!isMeta) {
          if (!items.some(it => it.name.toLowerCase() === lowerName)) {
            items.push({ name: rawName, value: rawVal })
          }
        }
      }
    }
  }

  if (items.length >= 2) {
    const chartType = lower.includes('bar chart') ? 'bar' : 'pie'
    return {
      type: chartType,
      title: chartType === 'bar' ? 'Bar Chart Visualization' : 'Pie Chart Breakdown',
      data: items,
    }
  }

  return null
}

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
  handleSend: (prompt?: string) => void
  copiedIndex: number | null
  handleCopyCode: (code: string, idx: number) => void
  bottomRef: React.RefObject<HTMLDivElement>
}

export const MessageList: React.FC<MessageListProps> = ({
  isGenerating,
  handleSend,
  copiedIndex,
  handleCopyCode,
  bottomRef,
}) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { messages } = useWorkspace()

  return (
    <div className={`${messages.length === 0 && !isGenerating
      ? 'flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 flex flex-col'
      : 'flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 flex flex-col'
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
            <div
              key={idx}
              className={`flex gap-2 sm:gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="shrink-0 pt-0.5">
                  <ThinkingBulb
                    state={isGenerating && idx === messages.length - 1 ? 'thinking' : 'lit'}
                    size={32}
                  />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4.5 break-words ${msg.role === 'user'
                  ? isLight
                    ? 'bg-[#EAB308] text-gray-950 border border-amber-500/40 rounded-tr-none font-medium'
                    : 'bg-[#1c2436] text-white border border-gray-700/80 rounded-tr-none'
                  : isLight
                    ? 'bg-white text-gray-900 border border-gray-200 rounded-tl-none prose shadow-sm max-w-none'
                    : 'bg-[#141a27] text-gray-200 border border-gray-800 rounded-tl-none prose prose-invert max-w-none'
                  }`}
              >
                {msg.role === 'user' ? (
                  <div className="space-y-2">
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {msg.files.map(f => (
                          <a
                            key={f.id}
                            href={`/api/files/${f.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs hover:underline transition cursor-pointer group ${isLight
                              ? 'bg-amber-50/80 border-amber-300 text-amber-900 hover:border-amber-400'
                              : 'bg-[#141a27] border-gray-700 hover:border-[#EAB308] text-[#EAB308]'
                              }`}
                            title="Click to view file"
                          >
                            <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-amber-800' : 'text-[#EAB308]'}`} />
                            <span className="font-medium">{f.original_name}</span>
                            <ExternalLink className={`w-3 h-3 ${isLight ? 'text-amber-700' : 'text-gray-400 group-hover:text-[#EAB308]'}`} />
                          </a>
                        ))}
                      </div>
                    )}
                    {!msg.isAutoPrompt && (
                      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                ) : (
                  <div className="relative group text-xs sm:text-sm leading-relaxed space-y-2">
                    {msg.content ? (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
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
                            code: ({ node, inline, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const lang = match ? match[1].toLowerCase() : '';
                              const rawContent = String(children).replace(/\n$/, '').trim();

                              if (lang === 'chart' || lang === 'pie' || lang === 'bar' || lang === 'line' || lang === 'json' || !lang) {
                                try {
                                  const parsed = JSON.parse(rawContent);
                                  if (parsed && (Array.isArray(parsed.data) || parsed.type || parsed.title)) {
                                    if (!parsed.type && (lang === 'pie' || lang === 'bar' || lang === 'line')) {
                                      parsed.type = lang;
                                    }
                                    if (Array.isArray(parsed.data) && parsed.data.length > 0) {
                                      return <ChartRenderer dataPayload={parsed} />;
                                    }
                                  }
                                } catch (e) {
                                  // Not valid JSON chart data, fallback to normal code block
                                }
                              }

                              if (inline) {
                                return (
                                  <code className="bg-[#141a27] text-[#EAB308] px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <pre className="bg-[#0f141f] border border-[#232d3f] p-3 rounded-lg overflow-x-auto text-xs font-mono my-2 text-gray-200" {...props}>
                                  <code>{children}</code>
                                </pre>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>

                        {/* Fallback chart extractor if model wrote text breakdown without ```chart block */}
                        {(() => {
                          const fallbackChart = extractChartFromText(msg.content)
                          return fallbackChart ? <ChartRenderer dataPayload={fallbackChart} /> : null
                        })()}
                      </>
                    ) : (
                      <span className="dots inline-flex items-center py-1.5" aria-label="Thinking">
                        <span></span><span></span><span></span>
                      </span>
                    )}
                    {msg.content && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleCopyCode(msg.content, idx)}
                          className={`flex items-center gap-1.5 text-[11px] transition cursor-pointer ${isLight ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-[#EAB308]'
                            }`}
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#EAB308] text-gray-950 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-black shadow-sm border border-yellow-500/40 uppercase">
                  {user?.username ? user.username[0] : 'U'}
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
