'use client'

// ── Sobre.tsx ─────────────────────────────────────────────────────────────────

interface Props {
  onAbrir: () => void
}

export default function Sobre({ onAbrir }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '1.8rem',
    }}>
      {/* Encabezado */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: "'PinyonScript', serif",
          fontSize: '3rem', color: '#2C2320',
          lineHeight: 1, marginBottom: '0.25rem',
        }}>
          Carla{' '}
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.4rem', color: '#C94F4F', fontStyle: 'italic',
          }}>&amp;</span>{' '}
          Hely
        </p>
        <p style={{
          fontSize: '0.55rem', letterSpacing: '0.32em',
          textTransform: 'uppercase', color: '#9A8880',
        }}>
          Tienes una invitación
        </p>
      </div>

      {/* Sobre SVG */}
      <div
        onClick={onAbrir}
        style={{
          width: 'min(360px, 90vw)',
          cursor: 'pointer',
          animation: 'sobreFlota 4s ease-in-out infinite',
          filter: 'drop-shadow(0 18px 50px rgba(60,30,20,0.15)) drop-shadow(0 4px 14px rgba(60,30,20,0.09))',
        }}
      >
        <svg viewBox="0 0 360 190" style={{ width: '100%', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cartulina" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FEFCF9"/>
              <stop offset="40%"  stopColor="#FBF7F2"/>
              <stop offset="100%" stopColor="#F7F2EC"/>
            </linearGradient>
            <linearGradient id="cinta" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(230,210,200,0.0)"/>
              <stop offset="20%"  stopColor="rgba(230,210,200,0.22)"/>
              <stop offset="50%"  stopColor="rgba(235,218,208,0.38)"/>
              <stop offset="80%"  stopColor="rgba(230,210,200,0.22)"/>
              <stop offset="100%" stopColor="rgba(230,210,200,0.0)"/>
            </linearGradient>
            <linearGradient id="solapaSombraH" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(160,130,110,0.18)"/>
              <stop offset="100%" stopColor="rgba(160,130,110,0.0)"/>
            </linearGradient>
            <pattern id="emboss" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M5 35 Q12 20 20 15 Q28 10 35 5" stroke="rgba(180,160,145,0.13)" strokeWidth="0.8" fill="none"/>
              <path d="M12 26 Q8 20 12 16 Q14 22 12 26Z"  fill="rgba(180,160,145,0.10)"/>
              <path d="M22 18 Q26 12 30 14 Q26 18 22 18Z" fill="rgba(180,160,145,0.09)"/>
              <circle cx="20" cy="15" r="2.5" fill="none" stroke="rgba(180,160,145,0.11)" strokeWidth="0.6"/>
              <circle cx="20" cy="15" r="1"   fill="rgba(180,160,145,0.12)"/>
              <path d="M0 20 Q6 15 10 8" stroke="rgba(180,160,145,0.09)" strokeWidth="0.6" fill="none"/>
              <path d="M6 14 Q3 10 6 7 Q8 11 6 14Z" fill="rgba(180,160,145,0.08)"/>
            </pattern>
            <radialGradient id="wax" cx="38%" cy="35%" r="65%">
              <stop offset="0%"   stopColor="#EAA8A8"/>
              <stop offset="40%"  stopColor="#E08888"/>
              <stop offset="75%"  stopColor="#CC6868"/>
              <stop offset="100%" stopColor="#B05050"/>
            </radialGradient>
            <radialGradient id="waxHL" cx="30%" cy="28%" r="45%">
              <stop offset="0%"   stopColor="rgba(255,235,235,0.5)"/>
              <stop offset="100%" stopColor="rgba(255,235,235,0)"/>
            </radialGradient>
            <filter id="selloSombra" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0.5" dy="1.5" stdDeviation="2" floodColor="rgba(0,0,0,0.22)"/>
            </filter>
          </defs>

          {/* Cuerpo cartulina */}
          <rect x="0" y="0" width="360" height="190" rx="3" fill="url(#cartulina)"/>
          <rect x="0" y="0" width="360" height="190" rx="3" fill="url(#emboss)"/>
          <rect x="0" y="0" width="360" height="190" rx="3" fill="none" stroke="rgba(160,130,110,0.12)" strokeWidth="2"/>

          {/* Solapa */}
          <line x1="0" y1="28" x2="360" y2="28" stroke="rgba(185,160,145,0.28)" strokeWidth="0.8"/>
          <rect x="0" y="28" width="360" height="4" fill="url(#solapaSombraH)" opacity="0.5"/>
          <path d="M175 28 Q180 33 185 28" stroke="rgba(185,160,145,0.40)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

          {/* Cinta central */}
          <rect x="170" y="0" width="20" height="190" fill="url(#cinta)"/>

          {/* Sello de lacre — centrado en la línea horizontal */}
          <g transform="translate(180, 36)" filter="url(#selloSombra)">
            <circle r="26" fill="#9B4040"/>
            <circle r="24" fill="#C06060"/>
            <circle r="22" fill="url(#wax)"/>
            <circle r="18" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2"/>
            <circle r="17.2" fill="none" stroke="rgba(255,210,210,0.25)" strokeWidth="0.6"/>
            <circle r="22" fill="url(#waxHL)"/>
            <path d="M0,2 C0,-2.5 -5,-5 -8,-2.5 C-11,0 -11,4 -8,7.5 C-5,11 0,13.5 0,13.5 C0,13.5 5,11 8,7.5 C11,4 11,0 8,-2.5 C5,-5 0,-2.5 0,2 Z"
              fill="none" stroke="#FAE8D8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
              transform="matrix(1,0,-0.2,1.1,0,-6)"/>
          </g>
        </svg>
      </div>

      {/* Texto hint */}
      <div style={{ textAlign: 'center', animation: 'pulso 2.8s ease-in-out infinite', marginTop: '0.5rem' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.95rem', color: '#9A8880', letterSpacing: '0.04em' }}>
          Toca para abrir tu invitación
        </p>
      </div>
    </div>
  )
}