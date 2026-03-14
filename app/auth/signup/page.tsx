'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      toast.success('Account created! 🌱 Check your email.')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Soft background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '45vw', height: '45vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(90,122,92,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: '40vw', height: '40vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,154,170,0.07) 0%, transparent 70%)',
        }} />
      </div>

      <div className="w-full max-w-sm animate-in relative">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent-warm))',
              border: '1px solid var(--accent-warm)',
            }}
          >
            🌱
          </div>
          <span
            className="font-semibold text-lg"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Life Dashboard
          </span>
        </div>

        <div className="mb-7">
          <h2
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Plant your first seed 🌱
          </h2>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Create your account and start your journey
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <input
              className="input"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center py-2.5 mt-2"
            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
          >
            {loading ? 'Creating…' : 'Start growing 🌿'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>

        <p
          className="mt-10 text-center text-xs italic"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
        >
          "The best time to plant a tree was 20 years ago.<br />The second best time is now."
        </p>
      </div>
    </div>
  )
}
