// ── types.ts ──────────────────────────────────────────────────────────────────

export interface Invitado {
  id: string; invitacion_id: string; nombre: string; whatsapp: string | null; sexo: "M" | "F" | null;
  confirmacion_1: boolean; confirmacion_1_fecha: string | null;
  confirmacion_2: boolean; confirmacion_2_fecha: string | null;
  confirmacion_3: boolean; confirmacion_3_fecha: string | null;
  asistio: boolean;
}

export interface Invitacion {
  id: string; codigo: string; nombre: string | null;
  creado_por: string | null; created_at: string; invitados: Invitado[];
}

export type SortKey    = "nombre" | "codigo" | "creado_por" | "cantidad" | "fecha" | "confirmados";
export type SortDir    = "asc" | "desc";
export type TipoFiltro = "todos" | "grupo" | "individual";
export type ConfFiltro = "todos" | "conf1" | "conf2" | "conf3" | "ninguna";

export interface FiltrosState {
  search: string; setSearch: (v: string) => void;
  sortKey: SortKey; setSortKey: (v: SortKey) => void;
  sortDir: SortDir; setSortDir: (v: SortDir) => void;
  tipo: TipoFiltro; setTipo: (v: TipoFiltro) => void;
  confFiltro: ConfFiltro; setConfFiltro: (v: ConfFiltro) => void;
  creadores: string[]; creadoPor: string; setCreadoPor: (v: string) => void;
}