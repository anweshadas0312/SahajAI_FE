import React from 'react'

export interface ThinkingBulbProps {
  state?: 'thinking' | 'lit' | 'off'
  size?: number | string
  className?: string
}

export const ThinkingBulb: React.FC<ThinkingBulbProps> = ({
  state = 'off',
  size = 40,
  className = '',
}) => {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size

  return (
    <span
      className={`ct-bulb ${className}`}
      data-state={state}
      role="img"
      aria-label={state === 'thinking' ? 'Thinking...' : state === 'lit' ? 'Answer ready' : 'Idle'}
      style={{ '--ct-bulb-size': sizeStyle, width: sizeStyle, height: sizeStyle } as React.CSSProperties}
    >
      {/* Background Soft Glow Halo */}
      <span className="ct-bulb__halo" />

      {/* Main Vector Lightbulb SVG */}
      <svg
        className="ct-bulb__svg"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Lit Bulb Yellow Gradient */}
          <radialGradient id="ctLitGlass" cx="45%" cy="40%" r="55%" fx="40%" fy="35%">
            <stop offset="0%" stopColor="#FFF9A6" />
            <stop offset="45%" stopColor="#FFDE03" />
            <stop offset="85%" stopColor="#F5B700" />
            <stop offset="100%" stopColor="#E5A700" />
          </radialGradient>

          {/* Unlit Glass Gradient */}
          <radialGradient id="ctOffGlass" cx="45%" cy="40%" r="55%" fx="40%" fy="35%">
            <stop offset="0%" stopColor="#E2DFC8" />
            <stop offset="60%" stopColor="#C4C0A2" />
            <stop offset="100%" stopColor="#9C987D" />
          </radialGradient>

          {/* Lit Glow Filter */}
          <filter id="ctBulbGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 7 Light Rays (Tilted perspective matching artwork) */}
        <g className="ct-bulb__rays-group" stroke="#F5B700" strokeWidth="4.5" strokeLinecap="round">
          <line x1="28" y1="20" x2="16" y2="12" />
          <line x1="56" y1="12" x2="55" y2="-2" />
          <line x1="84" y1="16" x2="98" y2="8" />
          <line x1="98" y1="42" x2="114" y2="40" />
          <line x1="96" y1="70" x2="110" y2="76" />
          <line x1="16" y1="46" x2="2" y2="46" />
          <line x1="22" y1="74" x2="8" y2="82" />
        </g>

        {/* Rotated Bulb Body (-18 degrees for authentic icon stance) */}
        <g transform="rotate(-18 56 60)">
          {/* Screw Base & Contact (Dark Slate / Charcoal Metallic) */}
          <path
            d="M45 74 C45 72 67 72 67 74 L66 82 C66 84 46 84 46 82 Z"
            fill="#334155"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Thread Ridge 1 */}
          <path
            d="M46 81 C46 79 66 79 66 81 L64 87 C64 89 48 89 48 87 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Bottom Terminal Nub */}
          <path
            d="M50 88 C50 86 62 86 62 88 C62 93 50 93 50 88 Z"
            fill="#0F172A"
            stroke="#020617"
            strokeWidth="2.5"
          />

          {/* UNLIT Bulb Glass */}
          <path
            className="ct-bulb__off-layer"
            d="M56 18 C40 18 30 32 30 46 C30 55 36 62 42 68 C44 70 45 74 45 75 L67 75 C67 74 68 70 70 68 C76 62 82 55 82 46 C82 32 72 18 56 18 Z"
            fill="url(#ctOffGlass)"
            stroke="#1E293B"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* LIT Bulb Glass (Bright Yellow with Inner Glow) */}
          <path
            className="ct-bulb__on-layer"
            d="M56 18 C40 18 30 32 30 46 C30 55 36 62 42 68 C44 70 45 74 45 75 L67 75 C67 74 68 70 70 68 C76 62 82 55 82 46 C82 32 72 18 56 18 Z"
            fill="url(#ctLitGlass)"
            stroke="#1E293B"
            strokeWidth="4"
            strokeLinejoin="round"
            filter="url(#ctBulbGlow)"
          />

          {/* Filament Details (Visible in both lit and unlit) */}
          <g className="ct-bulb__filament" stroke="#713F12" strokeWidth="2" strokeLinecap="round" opacity="0.65">
            <line x1="48" y1="72" x2="49" y2="52" />
            <line x1="64" y1="72" x2="63" y2="52" />
            <path d="M49 52 C51 45 61 45 63 52" fill="none" strokeWidth="2.5" />
          </g>

          {/* Gloss / Specular Reflection Arc on Glass */}
          <path
            d="M37 32 C39 25 46 22 53 21"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
            className="ct-bulb__specular"
          />
        </g>
      </svg>
    </span>
  )
}

export default ThinkingBulb

