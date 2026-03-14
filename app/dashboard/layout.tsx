import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Warm ambient top wash */}
        <div className="pointer-events-none fixed inset-0 z-0" style={{
          background: 'radial-gradient(ellipse 60% 40% at 80% 10%, rgba(244,162,97,0.05) 0%, transparent 55%)',
        }} />
        <div className="relative z-10 max-w-4xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
