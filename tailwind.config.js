/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#0f141d',
        abyssSoft: '#151c28',
        abyssCard: '#1b2432',
        gold: '#d3bc8e',
        goldSoft: '#e8d8b4',
        emeraldKeep: '#4ade80',
        amberNiche: '#fbbf24',
        coralDiscard: '#fb7185',
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(211, 188, 142, 0.12)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.22)',
      },
    },
  },
  plugins: [],
}
