'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const MOODS = [
  { emoji: '😄', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Bad', value: 'bad' },
  { emoji: '😢', label: 'Awful', value: 'awful' },
]

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', content: '', mood: 'good', entry_date: new Date().toISOString().split('T')[0] })
  const supabase = createClient()

  const fetchEntries = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user!.id)
      .order('entry_date', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const addEntry = async () => {
    if (!form.content.trim()) { toast.error('Write something!'); return }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('journal_entries').insert({ ...form, user_id: user!.id })
    if (error) { toast.error('Failed to save'); return }
    toast.success('Entry saved 📔')
    setShowAdd(false)
    setForm({ title: '', content: '', mood: 'good', entry_date: new Date().toISOString().split('T')[0] })
    fetchEntries()
  }

  const deleteEntry = async (id: string) => {
    await supabase.from('journal_entries').delete().eq('id', id)
    toast.success('Entry deleted')
    if (selectedEntry?.id === id) setSelectedEntry(null)
    fetchEntries()
  }

  const getMoodEmoji = (mood: string) => MOODS.find(m => m.value === mood)?.emoji || '🙂'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in stagger-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Journal</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{entries.length} entries</p>
        </div>
        <button onClick={() => { setShowAdd(true); setSelectedEntry(null) }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Write form */}
      {showAdd && (
        <div className="card animate-in">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <div className="space-y-3">
            <input className="input" placeholder="Title (optional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div className="flex items-center gap-3">
              <span className="text-sm shrink-0" style={{ color: 'var(--text-secondary)' }}>Mood:</span>
              <div className="flex gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setForm({ ...form, mood: m.value })}
                    className="text-xl transition-all rounded-lg p-1"
                    style={{
                      opacity: form.mood === m.value ? 1 : 0.4,
                      transform: form.mood === m.value ? 'scale(1.2)' : 'scale(1)',
                      background: form.mood === m.value ? 'var(--accent-light)' : 'transparent',
                    }}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              <input className="input ml-auto" type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} style={{ width: 'auto' }} />
            </div>
            <textarea
              className="input resize-none"
              placeholder="Write your thoughts... What happened today? How are you feeling? What are you grateful for?"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={6}
              autoFocus
            />
            <div className="flex gap-2 pt-1">
              <button onClick={addEntry} className="btn btn-primary">Save Entry</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Entries */}
      {selectedEntry ? (
        <div className="card animate-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getMoodEmoji(selectedEntry.mood)}</span>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedEntry.title || 'Journal Entry'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(selectedEntry.entry_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => deleteEntry(selectedEntry.id)} className="btn btn-ghost" style={{ color: '#ef4444' }}>
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setSelectedEntry(null)} className="btn btn-ghost">← Back</button>
            </div>
          </div>
          <div className="prose max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{selectedEntry.content}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-in stagger-2">
          {loading ? (
            <div className="card text-center py-12"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading entries...</p></div>
          ) : entries.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-2xl mb-2">📔</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No journal entries yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Start writing your thoughts</p>
            </div>
          ) : entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="card w-full text-left hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0 mt-0.5">{getMoodEmoji(entry.mood)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {entry.title || new Date(entry.entry_date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{entry.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(entry.entry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
