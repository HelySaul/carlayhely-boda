export interface Invitado {
  id: string
  nombre: string
  whatsapp: string | null
  sexo: "M" | "F" | null
  confirmacion_1: boolean
  confirmacion_2: boolean
  confirmacion_3: boolean
}

export interface Invitacion {
  id: string
  codigo: string
  nombre: string | null
  invitados: Invitado[]
}