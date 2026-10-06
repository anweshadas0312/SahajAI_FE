import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function App() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('mistral:latest')
  const [jailbreak, setJailbreak] = useState('default')
  const [webAccess, setWebAccess] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const conversationIdRef = useRef(Math.random().toString(36).substring(2))
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return
    const userMsg = input.trim()
    setInput('')
    
    // Add user message and a placeholder for assistant
    const newMessages = [...messages, {role: 'user', content: userMsg}]
    setMessages([...newMessages, {role: 'assistant', content: ''}])
    setIsGenerating(true)

    try {
      const token = Math.random().toString(36).substring(2)
      const response = await fetch(`/backend-api/v2/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({
          conversation_id: conversationIdRef.current,
          action: '_ask',
          model: model,
          jailbreak: jailbreak,
          meta: {
            id: token,
            content: {
              conversation: newMessages,
              internet_access: webAccess,
              content_type: 'text',
              parts: [{ content: userMsg, role: 'user' }]
            }
          }
        })
      })

      if (!response.body) throw new Error('No response body')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        setMessages([...newMessages, {role: 'assistant', content: assistantContent}])
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => {
        const last = prev[prev.length - 1]
        return [...prev.slice(0, -1), { ...last, content: last.content + '\n\n**[Error: Could not fetch response]**' }]
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#212121] p-4 flex flex-col justify-between border-r border-gray-800">
        <div>
          <button onClick={() => { setMessages([]); conversationIdRef.current = Math.random().toString(36).substring(2) }} className="w-full bg-[#2f2f2f] hover:bg-[#3d3d3d] text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Conversation
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <button onClick={() => setMessages([])} className="flex items-center gap-2 p-2 hover:bg-[#2f2f2f] rounded-md text-sm text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Conversations
          </button>
          
          <div className="flex items-center justify-between p-2 text-sm text-gray-300">
            <span>Dark Mode</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          
          <div className="flex items-center justify-between p-2 text-sm text-gray-300">
            <span>Language</span>
            <select className="bg-[#2f2f2f] text-white outline-none rounded p-1">
              <option>en_US</option>
              <option>bn_BD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <h1 className="text-4xl font-bold mb-2">FreeGPT</h1>
              <p>A conversational AI system that listens, learns, and challenges</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 overflow-hidden ${msg.role === 'user' ? 'bg-[#2f2f2f]' : 'bg-transparent'}`}>
                  {msg.role === 'user' ? msg.content : (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-linear-to-t from-[#1a1a1a] to-transparent">
          <div className="max-w-3xl mx-auto relative flex items-center bg-[#2f2f2f] rounded-xl shadow-lg border border-gray-700 focus-within:border-gray-500 transition-colors">
            <textarea
              className="w-full bg-transparent text-white p-4 outline-none resize-none h-14"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isGenerating}
            />
            <button className="p-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              onClick={handleSend}
              disabled={isGenerating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>

          <div className="max-w-3xl mx-auto flex gap-4 mt-3 justify-center text-xs text-gray-400">
            <select className="bg-[#2f2f2f] border border-gray-700 rounded p-1 outline-none" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="mistral:latest">Mistral Latest</option>
              <option value="qwen2.5-coder:1.5b">Qwen 2.5 Coder</option>
            </select>
            <select className="bg-[#2f2f2f] border border-gray-700 rounded p-1 outline-none" value={jailbreak} onChange={(e) => setJailbreak(e.target.value)}>
              <option value="default">Default</option>
              <option value="gpt-dan-11.0">DAN</option>
              <option value="gpt-evil">Evil</option>
            </select>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={webAccess} onChange={(e) => setWebAccess(e.target.checked)} className="form-checkbox bg-[#2f2f2f] border-gray-700 rounded text-blue-500" />
              Web Access
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
