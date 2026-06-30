'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import Link from 'next/link'
import { getAnonId } from '../lib/anonId'

interface Sector {
  id: string
  name: string
}

interface Poll {
  id: string
  sector_id: string
  user_id: string
  user_name: string
  question: string
  option_1: string
  option_2: string
  option_3: string
  option_4: string
  created_at: string
}

interface VoteCounts {
  [option: number]: number
}

export default function DiscussionPage() {
  const supabase = createClient()
  const [anonId, setAnonId] = useState<string>('')

  const [sectors, setSectors] = useState<Sector[]>([])
  const [activeSector, setActiveSector] = useState<string>('')
  const [polls, setPolls] = useState<Poll[]>([])

  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [opt1, setOpt1] = useState('')
  const [opt2, setOpt2] = useState('')
  const [opt3, setOpt3] = useState('')
  const [opt4, setOpt4] = useState('')
  const [posting, setPosting] = useState(false)

  const [voteData, setVoteData] = useState<Record<string, { counts: VoteCounts; myVote: number | null; total: number }>>({})

  useEffect(() => {
    async function init() {
      const id = getAnonId()
      setAnonId(id)

      const { data: sectorData } = await supabase.from('sectors').select('*').order('name')
      if (sectorData) {
        setSectors(sectorData)
        if (sectorData.length > 0) setActiveSector(sectorData[0].id)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (activeSector) loadPolls(activeSector)
  }, [activeSector])

  async function loadPolls(sectorId: string) {
    const { data } = await supabase
      .from('polls')
      .select('*')
      .eq('sector_id', sectorId)
      .order('created_at', { ascending: false })

    if (data) {
      setPolls(data)
      data.forEach((poll: Poll) => loadVotes(poll.id))
    }
  }

  async function loadVotes(pollId: string) {
    const currentId = getAnonId()
    const { data } = await supabase.from('poll_votes').select('option_choice, user_id').eq('poll_id', pollId)
    if (data) {
      const counts: VoteCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
      let myVote: number | null = null
      data.forEach((v: any) => {
        counts[v.option_choice] = (counts[v.option_choice] || 0) + 1
        if (v.user_id === currentId) myVote = v.option_choice
      })
      const total = data.length
      setVoteData((prev) => ({ ...prev, [pollId]: { counts, myVote, total } }))
    }
  }

  async function handleVote(pollId: string, choice: number) {
    const existing = voteData[pollId]
    if (existing?.myVote) return

    const { error } = await supabase.from('poll_votes').insert({
      poll_id: pollId,
      user_id: anonId,
      option_choice: choice,
    })
    if (!error) loadVotes(pollId)
  }

  async function handlePublish() {
    if (!question.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim() || !opt4.trim()) {
      alert('Please fill in the question and all 4 options.')
      return
    }
    setPosting(true)

    const { error } = await supabase.from('polls').insert({
      sector_id: activeSector,
      user_id: anonId,
      user_name: anonId,
      question,
      option_1: opt1,
      option_2: opt2,
      option_3: opt3,
      option_4: opt4,
    })

    if (!error) {
      setQuestion('')
      setOpt1(''); setOpt2(''); setOpt3(''); setOpt4('')
      setShowForm(false)
      loadPolls(activeSector)
    } else {
      alert('Error publishing: ' + error.message)
    }
    setPosting(false)
  }

  async function handleDelete(pollId: string) {
    const ok = confirm('Delete this question?')
    if (!ok) return

    const { error } = await supabase.from('poll_votes').delete().eq('poll_id', pollId)
    const { error: error2 } = await supabase.from('polls').delete().eq('id', pollId)

    if (error2) {
      alert(error2.message)
      return
    }

    loadPolls(activeSector)
  }

  const activeSectorName = sectors.find((s) => s.id === activeSector)?.name || ''

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-[#2b2d31] border-b border-black/30">
        <Link href="/">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-indigo-400">CEE</span>
              <span className="text-gray-300">prep</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse mt-1"></span>
          </div>
        </Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm">← Back to Home</Link>
      </header>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto">
        <aside className="w-full md:w-48 shrink-0 p-4 border-b md:border-b-0 md:border-r border-black/30 md:min-h-[80vh]">
          <p className="text-xs text-gray-500 uppercase font-bold mb-3">Sectors</p>
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-1">
            {sectors.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveSector(s.id); setShowForm(false) }}
                className={`shrink-0 text-left px-3 py-2 rounded-full md:rounded text-sm font-medium whitespace-nowrap ${
                  activeSector === s.id ? 'bg-indigo-600 text-white' : 'text-gray-300 bg-[#2b2d31] md:bg-transparent hover:bg-[#35373c] md:hover:bg-[#2b2d31]'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-bold">{activeSectorName}</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1 w-full sm:w-auto"
            >
              <span className="text-lg leading-none">+</span> New Question
            </button>
          </div>

          {showForm && (
            <div className="bg-[#2b2d31] rounded-xl p-5 mb-6 space-y-3">
              <textarea
                placeholder="Type your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                className="w-full bg-[#1e1f22] rounded px-3 py-2 outline-none resize-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input placeholder="Option 1" value={opt1} onChange={(e) => setOpt1(e.target.value)} className="bg-[#1e1f22] rounded px-3 py-2 outline-none" />
                <input placeholder="Option 2" value={opt2} onChange={(e) => setOpt2(e.target.value)} className="bg-[#1e1f22] rounded px-3 py-2 outline-none" />
                <input placeholder="Option 3" value={opt3} onChange={(e) => setOpt3(e.target.value)} className="bg-[#1e1f22] rounded px-3 py-2 outline-none" />
                <input placeholder="Option 4" value={opt4} onChange={(e) => setOpt4(e.target.value)} className="bg-[#1e1f22] rounded px-3 py-2 outline-none" />
              </div>
              <button onClick={handlePublish} disabled={posting} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold text-sm disabled:opacity-50">
                {posting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          )}

          <div className="space-y-4">
            {polls.length === 0 && (
              <p className="text-gray-500 text-sm">No questions yet in {activeSectorName}. Be the first to post one!</p>
            )}

            {polls.map((poll) => {
              const vd = voteData[poll.id]
              const hasVoted = vd?.myVote != null
              const options = [poll.option_1, poll.option_2, poll.option_3, poll.option_4]

              return (
                <div key={poll.id} className="bg-[#2b2d31] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{poll.user_name}</p>
                      <p className="font-semibold">{poll.question}</p>
                    </div>

                    {poll.user_id === anonId && (
                      <button onClick={() => handleDelete(poll.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-semibold">
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {options.map((opt, idx) => {
                      const choiceNum = idx + 1
                      const count = vd?.counts?.[choiceNum] || 0
                      const total = vd?.total || 0
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      const isMyVote = vd?.myVote === choiceNum

                      return (
                        <button
                          key={idx}
                          onClick={() => handleVote(poll.id, choiceNum)}
                          disabled={hasVoted}
                          className={`w-full text-left relative overflow-hidden rounded-lg border ${
                            isMyVote ? 'border-indigo-500' : 'border-black/30'
                          } ${hasVoted ? 'cursor-default' : 'hover:bg-[#35373c] cursor-pointer'}`}
                        >
                          {hasVoted && (
                            <div className="absolute inset-y-0 left-0 bg-indigo-600/30" style={{ width: `${pct}%` }}></div>
                          )}
                          <div className="relative flex items-center justify-between px-3 py-2 text-sm">
                            <span>{opt}</span>
                            {hasVoted && <span className="text-gray-300 font-mono">{pct}%</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {hasVoted && (
                    <p className="text-xs text-gray-500 mt-2">{vd.total} vote{vd.total !== 1 ? 's' : ''}</p>
                  )}
                </div>
              )
            })}
          </div>

        </main>
      </div>
    </div>
  )
}