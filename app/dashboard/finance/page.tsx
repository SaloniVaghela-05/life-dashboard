'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Other']
const INCOME_SOURCES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
const CHART_COLORS = ['#4f6ef7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

export default function FinancePage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [income, setIncome] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState<'expense' | 'income' | null>(null)
  const [loading, setLoading] = useState(true)
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Food', description: '', expense_date: new Date().toISOString().split('T')[0], payment_method: '' })
  const [incomeForm, setIncomeForm] = useState({ amount: '', source: 'Salary', description: '', income_date: new Date().toISOString().split('T')[0], is_recurring: false })
  const supabase = createClient()

  const monthStart = new Date().toISOString().slice(0, 7) + '-01'

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: e }, { data: i }] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user!.id).gte('expense_date', monthStart).order('expense_date', { ascending: false }),
      supabase.from('income').select('*').eq('user_id', user!.id).gte('income_date', monthStart).order('income_date', { ascending: false }),
    ])
    setExpenses(e || [])
    setIncome(i || [])
    setLoading(false)
  }, [supabase, monthStart])

  useEffect(() => { fetchData() }, [fetchData])

  const addExpense = async () => {
    if (!expenseForm.amount) { toast.error('Amount is required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('expenses').insert({ ...expenseForm, amount: parseFloat(expenseForm.amount), user_id: user!.id })
    if (error) { toast.error('Failed to add expense'); return }
    toast.success('Expense added')
    setShowAdd(null)
    setExpenseForm({ amount: '', category: 'Food', description: '', expense_date: new Date().toISOString().split('T')[0], payment_method: '' })
    fetchData()
  }

  const addIncome = async () => {
    if (!incomeForm.amount) { toast.error('Amount is required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('income').insert({ ...incomeForm, amount: parseFloat(incomeForm.amount), user_id: user!.id })
    if (error) { toast.error('Failed to add income'); return }
    toast.success('Income added')
    setShowAdd(null)
    setIncomeForm({ amount: '', source: 'Salary', description: '', income_date: new Date().toISOString().split('T')[0], is_recurring: false })
    fetchData()
  }

  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const balance = totalIncome - totalExpenses

  const categoryData = Object.entries(
    expenses.reduce((acc: any, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const last7DaysData = (() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      const dayExpense = expenses.filter(e => e.expense_date === date).reduce((s: number, e: any) => s + Number(e.amount), 0)
      days.push({ date: label, amount: dayExpense })
    }
    return days
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in stagger-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Finance</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd('income')} className="btn btn-ghost" style={{ color: '#10b981', borderColor: '#bbf7d0' }}>
            <TrendingUp className="w-4 h-4" /> Income
          </button>
          <button onClick={() => setShowAdd('expense')} className="btn btn-primary">
            <TrendingDown className="w-4 h-4" /> Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-in stagger-2">
        {[
          { label: 'Income', value: totalIncome, color: '#10b981', bg: '#d1fae5', icon: TrendingUp },
          { label: 'Expenses', value: totalExpenses, color: '#ef4444', bg: '#fee2e2', icon: TrendingDown },
          { label: 'Balance', value: balance, color: balance >= 0 ? '#4f6ef7' : '#ef4444', bg: balance >= 0 ? '#eef1ff' : '#fee2e2', icon: DollarSign },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color, letterSpacing: '-0.02em' }}>
              ₹{Math.abs(value).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Add forms */}
      {showAdd === 'expense' && (
        <div className="card animate-in">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Expense</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" type="number" placeholder="Amount (₹) *" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} autoFocus />
              <select className="input" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              <input className="input" type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
            </div>
            <input className="input" placeholder="Payment method (UPI, Cash, Card...)" value={expenseForm.payment_method} onChange={e => setExpenseForm({ ...expenseForm, payment_method: e.target.value })} />
            <div className="flex gap-2 pt-1">
              <button onClick={addExpense} className="btn btn-primary">Save</button>
              <button onClick={() => setShowAdd(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAdd === 'income' && (
        <div className="card animate-in">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Income</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" type="number" placeholder="Amount (₹) *" value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} autoFocus />
              <select className="input" value={incomeForm.source} onChange={e => setIncomeForm({ ...incomeForm, source: e.target.value })}>
                {INCOME_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Description" value={incomeForm.description} onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })} />
              <input className="input" type="date" value={incomeForm.income_date} onChange={e => setIncomeForm({ ...incomeForm, income_date: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addIncome} className="btn btn-primary">Save</button>
              <button onClick={() => setShowAdd(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 animate-in stagger-3">
        <div className="card">
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No expenses this month</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Daily Spend (Last 7 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7DaysData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Bar dataKey="amount" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card animate-in stagger-4">
        <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Transactions This Month</h3>
        {loading ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {[
              ...expenses.map(e => ({ ...e, type: 'expense', date: e.expense_date })),
              ...income.map(i => ({ ...i, type: 'income', date: i.income_date })),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 20)
              .map((t) => (
                <div key={`${t.type}-${t.id}`} className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: t.type === 'income' ? '#d1fae5' : '#fee2e2' }}>
                      {t.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description || t.category || t.source}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {t.category && <span className="ml-1">· {t.category}</span>}
                        {t.payment_method && <span className="ml-1">· {t.payment_method}</span>}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                    {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            {expenses.length === 0 && income.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No transactions this month</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
