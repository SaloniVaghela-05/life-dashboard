'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lightbulb, CheckCircle2, TrendingUp, DollarSign, Target, Activity, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ICON_MAP: Record<string, any> = {
  spending: DollarSign,
  habits: Activity,
  tasks: CheckCircle2,
  goals: Target,
  general: Lightbulb,
}

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  spending: { color: '#8b5cf6', bg: '#ede9fe' },
  habits: { color: '#ef4444', bg: '#fee2e2' },
  tasks: { color: '#10b981', bg: '#d1fae5' },
  goals: { color: '#4f6ef7', bg: '#eef1ff' },
  general: { color: '#f59e0b', bg: '#fef3c7' },
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  const fetchInsights = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setInsights(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchInsights() }, [fetchInsights])

  const markRead = async (id: string) => {
    await supabase.from('insights').update({ is_read: true }).eq('id', id)
    fetchInsights()
  }

  const deleteInsight = async (id: string) => {
    await supabase.from('insights').delete().eq('id', id)
    fetchInsights()
  }

  const generateInsights = async () => {
    setGenerating(true)
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date().toISOString().slice(0, 7) + '-01'
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [{ data: tasks }, { data: habits }, { data: habitLogs }, { data: expenses }] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user!.id),
      supabase.from('habits').select('*').eq('user_id', user!.id).eq('is_active', true),
      supabase.from('habit_logs').select('*').eq('user_id', user!.id).gte('completed_date', weekAgo),
      supabase.from('expenses').select('*').eq('user_id', user!.id).gte('expense_date', monthStart),
    ])

    const newInsights: any[] = []

    // Task insight
    const overdue = tasks?.filter(t => t.status === 'pending' && t.due_date && t.due_date < today).length || 0
    const completed = tasks?.filter(t => t.status === 'completed').length || 0
    const total = tasks?.length || 0
    if (total > 0) {
      newInsights.push({
        user_id: user!.id,
        type: 'tasks',
        title: overdue > 0 ? `You have ${overdue} overdue task${overdue > 1 ? 's' : ''}` : `Great job! ${completed} of ${total} tasks completed`,
        description: overdue > 0
          ? `Stay on top of your workload — consider reviewing and reprioritizing your task list.`
          : `You're keeping up with your tasks. Keep that momentum going!`,
        is_read: false,
      })
    }

    // Habit insight
    if (habits && habits.length > 0) {
      const rate = Math.round(((habitLogs?.length || 0) / (habits.length * 7)) * 100)
      newInsights.push({
        user_id: user!.id,
        type: 'habits',
        title: `${rate}% habit completion this week`,
        description: rate >= 70 ? `Excellent consistency! You're building strong routines.` : rate >= 40 ? `You're making progress. Try to be more consistent each day.` : `Habit completion is low this week. Start with just one habit and build from there.`,
        is_read: false,
      })
    }

    // Spending insight
    if (expenses && expenses.length > 0) {
      const total = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0)
      const topCat = Object.entries(
        expenses.reduce((acc: any, e: any) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc }, {})
      ).sort(([, a]: any, [, b]: any) => b - a)[0]

      newInsights.push({
        user_id: user!.id,
        type: 'spending',
        title: `₹${total.toLocaleString('en-IN')} spent this month`,
        description: `Your biggest spending category is ${topCat?.[0]} at ₹${Number(topCat?.[1]).toLocaleString('en-IN')}. Review if this aligns with your budget goals.`,
        is_read: false,
      })
    }

    if (newInsights.length > 0) {
      await supabase.from('insights').insert(newInsights)
      toast.success(`${newInsights.length} new insights generated!`)
      fetchInsights()
    } else {
      toast('Add some data first to generate insights', { icon: 'ℹ️' })
    }
    setGenerating(false)
  }

  const unread = insights.filter(i => !i.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in stagger-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Insights</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        <button onClick={generateInsights} disabled={generating} className="btn btn-primary">
          <TrendingUp className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>

      <div className="space-y-3 animate-in stagger-2">
        {loading ? (
          <div className="card text-center py-12"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p></div>
        ) : insights.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-2">✨</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No insights yet</p>
            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Click &quot;Generate Insights&quot; to analyze your data</p>
            <button onClick={generateInsights} disabled={generating} className="btn btn-primary mx-auto">
              Generate my first insight
            </button>
          </div>
        ) : insights.map((insight) => {
          const Icon = ICON_MAP[insight.type] || Lightbulb
          const colors = COLOR_MAP[insight.type] || COLOR_MAP.general
          return (
            <div
              key={insight.id}
              className="card flex gap-4 group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => !insight.is_read && markRead(insight.id)}
              style={{ opacity: insight.is_read ? 0.7 : 1 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
                <Icon className="w-5 h-5" style={{ color: colors.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{insight.title}</p>
                      {!insight.is_read && (
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                      )}
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.description}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      {new Date(insight.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteInsight(insight.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all shrink-0"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
