'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '../lib/supabase'
import Link from 'next/link'
import { getAnonId } from '../lib/anonId'

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function toDateStr(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TimerPage() {
  const supabase = createClient()
  const [anonId, setAnonId] = useState<string>('')

  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [targetSeconds, setTargetSeconds] = useState(0)
  const [hoursInput, setHoursInput] = useState(2)
  const [minutesInput, setMinutesInput] = useState(0)
  const [note, setNote] = useState('')
  const [fontSize, setFontSize] = useState(72)

  const intervalRef = useRef<any>(null)
  const alarmIntervalRef = useRef<any>(null)
  const alarmTimeoutRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [alarmRinging, setAlarmRinging] = useState(false)

  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [logs, setLogs] = useState<Record<string, number>>({})
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()))

  useEffect(() => {
    const id = getAnonId()
    setAnonId(id)
    const savedNote = localStorage.getItem('ceeprep_note')
    if (savedNote) setNote(savedNote)
    loadLogs(id)
  }, [])

  async function loadLogs(id: string) {
    const { data } = await supabase.from('study_logs').select('date, seconds_studied').eq('user_id', id)
    if (data) {
      const map: Record<string, number> = {}
      data.forEach((row: any) => (map[row.date] = row.seconds_studied))
      setLogs(map)
    }
  }

  function saveNote(text: string) {
    setNote(text)
    localStorage.setItem('ceeprep_note', text)
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsed((prev) => prev + 1)
        } else {
          setRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current)
              setRunning(false)
              handleFinishSession(targetSeconds)
              startAlarm()
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode, targetSeconds])

  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current)
    }
  }, [])

  async function handleFinishSession(secondsToSave: number) {
    if (!anonId || secondsToSave <= 0) return
    const today = toDateStr(new Date())
    const existing = logs[today] || 0
    const newTotal = existing + secondsToSave

    await supabase.from('study_logs').upsert(
      { user_id: anonId, date: today, seconds_studied: newTotal },
      { onConflict: 'user_id,date' }
    )
    setLogs((prev) => ({ ...prev, [today]: newTotal }))
  }

  function playBeep() {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.4)
  }

  function startAlarm() {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current)
    setAlarmRinging(true)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    playBeep()
    alarmIntervalRef.current = setInterval(() => {
      playBeep()
    }, 600)
    alarmTimeoutRef.current = setTimeout(() => {
      stopAlarm()
    }, 60000)
  }

  function stopAlarm() {
    setAlarmRinging(false)
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current)
    alarmIntervalRef.current = null
    alarmTimeoutRef.current = null
    if (audioContextRef.current) {
      audioContextRef.current.suspend()
    }
  }

  function handleStart() {
    if (mode === 'countdown' && remaining === 0 && elapsed === 0) {
      const total = hoursInput * 3600 + minutesInput * 60
      setTargetSeconds(total)
      setRemaining(total)
    }
    setRunning(true)
  }

  function handlePause() {
    setRunning(false)
  }

  function handleStop() {
    setRunning(false)
    if (mode === 'stopwatch') {
      handleFinishSession(elapsed)
      setElapsed(0)
    } else {
      const studied = targetSeconds - remaining
      handleFinishSession(studied)
      setRemaining(0)
      setTargetSeconds(0)
    }
  }

  function handleRestart() {
    setRunning(false)
    if (mode === 'stopwatch') {
      setElapsed(0)
    } else {
      setRemaining(0)
      setTargetSeconds(0)
    }
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' })

  function changeMonth(delta: number) {
    let newMonth = viewMonth + delta
    let newYear = viewYear
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setViewMonth(newMonth)
    setViewYear(newYear)
  }

  const selectedSeconds = logs[selectedDate] || 0

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-[#2b2d31] border-b border-black/30">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-indigo-400">CEE</span>
            <span className="text-gray-300">prep</span>
          </span>
        </Link>
        <Link href="/" className="text-gray-400 hover:text-white text-sm">← Back to Home</Link>
      </header>

      <main className="flex flex-col md:flex-row gap-8 p-6 max-w-6xl mx-auto items-start">
        <div className="bg-[#2b2d31] rounded-xl p-6 w-full md:w-72 shrink-0 self-start shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => changeMonth(-1)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#35373c] transition-colors">‹</button>
            <p className="font-semibold text-sm tracking-wide">{monthName} {viewYear}</p>
            <button onClick={() => changeMonth(1)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#35373c] transition-colors">›</button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-gray-500 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1.5 text-center text-sm">
            {Array.from({ length: firstDayWeekday }).map((_, i) => <div key={'empty'+i}></div>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = toDateStr(new Date(viewYear, viewMonth, day))
              const hasLog = logs[dateStr] > 0
              const isSelected = dateStr === selectedDate
              const isToday = dateStr === toDateStr(new Date())
              return (
                <div key={day} className="flex items-center justify-center">
                  <button
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-indigo-600 text-white font-semibold' : isToday ? 'ring-1 ring-indigo-400 text-white' : 'text-gray-300 hover:bg-[#35373c]'}`}
                  >
                    {day}
                    {hasLog && !isSelected && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-black/30 text-sm text-gray-300">
            <p className="text-gray-400">{selectedDate}</p>
            <p className="text-lg font-bold text-white mt-1">{formatHMS(selectedSeconds)}</p>
            <p className="text-xs text-gray-500">studied this day</p>
          </div>
          <div className="mt-6 border border-dashed border-gray-600 rounded-lg p-4 text-center text-xs text-gray-500">
            Ad space (300×250)
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="flex gap-2 mb-6 bg-[#2b2d31] p-1 rounded-lg">
            <button onClick={() => { setMode('stopwatch'); handleRestart() }} className={`px-4 py-2 rounded-md text-sm font-semibold ${mode === 'stopwatch' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Stopwatch</button>
            <button onClick={() => { setMode('countdown'); handleRestart() }} className={`px-4 py-2 rounded-md text-sm font-semibold ${mode === 'countdown' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Set Timer</button>
          </div>

          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            placeholder="Write something to motivate yourself..."
            rows={2}
            className="w-full max-w-md mb-8 bg-transparent text-center text-gray-200 outline-none resize-none placeholder-gray-500"
          />

          {mode === 'countdown' && remaining === 0 && !running && (
            <div className="flex gap-3 items-center mb-6">
              <div className="flex flex-col items-center">
                <input type="number" min={0} value={hoursInput} onChange={(e) => setHoursInput(Number(e.target.value))} className="w-16 text-center bg-[#2b2d31] rounded py-1 outline-none" />
                <span className="text-xs text-gray-400 mt-1">hours</span>
              </div>
              <div className="flex flex-col items-center">
                <input type="number" min={0} max={59} value={minutesInput} onChange={(e) => setMinutesInput(Number(e.target.value))} className="w-16 text-center bg-[#2b2d31] rounded py-1 outline-none" />
                <span className="text-xs text-gray-400 mt-1">minutes</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setFontSize((s) => Math.max(36, s - 8))} className="w-8 h-8 rounded bg-[#2b2d31] hover:bg-[#35373c] text-lg">−</button>
            <span className="text-xs text-gray-500">Clock size</span>
            <button onClick={() => setFontSize((s) => Math.min(140, s + 8))} className="w-8 h-8 rounded bg-[#2b2d31] hover:bg-[#35373c] text-lg">+</button>
          </div>

          <div className="font-mono font-bold mb-10 tracking-wider text-center" style={{ fontSize: `${fontSize}px` }}>
            {mode === 'stopwatch' ? formatHMS(elapsed) : formatHMS(remaining)}
          </div>

          <div className="flex gap-4">
            {!running ? (
              <button onClick={handleStart} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold">Start</button>
            ) : (
              <button onClick={handlePause} className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold">Pause</button>
            )}
            <button onClick={handleStop} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold">Stop & Save</button>
            <button onClick={handleRestart} className="bg-[#2b2d31] hover:bg-[#35373c] px-6 py-3 rounded-lg font-semibold">Restart</button>
          </div>
        </div>
      </main>

      {alarmRinging && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2b2d31] rounded-2xl p-8 text-center max-w-sm w-full mx-4">
            <div className="text-5xl mb-4 animate-bounce">⏰</div>
            <h3 className="text-white text-xl font-bold mb-2">Time's up!</h3>
            <p className="text-gray-400 text-sm mb-6">Great work — you completed your session 🎉</p>
            <button onClick={stopAlarm} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold w-full">Stop Alarm</button>
          </div>
        </div>
      )}
    </div>
  )
}