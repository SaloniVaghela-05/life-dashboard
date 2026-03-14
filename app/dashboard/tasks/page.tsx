'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Calendar, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed' | 'overdue'
  due_date: string
  is_recurring: boolean
  recurrence_pattern?: string
}

const PRIORITIES = ['low', 'medium', 'high'] as const

// Warm organic shapes — each stone card gets a slightly different border-radius
const STONE_SHAPES = ['2rem', '2.4rem', '1.8rem', '2.2rem', '2.6rem']
const STONE_GLOWS = [
  { bg: 'rgba(244,162,97,0.15)', inner: 'rgba(244,162,97,0.25)', glow: 'rgba(244,162,97,0.30)' },
  { bg: 'rgba(215,198,173,0.20)', inner: 'rgba(215,198,173,0.35)', glow: 'rgba(198,155,110,0.25)' },
  { bg: 'rgba(198,123,92,0.12)', inner: 'rgba(198,123,92,0.22)', glow: 'rgba(198,123,92,0.20)' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clearingIds, setClearingIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as const, due_date: '', is_recurring: false, recurrence_pattern: '' })
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('tasks').select('*').eq('user_id', user!.id)
      .order('due_date', { ascending: true, nullsFirst: false })
    if (!error) setTasks(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('tasks').insert({
      ...form, user_id: user!.id, status: 'pending',
      due_date: form.due_date || null,
      recurrence_pattern: form.is_recurring ? form.recurrence_pattern : null,
    })
    if (error) { toast.error('Failed to add task'); return }
    toast.success('Task added 🌱')
    setShowAdd(false)
    setForm({ title: '', description: '', priority: 'medium', due_date: '', is_recurring: false, recurrence_pattern: '' })
    fetchTasks()
  }

  const clearStone = async (task: Task) => {
    if (task.status === 'completed') {
      // un-complete
      await supabase.from('tasks').update({ status: 'pending', completed_at: null }).eq('id', task.id)
      fetchTasks()
      return
    }
    // Animate out then mark complete
    setClearingIds(prev => new Set([...prev, task.id]))
    setTimeout(async () => {
      await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', task.id)
      toast.success('Stone cleared ✨')
      setClearingIds(prev => { const n = new Set(prev); n.delete(task.id); return n })
      fetchTasks()
    }, 450)
  }

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    toast.success('Task removed')
    fetchTasks()
  }

  const pending = tasks.filter(t => t.status === 'pending')
  const completed = tasks.filter(t => t.status === 'completed')
  const filtered = filter === 'all' ? tasks : filter === 'pending' ? pending : completed

  return (
    <div
      className="min-h-full sand-pattern -mx-8 -mt-8 px-8 pt-8"
      style={{ paddingBottom: '4rem' }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 -mx-8 px-8 py-4 flex justify-between items-center mb-6 animate-in stagger-1"
        style={{ background: 'rgba(250,247,242,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-light)' }}>
        <div>
          <h1 className="text-xl font-light tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Daily Garden
          </h1>
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tasks &amp; Goals</p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length === 0 && !loading && (
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              Garden at peace ✨
            </span>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 2px 10px rgba(198,123,92,0.35)' }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 mb-6 animate-in stagger-2">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={filter === f
              ? { background: 'var(--accent)', color: 'white', boxShadow: '0 2px 8px rgba(198,123,92,0.3)' }
              : { background: 'rgba(255,255,255,0.60)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
            }
          >
            {f === 'all' ? 'All' : f === 'pending' ? `Today's Path (${pending.length})` : `Cleared (${completed.length})`}
          </button>
        ))}
      </div>

      {/* ── Add Form ── */}
      {showAdd && (
        <div className="stone-card p-6 mb-6 animate-in" style={{ borderRadius: '1.75rem' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            New Stone
          </h3>
          <div className="space-y-3">
            <input className="input" placeholder="What needs to be done? *" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
            <textarea className="input resize-none" placeholder="Description (optional)" rows={2}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
              </select>
              <input className="input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addTask} className="btn btn-primary">Place Stone</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Today's Path: Pending Stones ── */}
      {(filter === 'all' || filter === 'pending') && !loading && (
        <section className="mb-10 animate-in stagger-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Today&apos;s Path
            </h2>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              {pending.length} stone{pending.length !== 1 ? 's' : ''} remaining
            </span>
          </div>

          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="stone-card p-10 text-center" style={{ borderRadius: '2rem' }}>
                <p className="text-2xl mb-2">🌸</p>
                <p className="font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  Garden at peace
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>All stones cleared for today</p>
              </div>
            ) : pending.map((task, i) => {
              const shape = STONE_SHAPES[i % STONE_SHAPES.length]
              const glow = STONE_GLOWS[i % STONE_GLOWS.length]
              const isClearing = clearingIds.has(task.id)
              return (
                <article
                  key={task.id}
                  className="group"
                  style={{ transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)', opacity: isClearing ? 0 : 1, transform: isClearing ? 'scale(0.88) translateY(8px)' : 'scale(1)' }}
                >
                  <button
                    onClick={() => clearStone(task)}
                    className="w-full text-left flex items-center gap-4 p-6"
                    style={{ background: 'rgba(255,255,255,0.72)', borderRadius: shape, border: '1px solid rgba(226,216,200,0.7)', boxShadow: 'var(--shadow-stone)', backdropFilter: 'blur(4px)', transition: 'transform 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                  >
                    {/* Stone icon orb */}
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center"
                      style={{ background: glow.bg, boxShadow: `0 0 14px 3px ${glow.glow}`, position: 'relative' }}
                    >
                      <div className="w-8 h-8 rounded-full" style={{ background: glow.inner, filter: 'blur(3px)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      {task.description && (
                        <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="badge"
                          style={task.priority === 'high'
                            ? { background: '#fae8e4', color: '#b05040' }
                            : task.priority === 'medium'
                              ? { background: '#faeedd', color: '#a07030' }
                              : { background: '#e8f0e0', color: '#3a7040' }}
                        >
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Check arrow */}
                    <div className="shrink-0 transition-colors" style={{ color: 'var(--zen-river)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--zen-river)'}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
                    className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-all"
                    style={{ color: 'var(--danger)', background: '#fae8e4', position: 'relative', float: 'right', marginTop: '-2.5rem', marginRight: '0.5rem' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Beyond the Horizon: Upcoming / Completed ── */}
      {(filter === 'all' || filter === 'completed') && !loading && completed.length > 0 && (
        <section className="animate-in stagger-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Cleared Stones
            </h2>
          </div>
          <div className="space-y-3">
            {completed.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 group"
                style={{ borderRadius: '1.25rem', background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.70)', backdropFilter: 'blur(4px)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--zen-river)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => clearStone(task)}
                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--accent)' }}
                >
                  Restore
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your garden…</p>
        </div>
      )}
    </div>
  )
}
