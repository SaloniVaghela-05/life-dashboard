'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, CreditCard, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Streaming', 'Software', 'Music', 'Gaming', 'News', 'Fitness', 'Cloud', 'Other']

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', cost: '', billing_cycle: 'monthly', next_payment_date: '', category: 'Streaming', is_active: true })
  const supabase = createClient()

  const fetchSubs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user!.id)
      .order('next_payment_date', { ascending: true })
    setSubs(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  const addSub = async () => {
    if (!form.name || !form.cost) { toast.error('Name and cost are required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('subscriptions').insert({ ...form, cost: parseFloat(form.cost), user_id: user!.id })
    if (error) { toast.error('Failed to add'); return }
    toast.success('Subscription added!')
    setShowAdd(false)
    setForm({ name: '', cost: '', billing_cycle: 'monthly', next_payment_date: '', category: 'Streaming', is_active: true })
    fetchSubs()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('subscriptions').update({ is_active: !current }).eq('id', id)
    fetchSubs()
  }

  const deleteSub = async (id: string) => {
    await supabase.from('subscriptions').delete().eq('id', id)
    toast.success('Subscription removed')
    fetchSubs()
  }

  const activeSubs = subs.filter(s => s.is_active)
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (s.billing_cycle === 'yearly') return sum + (Number(s.cost) / 12)
    if (s.billing_cycle === 'weekly') return sum + (Number(s.cost) * 4.33)
    return sum + Number(s.cost)
  }, 0)
  const yearlyTotal = monthlyTotal * 12

  const isUpcomingSoon = (date: string) => {
    if (!date) return false
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in stagger-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Subscriptions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{activeSubs.length} active</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 animate-in stagger-2">
        <div className="card">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Monthly cost</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Yearly cost</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ₹{yearlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {showAdd && (
        <div className="card animate-in">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Subscription</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Service name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
              <input className="input" type="number" placeholder="Cost (₹) *" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.billing_cycle} onChange={e => setForm({ ...form, billing_cycle: e.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <input className="input" type="date" value={form.next_payment_date} onChange={e => setForm({ ...form, next_payment_date: e.target.value })} placeholder="Next payment date" />
            <div className="flex gap-2 pt-1">
              <button onClick={addSub} className="btn btn-primary">Save</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 animate-in stagger-3">
        {loading ? (
          <div className="card text-center py-12"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p></div>
        ) : subs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-2">💳</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No subscriptions tracked</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add your subscriptions to track spending</p>
          </div>
        ) : subs.map((sub) => (
          <div
            key={sub.id}
            className="card py-3 px-4 flex items-center gap-3 group"
            style={{ opacity: sub.is_active ? 1 : 0.5 }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-light)' }}>
              <CreditCard className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sub.name}</p>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{sub.category}</span>
                {isUpcomingSoon(sub.next_payment_date) && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                    <AlertCircle className="w-3 h-3" /> Due soon
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {sub.billing_cycle} · {sub.next_payment_date ? `Next: ${new Date(sub.next_payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'No date set'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹{Number(sub.cost).toLocaleString('en-IN')}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/{sub.billing_cycle === 'yearly' ? 'yr' : sub.billing_cycle === 'weekly' ? 'wk' : 'mo'}</p>
              </div>
              <button
                onClick={() => toggleActive(sub.id, sub.is_active)}
                className="w-9 h-5 rounded-full relative transition-colors"
                style={{ background: sub.is_active ? 'var(--accent)' : 'var(--border)' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                  style={{ left: sub.is_active ? 'calc(100% - 18px)' : '2px' }}
                />
              </button>
              <button
                onClick={() => deleteSub(sub.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all"
                style={{ color: '#ef4444' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
