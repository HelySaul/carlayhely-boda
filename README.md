=========================================
  SITIO WEB DE BODA — CARLA & HELY
  carlayhely.com
=========================================

Novios:   Carla Victoria Nava Sánchez
          & Hely Saul Oberto Reyes
Fecha:    Sábado 13 de Junio de 2026, 6:00 PM
Lugar:    Brisas del Renacer
          A 600 metros de la entrada, vía Coro–Churuguara, Falcón


-----------------------------------------
  STACK TECNOLÓGICO
-----------------------------------------

  Framework:    Next.js 14 (App Router) + TypeScript
  Estilos:      Tailwind CSS + Variables CSS globales
  Animaciones:  CSS puro + IntersectionObserver (sin librerías externas)
  Fuentes:      Pinyon Script · Cormorant Garamond · Montserrat 300
  Backend RSVP: Google Sheets + Google Apps Script (pendiente)
  Deploy:       Vercel (free tier)


-----------------------------------------
  ESTRUCTURA DEL PROYECTO
-----------------------------------------

  app/
    globals.css         → Paleta de colores, variables CSS, fuentes
    layout.tsx          → Preconnect Google Fonts, metadata
    page.tsx            → Página principal (Loader + secciones + BibleVerse)

  components/
    Loader.tsx          → Pantalla de carga (espera fuentes + 2.2s mínimo)
    Navbar.tsx          → Navegación fija con drawer mobile
    Hero.tsx            → Sección principal con countdown
    BibleVerse.tsx      → Separador de versículos entre secciones
    Reveal.tsx          → Componente de animación scroll (IntersectionObserver)
    OurStory.tsx        → Nuestra historia (timeline)
    Schedule.tsx        → Programa del día (ceremonia + recepción)
    Venue.tsx           → El lugar (mapa + tips)
    Palette.tsx         → Dress code
    Etiquette.tsx       → Detalles / consideraciones (numeración romana)
    DriveSection.tsx    → Álbum compartido de fotos
    Footer.tsx          → Pie de página con versículo central


-----------------------------------------
  URLS PLANEADAS
-----------------------------------------

  /                       → Landing principal ✅
  /invitacion/[codigo]    → Invitación personalizada con OG para WhatsApp (pendiente)
  /admin                  → Panel de administración protegido con password (pendiente)
  /gracias                → Página post-boda con Drive compartido + QR (pendiente)


-----------------------------------------
  CÓMO CORRER LOCALMENTE
-----------------------------------------

  cd carlayhely
  npm install
  npm run dev

  Abre: http://localhost:3000


-----------------------------------------
  CÓMO DEPLOYAR EN VERCEL
-----------------------------------------

  1. Sube el proyecto a un repositorio en GitHub
  2. Entra a vercel.com e importa el repositorio
  3. Vercel detecta Next.js automáticamente — sin configuración extra
  4. Cada push a main hace deploy automático


-----------------------------------------
  PALETA DE COLORES
-----------------------------------------

  --red:          #C94F4F   (rojo coral)
  --terracotta:   #D4693A   (naranja terracota)
  --gold:         #D4A832   (amarillo dorado)
  --olive:        #7A9438   (verde oliva)
  --lavender:     #9B8BB4   (lavanda)
  --periwinkle:   #7A8FBC   (azul periwinkle)
  --cream:        #FDFAF6   (fondo principal)


-----------------------------------------
  VERSÍCULO CENTRAL
-----------------------------------------

  "Todo lo hizo hermoso en su tiempo"
  — Eclesiastés 3:11


-----------------------------------------
  PENDIENTE / PRÓXIMOS PASOS
-----------------------------------------

  [ ] Panel Admin (gestión de invitados y confirmaciones)
  [ ] /invitacion/[codigo] con OG dinámico para WhatsApp
  [ ] /gracias con Drive compartido + QR
  [ ] Integración Google Sheets + Apps Script para RSVP
  [ ] Flujo RSVP de 3 rondas con captura de WhatsApp
  [ ] Mapa real de Brisas del Renacer en sección Venue
  [ ] Enlace real del álbum de fotos (disponible el día de la boda)
  [ ] Foto de los novios en sección Nuestra Historia


=========================================
  Hecho con amor, para los que más queremos
=========================================