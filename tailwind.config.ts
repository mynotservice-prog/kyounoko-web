import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF5E8',
        'paper-deep': '#F1E8D3',
        'paper-card': '#FFFBF3',
        line: '#E3D7BE',
        'line-strong': '#CFBC9C',
        ink: '#25201B',
        'ink-sub': '#5F5548',
        'ink-mute': '#968B7B',
        clay: '#C9603E',
        'clay-deep': '#8E3F22',
        'clay-soft': '#F4DDCF',
        peach: '#F4B787',
        'peach-soft': '#FBE8D8',
        honey: '#EBC06A',
        'honey-soft': '#F8ECCB',
        sage: '#8FA37E',
        'sage-deep': '#5F6F5B',
        'sage-soft': '#DFE7D4',
        sky: '#7FA3BA',
        'sky-soft': '#D5E2EB',
        ochre: '#D8A665',
        'ochre-soft': '#F2E2C5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans JP', 'Hiragino Sans', 'sans-serif'],
        mincho: ['var(--font-mincho)', 'Shippori Mincho', 'Hiragino Mincho ProN', 'serif'],
        // display は Shippori Mincho に統合（旧 DM Serif Display）。
        // 既存の `font-display` クラスは mincho にエイリアスして見た目を維持。
        display: ['var(--font-mincho)', 'Shippori Mincho', 'Hiragino Mincho ProN', 'serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        lg: '20px',
        xl: '28px',
      },
      maxWidth: {
        container: '1200px',
        article: '760px',
      },
    },
  },
  plugins: [],
};

export default config;
