'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '../lib/supabase'
import Link from 'next/link'

const ADMIN_PASSWORD = 'krisal1q' // change this to whatever you want

type Tab = 'home' | 'news' | 'discussion'

interface NewsPost {
  id: string
  user_name: string
  content: string
  image_url: string | null
  status: string
  created_at: string
}

interface Poll {
  id: string
  question: string
  user_name: string
  created_at: string
}

export default function AdminPage() {
  const supabase = createClient()

  const [checked, setChecked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [tab, setTab] = useState<Tab>('home')

  const [news, setNews] = useState<NewsPost[]>([])
  const [polls, setPolls] = useState<Poll[]>([])

  useEffect(() => {
    const unlocked = sessionStorage.getItem('ceeprep_admin_unlocked')
    if (unlocked === 'true') {
      setChecked(true)
      loadNews()
      loadPolls()
    }
  }, [])

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('ceeprep_admin_unlocked', 'true')
      setChecked(true)
      loadNews()
      loadPolls()
    } else {
      setPasswordError('Incorrect password.')
    }
  }

  /* ---------------- NEWS ---------------- */

  async function loadNews() {
    const { data } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setNews(data)
  }

  async function updateNewsStatus(id: string, status: 'approved' | 'rejected') {
    await supabase
      .from('news_posts')
      .update({ status })
      .eq('id', id)

    loadNews()
  }

  async function deleteNews(id: string) {
    if (!confirm('Delete this news?')) return

    await supabase
      .from('news_posts')
      .delete()
      .eq('id', id)

    loadNews()
  }

  /* ---------------- DISCUSSION ---------------- */

  async function loadPolls() {
    const { data } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setPolls(data)
  }

  async function deletePoll(id: string) {
    if (!confirm('Delete this question?')) return

    await supabase.from('poll_votes').delete().eq('poll_id', id)
    await supabase.from('polls').delete().eq('id', id)

    loadPolls()
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1f22] px-4">
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-[#2b2d31] rounded-xl p-8 w-full max-w-sm"
        >
          <h1 className="text-white text-xl font-bold mb-4 text-center">Admins Access</h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            className="w-full px-3 py-2 rounded bg-[#1e1f22] text-white outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
          />
          {passwordError && (
            <p className="text-red-400 text-sm mb-3">{passwordError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
          >
            Unlock
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#2b2d31] border-b border-black/30">
        <h1 className="text-lg font-bold">CEEprep Admin</h1>

        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          Back to site
        </Link>
      </div>

      {/* NAV */}
      <div className="flex gap-3 p-4 border-b border-black/30 bg-[#2b2d31]/50">
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'text-indigo-400' : ''}>
          Dashboard
        </button>
        <button onClick={() => setTab('news')} className={tab === 'news' ? 'text-indigo-400' : ''}>
          News
        </button>
        <button onClick={() => setTab('discussion')} className={tab === 'discussion' ? 'text-indigo-400' : ''}>
          Discussion
        </button>
      </div>

      {/* DASHBOARD */}
      {tab === 'home' && (
        <div className="p-6 text-gray-300">
          <h2 className="text-xl font-bold mb-2">Welcome Admin</h2>
          <p>Select a section above to manage content.</p>
        </div>
      )}

      {/* NEWS */}
      {tab === 'news' && (
        <div className="p-6 space-y-4">
          <h2 className="font-bold text-lg">News Management</h2>

          {news.map((n) => (
            <div key={n.id} className="bg-[#2b2d31] p-4 rounded-xl">
              <p className="text-sm text-gray-400">{n.user_name}</p>
              <p className="mb-2">{n.content}</p>

              {n.image_url && (
                <Image src={n.image_url} alt="" width={400} height={300} className="rounded mb-2 max-h-60" />
              )}

              <p className="text-xs text-gray-500 mb-2">Status: {n.status}</p>

              <div className="flex gap-2">
                <button onClick={() => updateNewsStatus(n.id, 'approved')} className="bg-green-600 px-3 py-1 rounded">
                  Approve
                </button>

                <button onClick={() => updateNewsStatus(n.id, 'rejected')} className="bg-yellow-600 px-3 py-1 rounded">
                  Reject
                </button>

                <button onClick={() => deleteNews(n.id)} className="bg-red-600 px-3 py-1 rounded ml-auto">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISCUSSION */}
      {tab === 'discussion' && (
        <div className="p-6 space-y-4">
          <h2 className="font-bold text-lg">Discussion Management</h2>

          {polls.map((p) => (
            <div key={p.id} className="bg-[#2b2d31] p-4 rounded-xl">
              <p className="text-sm text-gray-400">{p.user_name}</p>
              <p className="mb-2 font-semibold">{p.question}</p>

              <button
                onClick={() => deletePoll(p.id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Delete Poll
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}