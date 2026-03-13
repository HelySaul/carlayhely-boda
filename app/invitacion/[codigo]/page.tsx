'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

import Sobre             from './Sobre'
import ExplosionFlores   from './ExplosionFlores'
import TarjetaInvitacion from './TarjetaInvitacion'
import { type Invitacion, type Invitado } from './types'

// ── page.tsx ──────────────────────────────────────────────────────────────────
// Orquesta las 4 fases de la invitación:
//   sobre → floreciendo → abierto → gracias

type Fase = 'sobre' | 'floreciendo' | 'abierto' | 'gracias'

// Tulipanes decorativos de fondo (solo aquí, no en sub-componentes)
function TulipSVG({ size, petalColor, petalColor2, rotate = 0 }: {
  size: number; petalColor: string; petalColor2?: string; rotate?: number
}) {
  const c2 = petalColor2 || petalColor
  return (
    <svg width={size * 0.55} height={size} viewBox="0 0 44 80" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, display: 'block', overflow: 'visible' }}>
      <path d="M22 78 Q21 58 22 44" stroke="#7A9438" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M21 62 Q10 52 12 42 Q18 54 21 58Z" fill="#7A9438" opacity="0.55"/>
      <path d="M23 56 Q34 46 32 36 Q26 48 23 52Z" fill="#7A9438" opacity="0.45"/>
      <path d="M22 44 Q10 40 8 26 Q10 14 16 10 Q18 22 22 30Z" fill={petalColor} opacity="0.80"/>
      <path d="M22 44 Q34 40 36 26 Q34 14 28 10 Q26 22 22 30Z" fill={c2}        opacity="0.75"/>
      <path d="M22 44 Q16 34 16 20 Q18 8 22 6 Q26 8 28 20 Q28 34 22 44Z"        fill={petalColor} opacity="0.70"/>
      <path d="M20 16 Q21 12 22 10 Q22 16 21 22Z" fill="white" opacity="0.18"/>
    </svg>
  )
}

