/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clarity mode colors (high contrast, accessible)
        clarity: {
          primary: '#1a365d',
          secondary: '#2d3748',
          accent: '#3182ce',
          success: '#38a169',
          warning: '#d69e2e',
          danger: '#e53e3e',
          background: '#ffffff',
          surface: '#f7fafc',
          text: '#1a202c',
        },
        // Power mode colors (rich, detailed)
        power: {
          primary: '#2b6cb0',
          secondary: '#4a5568',
          accent: '#3182ce',
          success: '#38a169',
          warning: '#d69e2e',
          danger: '#e53e3e',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#2d3748',
        }
      },
      fontSize: {
        'clarity-sm': ['1rem', { lineHeight: '1.6' }],
        'clarity-base': ['1.25rem', { lineHeight: '1.6' }],
        'clarity-lg': ['1.5rem', { lineHeight: '1.5' }],
        'clarity-xl': ['1.875rem', { lineHeight: '1.4' }],
      }
    },
  },
  plugins: [],
}