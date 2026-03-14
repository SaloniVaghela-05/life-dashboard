'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { getGreeting } from '@/lib/utils'

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    tasks: { pending: 0, completed: 0 },
    habits: { total: 0, doneToday: 0 },
    finance: { income: 0, expenses: 0 },
    goals: { active: 0, completed: 0 },
    journals: 0,
    subscriptions: { count: 0, monthly: 0 },
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  const fetchStats = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    setUser(u)
    const [
      { data: tasks }, { data: habits }, { data: habitLogs },
      { data: expenses }, { data: income }, { data: goals },
      { data: journals }, { data: subs },
    ] = await Promise.all([
      supabase.from('tasks').select('status').eq('user_id', u.id),
      supabase.from('habits').select('id').eq('user_id', u.id).eq('is_active', true),
      supabase.from('habit_logs').select('habit_id').eq('user_id', u.id).eq('completed_date', today),
      supabase.from('expenses').select('amount').eq('user_id', u.id).gte('expense_date', monthStart),
      supabase.from('income').select('amount').eq('user_id', u.id).gte('income_date', monthStart),
      supabase.from('goals').select('status').eq('user_id', u.id),
      supabase.from('journal_entries').select('id').eq('user_id', u.id),
      supabase.from('subscriptions').select('cost, billing_cycle, is_active').eq('user_id', u.id),
    ])
    const activeSubs = (subs || []).filter((s: any) => s.is_active)
    const monthlySubTotal = activeSubs.reduce((sum: number, s: any) => {
      if (s.billing_cycle === 'yearly') return sum + (Number(s.cost) / 12)
      if (s.billing_cycle === 'weekly') return sum + (Number(s.cost) * 4.33)
      return sum + Number(s.cost)
    }, 0)
    setStats({
      tasks: {
        pending: (tasks || []).filter((t: any) => t.status === 'pending').length,
        completed: (tasks || []).filter((t: any) => t.status === 'completed').length,
      },
      habits: { total: (habits || []).length, doneToday: (habitLogs || []).length },
      finance: {
        income: (income || []).reduce((s: number, i: any) => s + Number(i.amount), 0),
        expenses: (expenses || []).reduce((s: number, e: any) => s + Number(e.amount), 0),
      },
      goals: {
        active: (goals || []).filter((g: any) => g.status === 'active').length,
        completed: (goals || []).filter((g: any) => g.status === 'completed').length,
      },
      journals: (journals || []).length,
      subscriptions: { count: activeSubs.length, monthly: monthlySubTotal },
    })
    setLoading(false)
  }, [supabase, today, monthStart])

  useEffect(() => { fetchStats() }, [fetchStats])

  const name = user?.user_metadata?.full_name?.split(' ')[0] || ''
  const balance = stats.finance.income - stats.finance.expenses
  const habitPct = stats.habits.total > 0
    ? Math.round((stats.habits.doneToday / stats.habits.total) * 100) : 0
  const spendPct = stats.finance.income > 0
    ? Math.min((stats.finance.expenses / stats.finance.income) * 100, 100) : 0

  const cards = [
    { href: '/dashboard/tasks',         emoji: '📝', label: 'Tasks',
      value: loading ? '—' : `${stats.tasks.pending} to do`,
      sub: loading ? '…' : `${stats.tasks.completed} cleared`, bg: 'rgba(244,162,97,0.12)', border: 'rgba(244,162,97,0.25)' },
    { href: '/dashboard/habits',        emoji: '☀️', label: 'Habits',
      value: loading ? '—' : `${stats.habits.doneToday} of ${stats.habits.total}`,
      sub: loading ? '…' : `${habitPct}% done today`, bg: 'rgba(255,220,140,0.15)', border: 'rgba(244,200,100,0.3)' },
    { href: '/dashboard/finance',       emoji: '💰', label: 'Finance',
      value: loading ? '—' : `₹${Math.abs(balance).toLocaleString('en-IN')}`,
      sub: loading ? '…' : (balance >= 0 ? 'well balanced' : 'in deficit'), bg: 'rgba(215,198,173,0.2)', border: 'rgba(215,198,173,0.4)' },
    { href: '/dashboard/goals',         emoji: '🎯', label: 'Goals',
      value: loading ? '—' : `${stats.goals.active} active`,
      sub: loading ? '…' : `${stats.goals.completed} achieved`, bg: 'rgba(240,200,210,0.18)', border: 'rgba(220,160,180,0.3)' },
    { href: '/dashboard/journal',       emoji: '📖', label: 'Journal',
      value: loading ? '—' : `${stats.journals} entries`,
      sub: 'soul reflected', bg: 'rgba(180,180,180,0.12)', border: 'rgba(180,180,180,0.25)' },
    { href: '/dashboard/subscriptions', emoji: '💳', label: 'Subscriptions',
      value: loading ? '—' : `₹${stats.subscriptions.monthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo`,
      sub: loading ? '…' : `${stats.subscriptions.count} active`, bg: 'rgba(244,162,97,0.10)', border: 'rgba(200,150,100,0.25)' },
  ]

  return (
    <div className="space-y-8 pb-8">

      {/* ── Header ── */}
      <header className="pt-2 animate-in stagger-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          <span>🌅</span>
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</span>
        </div>
        <h2
          className="text-4xl leading-snug mb-1"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {getGreeting()}{name ? `, ${name}` : ''} ☀️
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Warm light for a steady heart
        </p>
      </header>

      {/* ── Finance Hero (Terracotta) ── */}
      <section className="animate-in stagger-2">
        <div
          className="p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #c67b5c 0%, #d4956a 55%, #e8a870 100%)',
            borderRadius: '2.5rem',
            boxShadow: '0 8px 32px rgba(198,123,92,0.30)',
            color: 'white',
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', right: '-40px', top: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(244,162,97,0.30)', filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', right: '40px', bottom: '-50px',
            width: '250px', height: '250px', borderRadius: '50%',
            background: 'rgba(233,220,200,0.20)', filter: 'blur(30px)',
          }} />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest" style={{ opacity: 0.75 }}>
                This Month&apos;s Balance
              </span>
              <div
                className="text-6xl mt-2"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
              >
                ₹{Math.abs(balance).toLocaleString('en-IN')}
              </div>
              <div className="mt-4">
                <span
                  className="text-xs font-medium px-4 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.20)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {balance >= 0 ? '✨ stay radiant' : '⚡ review spending'}
                </span>
              </div>
            </div>

            <div className="space-y-3 w-full md:w-auto">
              <div className="flex justify-between md:justify-end items-center gap-6">
                <span className="text-xs" style={{ opacity: 0.72 }}>Income</span>
                <span className="font-semibold" style={{ color: '#d4f0c8' }}>
                  +₹{stats.finance.income.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between md:justify-end items-center gap-6">
                <span className="text-xs" style={{ opacity: 0.72 }}>Spent</span>
                <span className="font-semibold" style={{ color: '#ffd4c8' }}>
                  -₹{stats.finance.expenses.toLocaleString('en-IN')}
                </span>
              </div>
              {/* Mini spend bar */}
              <div
                className="h-1 rounded-full overflow-hidden mt-1"
                style={{ background: 'rgba(255,255,255,0.18)', width: '160px' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${spendPct}%`, background: 'rgba(255,255,255,0.7)', transition: 'width 0.8s' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in stagger-3">
        {cards.map(({ href, emoji, label, value, sub, bg, border }) => (
          <Link
            key={href}
            href={href}
            className="group transition-all duration-200 hover:-translate-y-1"
            style={{
              background: 'rgba(255,255,255,0.60)',
              border: `1px solid ${border}`,
              borderRadius: '1.75rem',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-warm)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-warm-md)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-warm)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-xl"
              style={{ background: bg }}
            >
              {emoji}
            </div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
          </Link>
        ))}
      </section>

      {/* ── Quick Actions ── */}
      <section className="animate-in stagger-4">
        <h3 className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/dashboard/tasks',   label: '✨ Add Task' },
            { href: '/dashboard/habits',  label: '🌅 Log Habit' },
            { href: '/dashboard/finance', label: '💰 Add Expense' },
            { href: '/dashboard/journal', label: '📖 Write Entry' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.60)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(6px)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.60)' }}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Habit bar (if exists) ── */}
      {!loading && stats.habits.total > 0 && (
        <section
          className="rounded-3xl p-5 animate-in stagger-5"
          style={{
            background: 'rgba(255,255,255,0.60)',
            border: '1px solid var(--border-light)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Today&apos;s Focus
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
              {stats.habits.doneToday} of {stats.habits.total} completed
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${habitPct}%` }} />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{habitPct}% done today</p>
        </section>
      )}
    </div>
  )
}
