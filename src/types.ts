// One entry per jurisdiction in src/data.json. Edit the JSON to update the site.

export type Status = 'sin-ley' | 'proyectos' | 'proyecto-avanzado' | 'ley-aprobada' | 'ley-vigente';
export type Approach = 'riesgos' | 'principios' | 'sectorial' | 'pro-innovacion' | 'control-estatal';
export type YesNo = 'si' | 'propuesto' | 'no';

export type Instrument = {
  name: string;
  type: 'ley' | 'proyecto' | 'decreto' | 'estrategia' | 'guia';
  date: string; // YYYY-MM
  status: string;
  url: string;
};

export type Jurisdiction = {
  id: string;
  name: string;
  region: 'latam' | 'referencia';
  status: Status;
  approach: Approach;
  prohibitions: YesNo;
  genai: YesNo;
  authority: string | null;
  instruments: Instrument[];
  summary: string;
  sources: string[];
  uncertain: string[];
  /** Date the entry was last checked against its sources (YYYY-MM-DD). */
  checked: string;
  /** Set to true once Santiago has verified the entry; until then the site marks it as pending review. */
  reviewed: boolean;
};

// Ordered from least to most binding: the ladder reads left to right.
// One color per level, yellow → red, shared by the globe, the ladder and the rows.
export const STATUS: { id: Status; label: string; hint: string; color: string }[] = [
  { id: 'sin-ley', label: 'Sin ley específica', hint: 'Estrategias, guías o normas sectoriales', color: '#f2d27a' },
  { id: 'proyectos', label: 'Proyectos de ley', hint: 'Ninguno aprobado por una cámara', color: '#efab58' },
  { id: 'proyecto-avanzado', label: 'Media sanción', hint: 'Un proyecto general aprobado por una cámara', color: '#e6823f' },
  { id: 'ley-aprobada', label: 'Ley aprobada', hint: 'Sancionada, todavía no vigente', color: '#d2552e' },
  { id: 'ley-vigente', label: 'Ley vigente', hint: 'Una ley general de IA en vigor', color: '#ad3420' },
];

export const statusOf = (s: Status) => STATUS.find((x) => x.id === s)!;

export const APPROACH: Record<Approach, string> = {
  riesgos: 'Basado en riesgos',
  principios: 'Principios y guías',
  sectorial: 'Sectorial',
  'pro-innovacion': 'Pro-innovación',
  'control-estatal': 'Control estatal',
};

export const YES_NO: Record<YesNo, string> = { si: 'Sí', propuesto: 'Propuesto', no: 'No' };

export const INSTRUMENT: Record<Instrument['type'], string> = {
  ley: 'Ley',
  proyecto: 'Proyecto',
  decreto: 'Decreto / orden',
  estrategia: 'Estrategia',
  guia: 'Guía',
};
