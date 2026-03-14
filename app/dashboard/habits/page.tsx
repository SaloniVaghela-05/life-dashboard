'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Habit {
  id: string
  name: string
  description: string
  frequency: string
  target_count: number
  streak: number
  completedToday?: boolean
}

const HABIT_EMOJIS = ['🧘', '📚', '💧', '🏃', '🌱', '✍️', '🎵', '🛏️', '🥗', '☀️']

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', target_count: 1 })
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const fetchHabits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: habitsData }, { data: logs }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
      supabase.from('habit_logs').select('habit_id').eq('user_id', user.id).eq('completed_date', today),
    ])
    const completedIds = new Set((logs || []).map((l: any) => l.habit_id))
    setHabits((habitsData || []).map((h: any) => ({ ...h, completedToday: completedIds.has(h.id) })))
    setLoading(false)
  }, [supabase, today])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const toggleHabit = async (habit: Habit) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setToggling(prev => new Set([...prev, habit.id]))
    if (habit.completedToday) {
      await supabase.from('habit_logs').delete()
        .eq('habit_id', habit.id).eq('user_id', user.id).eq('completed_date', today)
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habit.id, user_id: user.id, completed_date: today })
      toast.success('Habit tended 🌱')
    }
    setTimeout(() => {
      setToggling(prev => { const n = new Set(prev); n.delete(habit.id); return n })
      fetchHabits()
    }, 400)
  }

  const addHabit = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('habits').insert({ ...form, user_id: user!.id, is_active: true, streak: 0 })
    toast.success('New habit planted 🌿')
    setShowAdd(false)
    setForm({ name: '', description: '', frequency: 'daily', target_count: 1 })
    fetchHabits()
  }

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').update({ is_active: false }).eq('id', id)
    toast.success('Habit removed')
    fetchHabits()
  }

  const doneTodayCount = habits.filter(h => h.completedToday).length
  const totalCount = habits.length
  const pct = totalCount > 0 ? Math.round((doneTodayCount / totalCount) * 100) : 0
  // SVG ring for summary circle: r=20, circumference ≈ 125.6
  const RING_C = 125.6
  const summaryOffset = RING_C - (pct / 100) * RING_C

  return (
    <div className="space-y-7 pb-8">

      {/* ── Header & Daily Summary ── */}
      <header className="animate-in stagger-1">
        <h1 className="text-3xl font-light tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Life Dashboard
        </h1>
        <p className="text-sm italic mt-0.5" style={{ color: 'var(--text-muted)' }}>
          &quot;One step at a time.&quot;
        </p>

        {/* Summary card */}
        <div
          className="mt-5 p-4 flex justify-between items-center"
          style={{
            background: 'rgba(255,255,255,0.40)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.25rem',
            border: '1px solid rgba(255,255,255,0.50)',
          }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--accent)' }}>
              Today&apos;s Focus
            </p>
            <p className="text-lg font-medium mt-0.5" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {doneTodayCount} of {totalCount} Completed
            </p>
          </div>

          {/* Circular progress */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="24" cy="24" r="20" fill="transparent"
                stroke="var(--border)" strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="transparent"
                stroke="var(--accent)" strokeWidth="4"
                strokeDasharray={RING_C}
                strokeDashoffset={summaryOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)' }}
              />
            </svg>
            <span className="absolute text-[9px] font-bold" style={{ color: 'var(--accent)' }}>{pct}%</span>
          </div>
        </div>
      </header>

      {/* ── Habit List ── */}
      <section className="space-y-3 animate-in stagger-2">
        {loading && (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your habits…</p>
          </div>
        )}

        {!loading && habits.length === 0 && (
          <div className="glass-card p-10 text-center">
            <p className="text-3xl mb-3">🌱</p>
            <p className="font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
              No habits planted yet
            </p>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
              Start small — even one habit changes everything
            </p>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Plant First Habit
            </button>
          </div>
        )}

        {habits.map((habit, i) => {
          const emoji = HABIT_EMOJIS[i % HABIT_EMOJIS.length]
          const done = habit.completedToday
          const isToggling = toggling.has(habit.id)
          // per-habit ring: r=16, c≈100.5
          const HABIT_C = 100.5
          const habitOffset = done ? 0 : HABIT_C

          return (
            <div
              key={habit.id}
              className="group flex items-center justify-between p-4 cursor-pointer transition-all duration-200"
              style={{
                background: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(6px)',
                borderRadius: '1.25rem',
                border: done ? '1px solid var(--accent-warm)' : '1px solid rgba(255,255,255,0.90)',
                boxShadow: 'var(--shadow-warm)',
              }}
              onClick={() => !isToggling && toggleHabit(habit)}
            >
              <div className="flex items-center gap-4">
                {/* Circular ring with emoji */}
                <div
                  className="relative shrink-0"
                  style={{ width: 44, height: 44 }}
                >
                  <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="22" cy="22" r="16" fill="transparent"
                      stroke="var(--border)" strokeWidth="3" />
                    <circle cx="22" cy="22" r="16" fill="transparent"
                      stroke="var(--accent)" strokeWidth="3"
                      strokeDasharray={HABIT_C}
                      strokeDashoffset={isToggling ? HABIT_C / 2 : habitOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.22,1,0.36,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {done
                      ? <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--accent-light)', animation: isToggling ? 'popSuccess 0.4s cubic-bezier(0.175,0.885,0.32,1.275)' : 'none' }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="var(--accent)" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                          </svg>
                        </div>
                      : <span className="text-sm">{emoji}</span>
                    }
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                    {habit.name}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {habit.description || habit.frequency} {habit.streak > 0 && `• 🔥 ${habit.streak} day streak`}
                  </p>
                </div>
              </div>

              {/* Done indicator / trash */}
              <div className="flex items-center gap-2">
                {done && (
                  <svg className="w-5 h-5" fill="none" stroke="var(--accent)" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id) }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-all"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Add Habit Form ── */}
      {showAdd && (
        <div className="glass-card p-5 animate-in">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Plant a New Habit
          </h3>
          <div className="space-y-3">
            <input className="input" placeholder="Habit name *" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            <input className="input" placeholder="Description (optional)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <select className="input" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="flex gap-2">
              <button onClick={addHabit} className="btn btn-primary">Plant Habit 🌱</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      {!showAdd && (
        <div className="flex justify-center pt-2 animate-in stagger-4">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-8 py-4 font-semibold rounded-2xl text-white transition-all"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 6px 24px rgba(198,123,92,0.35)',
              transform: 'translateY(0)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 10px 30px rgba(198,123,92,0.40)' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 6px 24px rgba(198,123,92,0.35)' }}
          >
            <Plus className="w-5 h-5" />
            Add New Habit
          </button>
        </div>
      )}
    </div>
  )
}
