'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back ☀️')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Left: Warm Sunset Scenery ── */}
      <div
        className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #8b3a27 0%, #c67b5c 30%, #d4956a 55%, #e8b87a 75%, #f4d090 100%)',
        }}
      >
        {/* Sky atmosphere glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,220,140,0.35) 0%, transparent 65%)',
        }} />

        {/* Layered warm mountain silhouettes */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '55%' }}>
          <svg viewBox="0 0 800 350" preserveAspectRatio="none" className="w-full h-full">
            {/* Far mountains */}
            <path d="M0,350 L0,200 L80,100 L180,170 L260,80 L360,145 L440,70 L540,135 L620,95 L700,155 L800,90 L800,350 Z"
              fill="rgba(140,60,35,0.40)" />
            {/* Mid mountains */}
            <path d="M0,350 L0,240 L100,145 L200,210 L290,120 L380,185 L470,105 L570,165 L660,115 L760,170 L800,130 L800,350 Z"
              fill="rgba(100,40,25,0.55)" />
            {/* Near mountains */}
            <path d="M0,350 L0,270 L140,165 L240,230 L320,148 L420,215 L500,140 L580,200 L680,155 L800,210 L800,350 Z"
              fill="rgba(70,28,18,0.75)" />
          </svg>
        </div>

        {/* Warm mist overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          background: 'linear-gradient(to top, rgba(250,247,242,0) 0%, transparent 100%)',
        }} />

        {/* Glowing sun */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,240,180,0.95) 0%, rgba(255,200,80,0.60) 50%, transparent 75%)',
          filter: 'blur(4px)',
        }} />
        <div style={{
          position: 'absolute', top: '17%', left: '50%', transform: 'translateX(-50%)',
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'rgba(255,248,220,0.98)',
          boxShadow: '0 0 60px 20px rgba(255,220,100,0.50)',
        }} />

        {/* Sun rays */}
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => (
          <div key={i} style={{
            position: 'absolute', top: 'calc(17% + 18px)', left: '50%',
            width: '1px', height: `${30 + (i % 3) * 15}px`,
            background: 'linear-gradient(to bottom, rgba(255,240,140,0.6), transparent)',
            transformOrigin: 'top center',
            transform: `translateX(-50%) rotate(${deg}deg)`,
            animation: `gentlePulse ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}

        {/* Text content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              ☀️
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              Life Dashboard
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,230,180,0.80)' }}>
              your personal sanctuary
            </p>
            <h1
              className="text-4xl font-normal text-white leading-snug mb-5"
              style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 20px rgba(80,20,0,0.30)' }}
            >
              Tend your life<br />
              <span style={{ color: 'rgba(255,240,180,0.95)' }}>like a garden.</span>
            </h1>
            <p style={{ color: 'rgba(255,220,170,0.75)', lineHeight: '1.75', maxWidth: '340px', fontSize: '0.95rem' }}>
              Track what matters, grow your habits, and find clarity in the warmth of your own data.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {['🌱 Tasks', '☀️ Habits', '💰 Finance', '🎯 Goals', '📖 Journal', '✨ Insights'].map(f => (
                <span key={f} className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,235,195,0.90)', backdropFilter: 'blur(4px)' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: 'rgba(255,200,140,0.45)' }}>
            Your data, your rhythm, your peace.
          </p>
        </div>
      </div>

      {/* ── Right: Sign in Form ── */}
      <div className="w-full lg:w-[440px] flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm animate-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <span className="text-xl">☀️</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              Life Dashboard
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              Welcome back
            </h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Sign in to your calm space
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input className="input" type="email" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3" style={{ borderRadius: '12px', fontSize: '0.9rem' }}>
              {loading ? 'Signing in…' : 'Sign in ☀️'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            New here?{' '}
            <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Create your sanctuary
            </Link>
          </p>
          <p className="mt-10 text-center text-xs italic" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            &quot;A journey of a thousand miles begins with a single step.&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
