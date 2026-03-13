'use client'

import { useEffect, useRef, useCallback } from 'react'

// ── ExplosionFlores.tsx ───────────────────────────────────────────────────────
// Animación canvas optimizada para mobile:
// flores explotan desde el centro, llenan la pantalla y vuelan hacia afuera.
//
// Optimizaciones mobile:
//   - Sin gradientes en loops (operación más cara en canvas mobile)
//   - Cantidad adaptativa de flores según viewport
//   - Duración más corta en mobile (3.2s vs 4.8s desktop)
//   - Formas simples (círculos/elipses) en lugar de paths complejos

// ── Paleta — mismos tonos del Hero pero muy pastel ────────────────────────────
// El Hero usa rgba(201,79,79,0.22), rgba(212,105,58,0.10), etc.
// Aquí convertimos esos valores a colores sólidos equivalentes sobre #FDFAF6

type Palette = { a: string; b: string; c: string; k: string }
type FlowerType = 0 | 1 | 2 | 3

const PALS: Palette[] = [
  // terracotta — var(--terracotta) #D4693A sobre crema
  { a: '#EDD5C5', b: '#DEB89A', c: '#C9956A', k: '#F8EDE5' },
  // red/blush — var(--red) #C94F4F sobre crema
  { a: '#EDD0C8', b: '#DEADA3', c: '#C98A80', k: '#F8EEEC' },
  // gold — var(--gold) #D4A832 sobre crema
  { a: '#F0E5C0', b: '#E4CE88', c: '#D4B055', k: '#FAF4DC' },
  // olive — var(--olive) #7A9438 sobre crema
  { a: '#D8E8BE', b: '#BECF94', c: '#9AB06A', k: '#EEF5E4' },
  // lavender — var(--lavender) #9B8BB4 sobre crema
  { a: '#E4DCF0', b: '#CABFE0', c: '#AA99C8', k: '#F4F0FA' },
  // periwinkle — var(--periwinkle) #7A8FBC sobre crema
  { a: '#D4DCED', b: '#ADBBD8', c: '#8499C0', k: '#EEF2FA' },
  // melocotón — mezcla terracotta+gold
  { a: '#F0DEC8', b: '#E0C4A0', c: '#CCAA78', k: '#FAF2E8' },
]

// ── helpers ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar,ag,ab] = hexToRgb(a)
  const [br,bg,bb] = hexToRgb(b)
  const r = Math.round(ar+(br-ar)*t)
  const g = Math.round(ag+(bg-ag)*t)
  const bv= Math.round(ab+(bb-ab)*t)
  return `rgb(${r},${g},${bv})`
}

// ── dibujadores — sin gradientes, solo fills sólidos ─────────────────────────

