'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingScreen from './components/LoadingScreen'
import { getAnonId } from './lib/anonId'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [studentName, setStudentName] = useState('')

  useEffect(() => {
    const id = getAnonId()
    setStudentName(id.replace('Anonymous.', 'Student '))

    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[#1e1f22] relative overflow-hidden">
      {/* Ambient glow lights */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl animate-glow-slow"></div>
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-purple-600/20 rounded-full blur-3xl animate-glow-slower"></div>
        <div className="absolute top-1/3 -right-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-glow-slow"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 bg-[#2b2d31]/80 backdrop-blur-sm border-b border-black/30">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-indigo-400">CEE</span>
            <span className="text-gray-300">prep</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse mt-1"></span>
        </div>

        <div className="flex flex-wrap justify-center gap-5 text-sm">
          <Link
            href="/about"
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            About
          </Link>

          <Link
            href="/privacy"
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            Terms & Conditions
          </Link>

          <Link
            href="/contact"
            className="text-gray-400 hover:text-indigo-400 transition"
          >
            Contact
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-20">
        <h2 className="text-white text-3xl font-bold mb-2">
          Welcome, {studentName} 👋
        </h2>

        <p className="text-gray-400 mb-12">
          Ready to study today?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Link href="/timer">
            <div className="group bg-[#2b2d31] rounded-xl p-8 text-center cursor-pointer border border-black/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-600/20 hover:border-indigo-500/40">
              <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                ⏱️
              </div>
              <h3 className="text-white text-lg font-bold">Timer</h3>
              <p className="text-gray-400 text-sm mt-1">
                Study sessions & focus
              </p>
            </div>
          </Link>

          <Link href="/discussion">
            <div className="group bg-[#2b2d31] rounded-xl p-8 text-center cursor-pointer border border-black/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-600/20 hover:border-purple-500/40">
              <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                💬
              </div>
              <h3 className="text-white text-lg font-bold">Discussion</h3>
              <p className="text-gray-400 text-sm mt-1">
                Discuss CEE questions
              </p>
            </div>
          </Link>

          <Link href="/news">
            <div className="group bg-[#2b2d31] rounded-xl p-8 text-center cursor-pointer border border-black/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/20 hover:border-blue-500/40">
              <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                📰
              </div>
              <h3 className="text-white text-lg font-bold">News</h3>
              <p className="text-gray-400 text-sm mt-1">
                Updates & student posts
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}