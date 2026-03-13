export interface Invitado {
  id: string
  nombre: string
  whatsapp: string | null
  sexo: "M" | "F" | null
  confirmacion_1: boolean | null
  confirmacion_2: boolean | null
  confirmacion_3: boolean | null
}

export interface Invitacion {
  id: string
  codigo: string
  nombre: string | null
  invitados: Invitado[]
}