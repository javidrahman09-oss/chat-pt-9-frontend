'use client'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

type Message = { role: 'user' | 'ai'; text: string }

const suggestions = [
  "Explain frozen shoulder rehabilitation",
  "Stages of stroke recovery",
  "Anatomy of rotator cuff muscles",
  "MCQ: Common physio exam topics",
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{role:string,content:string}[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const userMsg = (text || input).trim()
    if (!userMsg || loading) return
    setInput('')

    const newHistory = [...history, { role: 'user', content: userMsg }]
    setHistory(newHistory)
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: newHistory })
      })
      const data = await res.json()
      setHistory(prev => [...prev, { role: 'assistant', content: data.reply }])
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <main className="flex flex-col h-screen bg-[#0f1117] text-white overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/10 bg-[#0f1117]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <span className="text-white font-black text-sm">PT</span>
          </div>
          <div>
            <h1 className="font-black text-white text-base leading-tight tracking-tight">Chat-PT</h1>
            <p className="text-[10px] text-teal-400 font-medium tracking-widest uppercase">Physio AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-xs text-gray-400">AI Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-6 space-y-6">
        <div className="max-w-3xl mx-auto w-full space-y-6">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-teal-500/40 mb-2">
                <span className="text-white font-black text-3xl">P</span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                  Hello, Physiotherapy Experts 👋
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-md">
                  
                 I'm <span className="text-teal-400 font-bold">Chat-PT</span> — your AI-powered physiotherapy companion. Ask me anything.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mt-4">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-left px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 text-sm text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <span className="text-teal-400 mr-2 group-hover:mr-3 transition-all">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-black shrink-0 mt-1 shadow-lg shadow-teal-500/20">
                  PT
                </div>
              )}
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-teal-500 text-white rounded-tr-sm shadow-lg shadow-teal-500/20'
                  : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm'
              }`}>
                {m.role === 'ai' ? (
                  <div className="prose prose-sm prose-invert max-w-none
                    prose-headings:text-teal-400 prose-headings:font-bold prose-headings:mb-2
                    prose-strong:text-white prose-strong:font-semibold
                    prose-li:text-gray-300 prose-li:my-1
                    prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-2
                    prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
                    prose-ul:my-2 prose-ol:my-2">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{m.text}</p>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0 mt-1">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-lg shadow-teal-500/20">
                PT
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-[#0f1117]/90 backdrop-blur-md px-4 md:px-0 py-4">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex gap-3 items-end bg-white/5 border border-white/10 hover:border-teal-500/50 focus-within:border-teal-500/70 rounded-2xl px-4 py-3 transition-all duration-200 shadow-xl">
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none resize-none max-h-32 leading-relaxed"
              placeholder="Ask anything about physiotherapy..."
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              onKeyDown={handleKey}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-2">Chat-PT can make mistakes. Always verify clinical information.</p>
        </div>
      </div>
    </main>
  )
}