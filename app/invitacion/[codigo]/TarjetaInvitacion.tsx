'use client'

import Link from 'next/link'
import { type Invitacion } from './types'

// ── TarjetaInvitacion.tsx ─────────────────────────────────────────────────────
// Muestra el contenido de la invitación: nombres, fecha, lugar, versículo
// y botón de confirmación.
//
// Props:
//   inv              — datos de la invitación
//   rondaActual      — ronda de confirmación activa (viene de /api/config)
//   codigo           — código único de la invitación (para el link de confirmar)

interface Props {
  inv: Invitacion
  rondaActual: number
  codigo: string
}

// ── componente ────────────────────────────────────────────────────────────────

export default function TarjetaInvitacion({ inv, rondaActual, codigo }: Props) {
  const esIndividual   = inv.invitados.length === 1
  const todosConfirm   = inv.invitados.every(i => i.confirmacion_1 === true)
  const algunoConfirm  = inv.invitados.some(i => i.confirmacion_1 === true)
  const invitado       = inv.invitados[0]
  const esF            = esIndividual && invitado?.sexo === 'F'

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .tarjeta-inner {
            background: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 2.2rem 1.4rem 2rem !important;
          }
        }
      `}</style>
      <div className="tarjeta-inner" style={{
        background: 'linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 60%, #F6F8F2 100%)',
        borderRadius: '3px',
        padding: '2.6rem 2rem 2rem',
        boxShadow: '0 12px 50px rgba(80,40,30,0.14), 0 2px 10px rgba(80,40,30,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>

      {/* Manchas de fondo */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,79,79,0.06) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '35%', height: '35%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,148,56,0.13) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '10%', width: '25%', height: '25%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,50,0.10) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Nombres */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <h1 className="script" style={{ fontSize: 'clamp(3.5rem,16vw,5rem)', color: '#2C2320', lineHeight: 0.95 }}>Carla</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', maxWidth: '240px', margin: '0.3rem auto 0.2rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,79,79,0.4))' }} />
            <span className="serif" style={{ color: '#C94F4F', fontSize: '1.2rem', fontStyle: 'italic', lineHeight: 1 }}>♡</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,79,79,0.4), transparent)' }} />
          </div>
          <h1 className="script" style={{ fontSize: 'clamp(3.5rem,16vw,5rem)', color: '#2C2320', lineHeight: 0.95 }}>Hely</h1>
          <div style={{ margin: '0.9rem auto 0', maxWidth: '220px' }}>
            <svg viewBox="0 0 280 20" fill="none" style={{ width: '100%', height: '20px', display: 'block' }}>
              <path d="M10 10 Q70 3 140 10 Q210 17 270 10" stroke="#C94F4F" strokeWidth="0.8" strokeLinecap="round"/>
              <circle cx="140" cy="10" r="2" fill="none" stroke="#D4693A" strokeWidth="0.8"/>
              <path d="M130 10 Q135 6 140 10 Q145 14 150 10" stroke="#D4693A" strokeWidth="0.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Dedicatoria al invitado */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>

          {/* Querido/a */}
          <p className="sans" style={{
            fontSize: '0.48rem', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#9A8880', marginBottom: '0.7rem',
          }}>
            {esIndividual
              ? esF ? 'Querida,' : 'Querido,'
              : inv.invitados.every(i => i.sexo === 'F') ? 'Queridas,' : 'Queridos,'
            }
          </p>

          {/* Nombre(s) en grande */}
          {esIndividual ? (
            <p className="script" style={{
              fontSize: 'clamp(2.4rem, 11vw, 3.4rem)',
              color: '#5C4A42',
              lineHeight: 1.05,
              letterSpacing: '0.01em',
            }}>
              {invitado.nombre}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {inv.invitados.map((i, idx) => (
                <p key={i.id} className="script" style={{
                  fontSize: 'clamp(2rem, 9vw, 2.8rem)',
                  color: '#5C4A42',
                  lineHeight: 1.05,
                  opacity: idx === 0 ? 1 : 0.75,
                }}>
                  {i.nombre}
                </p>
              ))}
            </div>
          )}

          {/* Línea decorativa */}
          <div style={{
            width: '80px', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,105,58,0.45), transparent)',
            margin: '0.8rem auto',
          }} />

          {/* Texto de invitación */}
          <p className="serif" style={{
            fontStyle: 'italic', fontSize: '0.92rem',
            color: '#5C4A42', lineHeight: 1.75,
          }}>
            {esIndividual
              ? 'Nos llena el corazón de alegría poder compartir contigo el día de nuestro matrimonio.'
              : 'Nos llena el corazón de alegría poder compartir con ustedes el día de nuestro matrimonio.'
            }
          </p>
        </div>

        <Separador />

        {/* Fecha y horarios */}
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <p className="sans" style={{ fontSize: '0.5rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9A8880', marginBottom: '0.5rem' }}>
            Sábado · 13 de Junio · 2026
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
            <Horario label="Ceremonia" hora="6:00 PM" />
            <div style={{ width: '1px', background: 'linear-gradient(180deg, transparent, rgba(212,168,50,0.45), transparent)' }} />
            <Horario label="Recepción" hora="7:30 PM" />
          </div>
        </div>

        <Separador />

        {/* Lugar */}
        <div style={{ textAlign: 'center', marginBottom: '1.3rem' }}>
          <p className="serif" style={{ fontSize: '1.05rem', color: '#2C2320' }}>Brisas del Renacer</p>
          <p className="serif" style={{ fontStyle: 'italic', fontSize: '0.84rem', color: '#5C4A42', lineHeight: 1.65, marginTop: '0.2rem' }}>
            A 600 metros de la entrada de Zambrano<br />
            Vía Coro–Churuguara, Falcón
          </p>
        </div>

        {/* Versículo */}
        <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
          <div style={{ width: '180px', height: '1px', background: 'linear-gradient(90deg, transparent, #D4A832 40%, #D4693A 60%, transparent)', margin: '0 auto 0.9rem', opacity: 0.4 }} />
          <p className="serif" style={{ fontStyle: 'italic', fontSize: '0.92rem', color: '#5C4A42', lineHeight: 1.65 }}>
            &ldquo;Todo lo hizo hermoso en su tiempo&rdquo;
          </p>
          <p className="sans" style={{ fontSize: '0.55rem', color: '#D4693A', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '0.3rem' }}>
            Eclesiastés 3 · 11
          </p>
        </div>

        {/* Confirmación */}
        {todosConfirm ? (
          <div style={{ textAlign: 'center' }}>
            <p className="serif" style={{ fontSize: '1rem', color: '#7A9438', fontStyle: 'italic', marginBottom: '1rem' }}>
              {esIndividual ? '¡Ya confirmaste tu asistencia!' : '¡Ya confirmaron su asistencia!'}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <Link
              href={`/confirmar/${codigo}/${rondaActual}`}
              style={{
                display: 'block', background: '#C94F4F', color: '#FDFAF6',
                borderRadius: '2px', padding: '0.88rem 2rem',
                fontFamily: "'Montserrat', sans-serif", fontSize: '0.62rem',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                textDecoration: 'none', textAlign: 'center',
              }}
            >
              Confirmar asistencia
            </Link>
            {algunoConfirm && (
              <p className="sans" style={{ fontSize: '0.6rem', color: '#9A8880' }}>
                Algunas personas ya confirmaron.
              </p>
            )}
          </div>
        )}

        {/* Bloque destacado — link al landing */}
        <BloqueVerBoda />
      </div>
      </div>
    </>
  )
}

// ── sub-componentes internos ──────────────────────────────────────────────────

function Separador() {
  return (
    <div style={{
      width: '50px', height: '1px',
      background: 'linear-gradient(90deg, transparent, #D4A832, transparent)',
      margin: '0 auto 1.2rem',
    }} />
  )
}

function BloqueVerBoda() {
  return (
    <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        marginTop: '1.4rem',
        background: 'linear-gradient(135deg, rgba(212,168,50,0.10) 0%, rgba(212,105,58,0.08) 100%)',
        border: '1px solid rgba(212,168,50,0.30)',
        borderRadius: '3px',
        padding: '1.2rem 1.4rem',
        textAlign: 'center',
        cursor: 'pointer',
      }}>
        <p className="serif" style={{
          fontStyle: 'italic', fontSize: '0.88rem',
          color: '#5C4A42', lineHeight: 1.75, marginBottom: '0.8rem',
        }}>
          Preparamos una página especial para ustedes, llena de todo lo que necesitan saber sobre nosotros y sobre este día tan importante. La hicimos con mucho amor para que puedan vivirlo con nosotros desde ya.
        </p>
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '0.55rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#D4693A',
          borderBottom: '1px solid rgba(212,105,58,0.4)',
          paddingBottom: '0.2rem',
        }}>
          Conoce nuestra historia y todos los detalles de la boda →
        </span>
      </div>
    </Link>
  )
}

function Horario({ label, hora }: { label: string; hora: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 1.3rem' }}>
      <p className="sans" style={{ fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8880', marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p className="serif" style={{ fontSize: '1.2rem', color: '#2C2320' }}>{hora}</p>
    </div>
  )
}