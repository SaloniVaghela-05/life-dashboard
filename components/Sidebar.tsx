'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard',               label: 'Overview',      emoji: '📂' },
  { href: '/dashboard/tasks',         label: 'Tasks',         emoji: '☑️' },
  { href: '/dashboard/habits',        label: 'Habits',        emoji: '📈' },
  { href: '/dashboard/finance',       label: 'Finance',       emoji: '💰' },
  { href: '/dashboard/goals',         label: 'Goals',         emoji: '🎯' },
  { href: '/dashboard/journal',       label: 'Journal',       emoji: '📖' },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', emoji: '💳' },
  { href: '/dashboard/insights',      label: 'Insights',      emoji: '✨' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('See you soon 🌅')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0"
      style={{
        width: '230px',
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--border-light)',
      }}
    >
      {/* Brand */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          ☀️
        </div>
        <div>
          <p
            className="text-sm font-bold leading-none"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Life Dashboard
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            your calm space
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, emoji }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
              )}
              style={
                isActive
                  ? {
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      border: '1px solid var(--accent-warm)',
                    }
                  : {
                      color: 'var(--text-secondary)',
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surface-2)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = ''
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <span className="text-base w-5 text-center">{emoji}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        <div
          className="px-3 py-3 rounded-xl italic text-xs leading-relaxed"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-light)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-display)',
          }}
        >
          "Radiate like the morning sun."
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fae8e4'
            e.currentTarget.style.color = 'var(--danger)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = ''
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <span className="text-base">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
