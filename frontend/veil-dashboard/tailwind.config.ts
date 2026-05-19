import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        veil: {
          bg: '#050816',
          panel: '#0B1220',
          cyan: '#22D3EE',
          blue: '#2563EB',
          deepblue: '#1D4ED8',
          text: '#F8FAFC',
          muted: '#94A3B8',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          border: '#1E293B',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(34, 211, 238, 0.35)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.35)',
      },
      animation: {
        'pulse-cyan': 'pulseCyan 2s ease-in-out infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'typewriter': 'typewriter 0.05s steps(1) forwards',
      },
      keyframes: {
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(34, 211, 238, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(34, 211, 238, 0.6)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