function drawRosa(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, R: number,
  pal: Palette, rot: number, isMobile: boolean
) {
  const layers = isMobile ? 3 : 4
  for (let l = layers; l >= 0; l--) {
    const lr = R * (0.35 + l * 0.13)
    const nP = 4 + l
    const a0 = rot + l * 0.5
    ctx.fillStyle = lerpHex(pal.a, pal.c, 1 - l / layers) + 'DD'
    for (let i = 0; i < nP; i++) {
      const a = a0 + (i / nP) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(x + Math.cos(a) * lr * 0.4, y + Math.sin(a) * lr * 0.4, lr * 0.38, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.fillStyle = pal.k
  ctx.beginPath(); ctx.arc(x, y, R * 0.15, 0, Math.PI * 2); ctx.fill()
}

function drawSimple(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, R: number,
  pal: Palette, rot: number
) {
  ctx.fillStyle = pal.a + 'CC'
  for (let i = 0; i < 5; i++) {
    const a = rot + (i / 5) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(x + Math.cos(a) * R * 0.45, y + Math.sin(a) * R * 0.45, R * 0.42, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = pal.k
  ctx.beginPath(); ctx.arc(x, y, R * 0.16, 0, Math.PI * 2); ctx.fill()
}

function drawGirasol(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, R: number,
  pal: Palette, rot: number, isMobile: boolean
) {
  const nP = isMobile ? 9 : 12
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
  ctx.fillStyle = pal.a + 'BB'
  for (let i = 0; i < nP; i++) {
    const a = (i / nP) * Math.PI * 2
    ctx.save(); ctx.rotate(a)
    ctx.beginPath(); ctx.ellipse(0, -R * 0.65, R * 0.13, R * 0.35, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = pal.b
  ctx.beginPath(); ctx.arc(0, 0, R * 0.30, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = pal.c + '88'
  ctx.beginPath(); ctx.arc(0, 0, R * 0.16, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawCrisantemo(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, R: number,
  pal: Palette, rot: number, isMobile: boolean
) {
  const rings = isMobile
    ? [{ n: 7, r: 0.85, pw: 0.11, pl: 0.42 }]
    : [{ n: 7, r: 0.85, pw: 0.11, pl: 0.42 }, { n: 10, r: 0.62, pw: 0.09, pl: 0.32 }]
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
  ctx.fillStyle = pal.a + 'CC'
  for (const ring of rings) {
    for (let i = 0; i < ring.n; i++) {
      const a = (i / ring.n) * Math.PI * 2
      ctx.save(); ctx.rotate(a)
      ctx.beginPath()
      ctx.ellipse(0, -R * ring.r * 0.5, R * ring.pw, R * ring.pl, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
  ctx.fillStyle = pal.k
  ctx.beginPath(); ctx.arc(0, 0, R * 0.14, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number, pal: Palette,
  bloom: number, opacity: number,
  rot: number, type: FlowerType,
  isMobile: boolean
) {
  if (opacity < 0.01 || bloom < 0.01) return
  const R = r * bloom
  ctx.globalAlpha = opacity
  if      (type === 0) drawRosa(ctx, x, y, R, pal, rot, isMobile)
  else if (type === 1) drawSimple(ctx, x, y, R, pal, rot)
  else if (type === 2) drawGirasol(ctx, x, y, R, pal, rot, isMobile)
  else                 drawCrisantemo(ctx, x, y, R, pal, rot, isMobile)
  ctx.globalAlpha = 1
}

// ── easings ───────────────────────────────────────────────────────────────────

const eOut  = (t: number) => 1 - Math.pow(1 - t, 3)
const eOut2 = (t: number) => 1 - Math.pow(1 - t, 2)
const eIn   = (t: number) => t * t

// ── tipos internos ────────────────────────────────────────────────────────────

interface Flower {
  cx: number; cy: number
  tx: number; ty: number
  ex: number; ey: number
  r: number; pal: Palette; rot: number; type: FlowerType
  delay: number
}

// ── componente ────────────────────────────────────────────────────────────────

interface Props {
  triggerRef: React.MutableRefObject<(() => void) | null>
  onExitStart?: () => void  // se llama cuando las flores empiezan a salir (t=EXIT_START)
  onComplete: () => void
}

export default function ExplosionFlores({ triggerRef, onExitStart, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number | null>(null)

  const spawn = useCallback((W: number, H: number, isMobile: boolean): Flower[] => {
    const flowers: Flower[] = []
    const cx = W / 2, cy = H / 2, diag = Math.hypot(W, H)

    // Grilla más espaciada en mobile → menos flores → más FPS
    const step       = isMobile ? 72 : 54
    const extraCenter = isMobile ? 30 : 70
    const cols = Math.ceil(W / step) + 2
    const rows = Math.ceil(H / step) + 2

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tx = (col - 0.5) * step + (row % 2 === 0 ? 0 : step * 0.5) + (Math.random() - 0.5) * 18
        const ty = (row - 0.5) * step + (Math.random() - 0.5) * 18
        const pal  = PALS[Math.floor(Math.random() * PALS.length)]
        const type = Math.floor(Math.random() * 4) as FlowerType
        const dx = tx - cx, dy = ty - cy, dist = Math.hypot(dx, dy)
        const outAngle = Math.atan2(dy, dx)
        flowers.push({
          cx, cy, tx, ty,
          ex: cx + Math.cos(outAngle) * diag * 0.92,
          ey: cy + Math.sin(outAngle) * diag * 0.92,
          r:  dist < diag * 0.15 ? 32 + Math.random() * 22 : 20 + Math.random() * 30,
          pal, rot: Math.random() * Math.PI * 2, type,
          delay: Math.min(dist / diag, 1) * 0.17 + Math.random() * 0.04,
        })
      }
    }

    // Extra flores en el centro — cero espacios en blanco
    for (let i = 0; i < extraCenter; i++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.random() * diag * 0.2
      const tx = cx + Math.cos(a) * d, ty = cy + Math.sin(a) * d
      const outAngle = Math.atan2(ty - cy, tx - cx)
      flowers.push({
        cx, cy, tx, ty,
        ex: cx + Math.cos(outAngle) * diag * 0.92,
        ey: cy + Math.sin(outAngle) * diag * 0.92,
        r: 26 + Math.random() * 24,
        pal:  PALS[Math.floor(Math.random() * PALS.length)],
        rot:  Math.random() * Math.PI * 2,
        type: Math.floor(Math.random() * 4) as FlowerType,
        delay: Math.random() * 0.03,
      })
    }

    return flowers
  }, [])

  const trigger = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const W = canvas.width, H = canvas.height
    const isMobile = W < 768
    const flowers  = spawn(W, H, isMobile)

    // Más rápido en mobile para evitar lag prolongado
    const DUR = isMobile ? 3200 : 4800
    const t0  = performance.now()
    const FILL_END   = 0.55
    const EXIT_START = 0.68

    if (animRef.current) cancelAnimationFrame(animRef.current)
    let exitStartFired = false

    function tick(now: number) {
      const t = Math.min((now - t0) / DUR, 1)
      ctx!.clearRect(0, 0, W, H)

      // Disparar onExitStart cuando las flores empiezan a salir
      if (!exitStartFired && t >= EXIT_START) {
        exitStartFired = true
        onExitStart?.()
      }

      for (const f of flowers) {
        const ft = Math.max(0, (t - f.delay) / (1 - f.delay))
        if (ft <= 0) continue

        let px: number, py: number
        if (t <= FILL_END) {
          const p = eOut(Math.min(ft / FILL_END, 1))
          px = f.cx + (f.tx - f.cx) * p
          py = f.cy + (f.ty - f.cy) * p
        } else if (t <= EXIT_START) {
          px = f.tx; py = f.ty
        } else {
          const p = eIn((t - EXIT_START) / (1 - EXIT_START))
          px = f.tx + (f.ex - f.tx) * p
          py = f.ty + (f.ey - f.ty) * p
        }

        const op    = ft < 0.08 ? ft / 0.08 : 1
        const bloom = eOut2(Math.min(ft / 0.25, 1))
        drawFlower(ctx!, px, py, f.r, f.pal, bloom, op, f.rot, f.type, isMobile)
      }

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        ctx!.clearRect(0, 0, W, H)
        onComplete()
      }
    }

    animRef.current = requestAnimationFrame(tick)
  }, [spawn, onExitStart, onComplete])

  useEffect(() => {
    triggerRef.current = trigger
    return () => { triggerRef.current = null }
  }, [trigger, triggerRef])

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 60, pointerEvents: 'none',
      }}
    />
  )
}