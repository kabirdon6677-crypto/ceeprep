'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import Link from 'next/link'
import { getAnonId } from '../lib/anonId'

interface NewsPost {
  id: string
  user_id: string
  user_name: string
  content: string
  image_url: string | null
  created_at: string
}

interface LikeCounts {
  likes: number
  dislikes: number
  userVote: 'like' | 'dislike' | null
}

export default function NewsPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [anonId, setAnonId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [likeCounts, setLikeCounts] = useState<Record<string, LikeCounts>>({})

  useEffect(() => {
    const id = getAnonId()
    setAnonId(id)
    loadPosts()
  }, [])

  async function loadPosts() {
    const { data } = await supabase
      .from('news_posts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (data) {
      setPosts(data)
      loadLikes(data.map((p) => p.id))
    }
  }

  async function loadLikes(postIds: string[]) {
    if (postIds.length === 0) return
    const currentId = getAnonId()

    const { data } = await supabase
      .from('news_likes')
      .select('*')
      .in('post_id', postIds)

    const counts: Record<string, LikeCounts> = {}
    postIds.forEach((id) => {
      counts[id] = { likes: 0, dislikes: 0, userVote: null }
    })
    if (data) {
      data.forEach((row) => {
        if (row.value === 'like') counts[row.post_id].likes++
        if (row.value === 'dislike') counts[row.post_id].dislikes++
        if (row.user_id === currentId) {
          counts[row.post_id].userVote = row.value
        }
      })
    }
    setLikeCounts(counts)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!content.trim() && !imageFile) return
    setSubmitting(true)

    let imageUrl: string | null = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${anonId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        setSubmitting(false)
        setMessage('Image upload failed. Please try again.')
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName)
      imageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('news_posts').insert({
      user_id: anonId,
      user_name: anonId,
      content: content.trim(),
      image_url: imageUrl,
    })

    setSubmitting(false)
    if (error) {
      setMessage('Something went wrong. Please try again.')
    } else {
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      setMessage('Submitted! Your post will appear once approved by an admin.')
    }
  }

  async function handleVote(postId: string, value: 'like' | 'dislike') {
    const current = likeCounts[postId]?.userVote

    if (current === value) {
      await supabase.from('news_likes').delete().eq('post_id', postId).eq('user_id', anonId)
    } else if (current) {
      await supabase
        .from('news_likes')
        .update({ value })
        .eq('post_id', postId)
        .eq('user_id', anonId)
    } else {
      await supabase.from('news_likes').insert({ post_id: postId, user_id: anonId, value })
    }
    loadLikes(posts.map((p) => p.id))
  }

  async function handleDelete(id: string) {
    const ok = confirm('Delete this post permanently?')
    if (!ok) return

    const { error } = await supabase.from('news_posts').delete().eq('id', id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }
    loadPosts()
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

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

      <main className="max-w-xl mx-auto p-6">
        <p className="text-xs text-gray-500 mb-3">Posting as <span className="text-indigo-400 font-semibold">{anonId}</span></p>

        <div className="bg-[#2b2d31] rounded-xl p-4 mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with everyone..."
            className="w-full bg-[#1e1f22] text-white rounded-lg p-3 text-sm resize-none outline-none"
            rows={3}
          />

          {imagePreview && (
            <div className="mt-2 relative">
              <img src={imagePreview} alt="Preview" className="rounded-lg max-h-60 w-auto" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <label className="text-gray-400 hover:text-white text-sm cursor-pointer">
              📷 Add image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <button
              onClick={handleSubmit}
              disabled={submitting || (!content.trim() && !imageFile)}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-1.5 rounded text-sm font-semibold"
            >
              {submitting ? 'Submitting...' : 'Post'}
            </button>
          </div>
          {message && <p className="text-xs text-gray-500 mt-2">{message}</p>}
        </div>

        <div className="space-y-3">
          {posts.length === 0 && (
            <p className="text-gray-500 text-sm text-center">No posts yet.</p>
          )}
          {posts.map((post) => {
            const counts = likeCounts[post.id] || { likes: 0, dislikes: 0, userVote: null }
            return (
              <div key={post.id} className="bg-[#2b2d31] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{post.user_name}</p>
                  <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
                </div>
                <p className="text-gray-200 text-sm mb-2">{post.content}</p>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="rounded-lg max-h-80 w-auto mb-2" />
                )}
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => handleVote(post.id, 'like')}
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${
                      counts.userVote === 'like' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    👍 {counts.likes}
                  </button>
                  <button
                    onClick={() => handleVote(post.id, 'dislike')}
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${
                      counts.userVote === 'dislike' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    👎 {counts.dislikes}
                  </button>
                  {post.user_id === anonId && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}