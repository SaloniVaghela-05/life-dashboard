import React from 'react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          About this Dashboard
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          The story behind the screen 🌿
        </p>
      </header>

      <div className="space-y-8">
        <section
          className="p-8 rounded-2xl"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 20px rgba(139, 58, 39, 0.05)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Why I Made It
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              Life Dashboard is a personal productivity platform designed to help you organize your daily life in one simple workspace. It brings together task management, habit tracking, and financial monitoring so you can focus on what truly matters.
            </p>
            <p>
              Built with a minimal and intuitive approach, the platform helps reduce distractions and makes planning your day easier and more effective. Whether you are working towards academic goals, career growth, or personal improvement, Life Dashboard supports you in staying consistent and in control.
            </p>
            <p>
              The goal is not just to stay busy, but to stay organized, intentional, and productive every day.
            </p>
          </div>
        </section>

        <section
          className="p-8 rounded-2xl"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 20px rgba(139, 58, 39, 0.05)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🛠️</span>
            <h2 className="text-xl font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              How I Made It
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              This project is built using modern web development technologies to ensure it is fast, responsive, and secure:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4" style={{ color: 'var(--text-secondary)' }}>
              <li>
                <strong>Next.js (React)</strong> for the core architecture and smooth user interfaces.
              </li>
              <li>
                <strong>Tailwind CSS</strong> combined with custom CSS variables for our warm, zen-inspired styling system.
              </li>
              <li>
                <strong>Supabase</strong> as the backend for secure authentication, real-time database management, and structured data storage.
              </li>
              <li>
                <strong>Lucide React</strong> for the beautiful, consistent iconography.
              </li>
            </ul>
          </div>
        </section>

        <section
          className="p-8 rounded-2xl flex items-center gap-4"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 10px rgba(139, 58, 39, 0.03)'
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-warm)' }}>
            👩🏽‍💻
          </div>
          <div>
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Built by Saloni Vaghela
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              2nd Year Engineering Student
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
