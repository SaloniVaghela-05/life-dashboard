/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
      },
      colors: {
        zen: {
          sand: '#faf7f2',
          parchment: '#f5efe6',
          beige: '#846433ff',
          river: '#d7c6ad',
          stone: '#9a8c82',
          bark: '#5c4336',
          terracotta: '#c67b5c',
          clay: '#8e5a45',
          orange: '#f4a261',
          moss: '#9a9e7a',
        },
      },
      borderRadius: {
        stone: '2rem',
        'stone-lg': '2.5rem',
      },
      boxShadow: {
        stone: '0 4px 20px rgba(139,115,85,0.12), 0 2px 6px rgba(139,115,85,0.07)',
        warm: '0 2px 8px rgba(142,90,69,0.08)',
        'warm-md': '0 4px 20px rgba(142,90,69,0.10)',
        'warm-lg': '0 8px 32px rgba(142,90,69,0.13)',
      },
      animation: {
        'stone-clear': 'stoneClear 0.45s cubic-bezier(0.4,0,0.2,1) forwards',
        'pop-success': 'popSuccess 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'gentle-pulse': 'gentlePulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
