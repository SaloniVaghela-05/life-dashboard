'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Target, CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Fitness', 'Relationships', 'Other']

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showAddMilestone, setShowAddMilestone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', category: 'Personal', target_date: '', progress: 0 })
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '' })
  const supabase = createClient()

  const fetchGoals = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('goals')
      .select('*, goal_milestones(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const addGoal = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('goals').insert({ ...form, user_id: user!.id, status: 'active' })
    if (error) { toast.error('Failed'); return }
    toast.success('Goal added!')
    setShowAdd(false)
    setForm({ title: '', description: '', category: 'Personal', target_date: '', progress: 0 })
    fetchGoals()
  }

  const addMilestone = async (goalId: string) => {
    if (!milestoneForm.title.trim()) { toast.error('Title required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('goal_milestones').insert({ ...milestoneForm, goal_id: goalId, user_id: user!.id, is_completed: false, order_index: 0 })
    if (error) { toast.error('Failed'); return }
    toast.success('Milestone added!')
    setShowAddMilestone(null)
    setMilestoneForm({ title: '', description: '' })
    fetchGoals()
  }

  const toggleMilestone = async (milestoneId: string, current: boolean) => {
    await supabase.from('goal_milestones').update({ is_completed: !current, completed_date: !current ? new Date().toISOString().split('T')[0] : null }).eq('id', milestoneId)
    fetchGoals()
  }

  const updateProgress = async (goalId: string, progress: number) => {
    await supabase.from('goals').update({ progress }).eq('id', goalId)
    fetchGoals()
  }

  const updateStatus = async (goalId: string, status: string) => {
    await supabase.from('goals').update({ status }).eq('id', goalId)
    fetchGoals()
    toast.success(`Goal marked as ${status}`)
  }

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id)
    toast.success('Goal deleted')
    fetchGoals()
  }

  const STATUS_STYLE: Record<string, any> = {
    active: { background: '#eef1ff', color: '#4f6ef7' },
    completed: { background: '#d1fae5', color: '#10b981' },
    paused: { background: '#f1f5f9', color: '#64748b' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in stagger-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Goals</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {goals.filter(g => g.status === 'active').length} active · {goals.filter(g => g.status === 'completed').length} completed
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {showAdd && (
        <div className="card animate-in">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Goal</h3>
          <div className="space-y-3">
            <input className="input" placeholder="Goal title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
            <textarea className="input resize-none" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input className="input" type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} placeholder="Target date" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Starting progress: {form.progress}%</label>
              <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addGoal} className="btn btn-primary">Save Goal</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 animate-in stagger-2">
        {loading ? (
          <div className="card text-center py-12"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading goals...</p></div>
        ) : goals.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-2">🎯</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No goals yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Set your first goal to get started</p>
          </div>
        ) : goals.map((goal) => {
          const milestones = goal.goal_milestones || []
          const completedMilestones = milestones.filter((m: any) => m.is_completed).length
          const isExpanded = expandedGoal === goal.id
          return (
            <div key={goal.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.title}</h3>
                    <span className="badge" style={STATUS_STYLE[goal.status]}>{goal.status}</span>
                    {goal.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        {goal.category}
                      </span>
                    )}
                  </div>
                  {goal.description && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{goal.description}</p>}
                  {goal.target_date && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      🗓 Due {new Date(goal.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => deleteGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: 'var(--text-muted)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{goal.progress}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={goal.progress}
                  onChange={e => updateProgress(goal.id, parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              {/* Milestones */}
              {isExpanded && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Milestones ({completedMilestones}/{milestones.length})
                    </span>
                    <div className="flex gap-2">
                      {goal.status !== 'completed' && (
                        <button onClick={() => updateStatus(goal.id, 'completed')} className="btn btn-ghost text-xs py-1" style={{ color: '#10b981', borderColor: '#bbf7d0' }}>
                          Mark complete
                        </button>
                      )}
                      <button onClick={() => setShowAddMilestone(goal.id)} className="btn btn-ghost text-xs py-1">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>

                  {showAddMilestone === goal.id && (
                    <div className="mb-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                      <input className="input mb-2" placeholder="Milestone title *" value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })} autoFocus />
                      <input className="input mb-2" placeholder="Description" value={milestoneForm.description} onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })} />
                      <div className="flex gap-2">
                        <button onClick={() => addMilestone(goal.id)} className="btn btn-primary text-xs py-1">Save</button>
                        <button onClick={() => setShowAddMilestone(null)} className="btn btn-ghost text-xs py-1">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {milestones.length === 0 ? (
                      <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No milestones yet. Break your goal into steps!</p>
                    ) : milestones.map((m: any) => (
                      <div key={m.id} className="flex items-center gap-2.5">
                        <button onClick={() => toggleMilestone(m.id, m.is_completed)} className="shrink-0">
                          {m.is_completed
                            ? <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />
                            : <Circle className="w-4 h-4" style={{ color: 'var(--border)' }} />
                          }
                        </button>
                        <span className="text-sm" style={{ color: m.is_completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: m.is_completed ? 'line-through' : 'none' }}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
