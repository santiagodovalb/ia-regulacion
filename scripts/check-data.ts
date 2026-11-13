// Validates src/data.json after hand edits. Run: npm run check
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data.json', import.meta.url), 'utf8'));

const STATUS = ['sin-ley', 'proyectos', 'proyecto-avanzado', 'ley-aprobada', 'ley-vigente'];
const APPROACH = ['riesgos', 'principios', 'sectorial', 'pro-innovacion', 'control-estatal'];
const YES_NO = ['si', 'propuesto', 'no'];
const TYPES = ['ley', 'proyecto', 'decreto', 'estrategia', 'guia'];

const errors: string[] = [];
const ids = new Set<string>();
const isUrl = (u: unknown) => typeof u === 'string' && /^https?:\/\/\S+$/.test(u);
const oneOf = (v: unknown, allowed: string[], where: string) => {
  if (!allowed.includes(v as string)) errors.push(`${where}: "${v}" is not one of ${allowed.join(', ')}`);
};

for (const j of data) {
  const at = j.id ?? '(no id)';
  if (!j.id || ids.has(j.id)) errors.push(`${at}: missing or duplicate id`);
  ids.add(j.id);
  for (const f of ['name', 'summary', 'checked']) if (!j[f]) errors.push(`${at}: missing ${f}`);
  oneOf(j.region, ['latam', 'referencia'], `${at}.region`);
  oneOf(j.status, STATUS, `${at}.status`);
  oneOf(j.approach, APPROACH, `${at}.approach`);
  oneOf(j.prohibitions, YES_NO, `${at}.prohibitions`);
  oneOf(j.genai, YES_NO, `${at}.genai`);
  if (typeof j.reviewed !== 'boolean') errors.push(`${at}: reviewed must be true or false`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(j.checked ?? '')) errors.push(`${at}: checked must be YYYY-MM-DD`);
  if (!Array.isArray(j.instruments) || j.instruments.length === 0) errors.push(`${at}: needs at least one instrument`);
  for (const ins of j.instruments ?? []) {
    oneOf(ins.type, TYPES, `${at}.instruments["${ins.name}"].type`);
    if (!/^\d{4}-\d{2}$/.test(ins.date ?? '')) errors.push(`${at}: instrument "${ins.name}" date must be YYYY-MM`);
    if (!isUrl(ins.url)) errors.push(`${at}: instrument "${ins.name}" needs a source URL`);
  }
  if (!Array.isArray(j.sources) || j.sources.length === 0) errors.push(`${at}: needs at least one source`);
  for (const s of j.sources ?? []) if (!isUrl(s)) errors.push(`${at}: bad source URL ${s}`);
  if (!Array.isArray(j.uncertain)) errors.push(`${at}: uncertain must be a list (can be empty)`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`data ok: ${data.length} jurisdictions, ${data.filter((j: { reviewed: boolean }) => !j.reviewed).length} pending review`);