export default function PaginaInvitacion() {
  const { codigo }  = useParams<{ codigo: string }>()
  const router      = useRouter()

  const [inv,          setInv]          = useState<Invitacion | null>(null)
  const [error,        setError]        = useState('')
  const [fase,         setFase]         = useState<Fase>('sobre')
  const [rondaActual,  setRondaActual]  = useState(1)

  // Ref que ExplosionFlores expone para disparar la animación
  const explosionRef = useRef<(() => void) | null>(null)

  // ── Carga de datos ──────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`/api/invitacion?codigo=${codigo}`).then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
    ]).then(([d, cfg]) => {
      if (d.error) { setError(d.error); return }
      setInv(d)
      setRondaActual(cfg.ronda ?? 1)
    }).catch(() => setError('No pudimos cargar tu invitación.'))
  }, [codigo])

  // ── Handlers ────────────────────────────────────────────────────────────────

  function abrirSobre() {
    setFase('floreciendo')
    explosionRef.current?.()
  }

  // Cuando las flores empiezan a salir → mostrar tarjeta (sincronizado)
  const handleExitStart = useCallback(() => {
    setFase('abierto')
  }, [])

  // onComplete ya no necesita hacer nada con la fase
  const handleExplosionComplete = useCallback(() => {}, [])

  function handleGracias() {
    setFase('gracias')
    setTimeout(() => router.push('/'), 3500)
  }

  // ── Estados de carga / error ────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: '100svh', background: '#FDFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <p style={{ fontFamily: "'Montserrat',sans-serif", color: '#9B8BB4', textAlign: 'center' }}>{error}</p>
    </div>
  )

  if (!inv) return (
    <div style={{ minHeight: '100svh', background: '#FDFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '2px solid #C94F4F', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const esIndividual = inv.invitados.length === 1

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100svh',
      background: 'linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 50%, #F6F8F2 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Montserrat', sans-serif",
      position: 'relative',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        @font-face { font-family: 'PinyonScript'; src: url('/fonts/PinyonScript-Regular.ttf'); }
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes tarjetaAparece {
          0%   { opacity:0; transform: scale(0.88); }
          60%  { opacity:1; transform: scale(1.02); }
          100% { opacity:1; transform: scale(1); }
        }
        @keyframes graciasFade { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
        @keyframes sobreFlota  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-5px)} }
        @keyframes pulso       { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
        .tarjeta-entra { animation: tarjetaAparece 0.85s cubic-bezier(0.22,1,0.36,1) forwards; }
        .gracias-entra { animation: graciasFade 0.6s ease forwards; }
        @media (max-width: 767px) {
          .tarjeta-wrap {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100svh !important;
            overflow-y: auto !important;
            z-index: 60 !important;
            background: #FDFAF6 !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Canvas de explosión — siempre montado, invisible hasta el trigger */}
      <ExplosionFlores
        triggerRef={explosionRef}
        onExitStart={handleExitStart}
        onComplete={handleExplosionComplete}
      />

      {/* Manchas de fondo */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '0', width: 'clamp(220px,55vw,420px)', height: 'clamp(220px,55vw,420px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,79,79,0.32) 0%, rgba(212,105,58,0.14) 50%, transparent 75%)' }} />
        <div style={{ position: 'absolute', bottom: '0%', left: '0', width: 'clamp(180px,45vw,340px)', height: 'clamp(180px,45vw,340px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,148,56,0.30) 0%, rgba(122,148,56,0.10) 55%, transparent 75%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '5%', width: 'clamp(80px,18vw,140px)', height: 'clamp(80px,18vw,140px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,50,0.22) 0%, transparent 70%)' }} />
      </div>

      {/* Tulipanes decorativos */}
      <div style={{ position: 'absolute', left: 0,  bottom: 0, pointerEvents: 'none', opacity: 0.28, zIndex: 0 }}>
        <TulipSVG size={130} petalColor="#C94F4F" petalColor2="#D4693A" rotate={8}/>
      </div>
      <div style={{ position: 'absolute', left: 22, bottom: 0, pointerEvents: 'none', opacity: 0.18, zIndex: 0 }}>
        <TulipSVG size={90}  petalColor="#D4A832" petalColor2="#C94F4F" rotate={-4}/>
      </div>
      <div style={{ position: 'absolute', right: 0,  top: 0, pointerEvents: 'none', opacity: 0.22, zIndex: 0, transform: 'scaleX(-1)' }}>
        <TulipSVG size={110} petalColor="#9B8BB4" petalColor2="#D4A832" rotate={-10}/>
      </div>
      <div style={{ position: 'absolute', right: 20, top: 0, pointerEvents: 'none', opacity: 0.15, zIndex: 0, transform: 'scaleX(-1)' }}>
        <TulipSVG size={75}  petalColor="#D4693A" petalColor2="#9B8BB4" rotate={-18}/>
      </div>

      {/* ── FASE: SOBRE ─────────────────────────────────────────────────────── */}
      {fase === 'sobre' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Sobre onAbrir={abrirSobre} />
        </div>
      )}

      {/* ── FASE: FLORECIENDO ───────────────────────────────────────────────── */}
      {/* El canvas ya está activo — esta fase solo oculta el sobre */}

      {/* ── FASE: ABIERTO ───────────────────────────────────────────────────── */}
      {fase === 'abierto' && (
        <div className="tarjeta-entra tarjeta-wrap" style={{
          // Desktop: tarjeta centrada con ancho limitado
          width: 'min(420px, 95vw)',
          position: 'relative',
          zIndex: 60,
          paddingBottom: '2rem',
        }}>
          <TarjetaInvitacion
            inv={inv}
            rondaActual={rondaActual}
            codigo={codigo}
          />
        </div>
      )}

      {/* ── FASE: GRACIAS ───────────────────────────────────────────────────── */}
      {fase === 'gracias' && (
        <div className="gracias-entra" style={{ textAlign: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'PinyonScript', serif", fontSize: '3.5rem', color: '#C94F4F', marginBottom: '1rem' }}>
            Gracias
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#5A4535', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            {esIndividual
              ? `Tu respuesta nos llena de alegría, ${inv.invitados[0].nombre.split(' ')[0]}.`
              : 'Su respuesta nos llena de alegría.'}
          </p>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B5A090' }}>
            Redirigiendo...
          </p>
        </div>
      )}
    </div>
  )
}