'use client'

// ── Sobre.tsx ─────────────────────────────────────────────────────────────────
// Muestra el sobre animado con el arreglo floral SVG.
// Props:
//   onAbrir — se llama cuando el usuario toca el sobre

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
            <linearGradient id="plata" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#E8E8E8"/>
              <stop offset="40%"  stopColor="#D0D0D0"/>
              <stop offset="70%"  stopColor="#C4C4C4"/>
              <stop offset="100%" stopColor="#B8B8B8"/>
            </linearGradient>
            <linearGradient id="plataBrillo" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#F0F0F0"/>
              <stop offset="50%"  stopColor="#C8C8C8"/>
              <stop offset="100%" stopColor="#A8A8A8"/>
            </linearGradient>
            <filter id="rosaSombra" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="rgba(100,70,60,0.22)"/>
            </filter>
            <filter id="rosaSombraChica" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0.5" dy="1.5" stdDeviation="1.8" floodColor="rgba(100,70,60,0.18)"/>
            </filter>
            <pattern id="emboss" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M5 35 Q12 20 20 15 Q28 10 35 5" stroke="rgba(180,160,145,0.13)" strokeWidth="0.8" fill="none"/>
              <path d="M12 26 Q8 20 12 16 Q14 22 12 26Z"  fill="rgba(180,160,145,0.10)"/>
              <path d="M22 18 Q26 12 30 14 Q26 18 22 18Z" fill="rgba(180,160,145,0.09)"/>
              <circle cx="20" cy="15" r="2.5" fill="none" stroke="rgba(180,160,145,0.11)" strokeWidth="0.6"/>
              <circle cx="20" cy="15" r="1"   fill="rgba(180,160,145,0.12)"/>
              <path d="M0 20 Q6 15 10 8" stroke="rgba(180,160,145,0.09)" strokeWidth="0.6" fill="none"/>
              <path d="M6 14 Q3 10 6 7 Q8 11 6 14Z" fill="rgba(180,160,145,0.08)"/>
            </pattern>
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

          {/* Follaje */}
          <g opacity="0.55">
            <path d="M148 72 Q138 58 142 44 Q150 56 152 68Z" fill="#8A9A62" opacity="0.5"/>
            <path d="M148 72 Q140 60 146 46 Q153 60 150 70Z" fill="#9AAA72" opacity="0.35"/>
            <path d="M158 65 Q150 54 154 44 Q160 54 161 63Z" fill="#8A9A62" opacity="0.45"/>
            <path d="M212 72 Q222 58 218 44 Q210 56 208 68Z" fill="#8A9A62" opacity="0.5"/>
            <path d="M212 72 Q220 60 214 46 Q207 60 210 70Z" fill="#9AAA72" opacity="0.35"/>
            <path d="M202 65 Q210 54 206 44 Q200 54 199 63Z" fill="#8A9A62" opacity="0.45"/>
            <path d="M178 68 Q176 55 180 42" stroke="#9AAA72" strokeWidth="1"   strokeLinecap="round" fill="none" opacity="0.6"/>
            <path d="M182 68 Q184 55 180 42" stroke="#8A9A62" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5"/>
          </g>

          {/* Berries plateados */}
          <g opacity="0.82">
            <path d="M162 62 Q155 50 149 38 Q146 30 148 22" stroke="url(#plata)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
            <circle cx="148" cy="22" r="3.8" fill="url(#plataBrillo)"/>
            <circle cx="144" cy="27" r="3"   fill="url(#plataBrillo)" opacity="0.9"/>
            <circle cx="150" cy="17" r="2.5" fill="url(#plataBrillo)" opacity="0.85"/>
            <circle cx="153" cy="24" r="2.2" fill="url(#plataBrillo)" opacity="0.8"/>
            <path d="M155 52 Q150 42 146 32" stroke="url(#plata)" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
            <circle cx="146" cy="32" r="2.5" fill="url(#plataBrillo)" opacity="0.75"/>
            <circle cx="143" cy="36" r="2"   fill="url(#plataBrillo)" opacity="0.7"/>

            <path d="M198 62 Q205 50 211 38 Q214 30 212 22" stroke="url(#plata)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
            <circle cx="212" cy="22" r="3.8" fill="url(#plataBrillo)"/>
            <circle cx="216" cy="27" r="3"   fill="url(#plataBrillo)" opacity="0.9"/>
            <circle cx="210" cy="17" r="2.5" fill="url(#plataBrillo)" opacity="0.85"/>
            <circle cx="207" cy="24" r="2.2" fill="url(#plataBrillo)" opacity="0.8"/>
            <path d="M205 52 Q210 42 214 32" stroke="url(#plata)" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
            <circle cx="214" cy="32" r="2.5" fill="url(#plataBrillo)" opacity="0.75"/>
            <circle cx="217" cy="36" r="2"   fill="url(#plataBrillo)" opacity="0.7"/>

            <path d="M178 55 Q174 44 172 32" stroke="url(#plata)" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65"/>
            <circle cx="172" cy="32" r="2"   fill="url(#plataBrillo)" opacity="0.7"/>
            <circle cx="170" cy="27" r="1.6" fill="url(#plataBrillo)" opacity="0.65"/>
            <path d="M182 55 Q186 44 188 32" stroke="url(#plata)" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65"/>
            <circle cx="188" cy="32" r="2"   fill="url(#plataBrillo)" opacity="0.7"/>
            <circle cx="190" cy="27" r="1.6" fill="url(#plataBrillo)" opacity="0.65"/>
          </g>

          {/* Rosa chica izquierda */}
          <g transform="translate(157, 60)" filter="url(#rosaSombraChica)">
            <path d="M3,-17 Q11,-12 13,-2 Q11,9 3,13 Q-5,14 -11,7 Q-14,-3 -9,-12 Q-4,-17 3,-17Z"  fill="#FEFEFE" stroke="#EAE0D8" strokeWidth="0.5"/>
            <path d="M-9,-8 Q-16,-10 -16,-4 Q-14,1 -9,2Z"  fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.9"/>
            <path d="M11,-4 Q17,-6 17,0 Q16,5 11,6Z"       fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.9"/>
            <path d="M3,12 Q8,15 6,19 Q1,17 -3,15 Q-2,11 3,12Z" fill="#F8F4F0" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.85"/>
            <path d="M3,-11 Q8,-7 9,0 Q8,7 2,9 Q-4,8 -7,2 Q-7,-5 -3,-9 Q0,-11 3,-11Z" fill="#F5F1EC" stroke="#DDD4CC" strokeWidth="0.4"/>
            <path d="M3,-6 Q6,-3 6,1 Q5,5 2,6 Q-2,5 -4,1 Q-4,-3 -1,-5 Q1,-6 3,-6Z"   fill="#EDE7E0"/>
            <ellipse cx="2" cy="1" rx="2.5" ry="2" fill="#E0D6CE"/>
            <ellipse cx="2" cy="1" rx="1.2" ry="1" fill="#D4C8C0"/>
          </g>

          {/* Rosa grande central */}
          <g transform="translate(180, 52)" filter="url(#rosaSombra)">
            <path d="M2,-23 Q13,-17 16,-5 Q15,9 5,16 Q-5,19 -14,12 Q-19,1 -15,-12 Q-8,-22 2,-23Z" fill="#FEFEFE" stroke="#EAE0D8" strokeWidth="0.6"/>
            <path d="M-15,-8 Q-23,-12 -22,-4 Q-20,4 -14,5Z"   fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.88"/>
            <path d="M15,-2 Q23,-5 22,3 Q21,9 15,10Z"          fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.88"/>
            <path d="M2,17 Q8,21 5,26 Q0,24 -5,21 Q-3,16 2,17Z"  fill="#F8F4F0" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.85"/>
            <path d="M-12,10 Q-19,15 -17,20 Q-10,19 -8,14Z"    fill="#F8F4F0" stroke="#E4DAD0" strokeWidth="0.4" opacity="0.8"/>
            <path d="M14,10 Q21,15 19,20 Q12,19 10,14Z"         fill="#F8F4F0" stroke="#E4DAD0" strokeWidth="0.4" opacity="0.8"/>
            <path d="M2,-16 Q10,-11 12,-2 Q11,8 3,12 Q-5,13 -11,6 Q-14,-4 -9,-12 Q-4,-16 2,-16Z" fill="#FAF7F3" stroke="#E0D6CC" strokeWidth="0.5"/>
            <path d="M2,-10 Q7,-6 8,0 Q7,7 1,9 Q-5,8 -8,2 Q-7,-5 -3,-9 Q0,-10 2,-10Z" fill="#F4EEE8"/>
            <path d="M2,-5 Q5,-2 5,1 Q4,5 1,6 Q-3,5 -5,2 Q-4,-2 -1,-4 Q1,-5 2,-5Z"   fill="#ECE4DC"/>
            <ellipse cx="1.5" cy="1" rx="3.5" ry="3"   fill="#E4D8CE"/>
            <ellipse cx="1.5" cy="1" rx="2"   ry="1.7" fill="#D8CCBF"/>
            <ellipse cx="1.5" cy="1" rx="1"   ry="0.8" fill="#CABDB4"/>
          </g>

          {/* Rosa chica derecha */}
          <g transform="translate(203, 61)" filter="url(#rosaSombraChica)">
            <path d="M-2,-16 Q7,-12 10,-2 Q8,9 0,13 Q-8,14 -13,6 Q-15,-4 -10,-12 Q-6,-16 -2,-16Z" fill="#FEFEFE" stroke="#EAE0D8" strokeWidth="0.5"/>
            <path d="M10,-3 Q16,-6 15,1 Q14,6 10,7Z"       fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.9"/>
            <path d="M-13,-4 Q-19,-7 -18,0 Q-17,5 -13,6Z"  fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.88"/>
            <path d="M-1,12 Q3,16 1,19 Q-3,17 -6,14 Q-4,10 -1,12Z" fill="#F8F4F0" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.85"/>
            <path d="M-2,-10 Q5,-7 7,0 Q5,7 -1,9 Q-7,8 -10,2 Q-10,-5 -6,-9 Q-4,-10 -2,-10Z" fill="#F5F1EC" stroke="#DDD4CC" strokeWidth="0.4"/>
            <path d="M-1,-5 Q3,-3 4,1 Q3,5 0,6 Q-4,5 -6,1 Q-5,-3 -2,-5 Q-2,-5 -1,-5Z"   fill="#EDE7E0"/>
            <ellipse cx="-1" cy="1" rx="2.5" ry="2" fill="#E0D6CE"/>
            <ellipse cx="-1" cy="1" rx="1.2" ry="1" fill="#D4C8C0"/>
          </g>

          {/* Destellos */}
          <circle cx="168" cy="42" r="1.8" fill="url(#plataBrillo)" opacity="0.65"/>
          <circle cx="192" cy="42" r="1.8" fill="url(#plataBrillo)" opacity="0.65"/>
          <circle cx="176" cy="35" r="1.4" fill="url(#plataBrillo)" opacity="0.6"/>
          <circle cx="184" cy="35" r="1.4" fill="url(#plataBrillo)" opacity="0.6"/>
          <circle cx="180" cy="28" r="1.2" fill="url(#plataBrillo)" opacity="0.55"/>
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