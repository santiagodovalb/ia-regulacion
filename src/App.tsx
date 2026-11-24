import { useState } from 'react';
import raw from './data.json';
import Globe from './Globe';
import { APPROACH, INSTRUMENT, STATUS, statusOf, YES_NO, type Jurisdiction } from './types';

const data = raw as Jurisdiction[];
const PORTFOLIO = 'https://portfolio-santiagodoval.vercel.app/';
const REGIONS = [
  { id: 'todas', label: 'Todas' },
  { id: 'latam', label: 'América Latina' },
  { id: 'referencia', label: 'Referencias' },
] as const;
type Region = (typeof REGIONS)[number]['id'];

const fmtMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, (m || 1) - 1, 15).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
};
const fmtDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export default function App() {
  const [region, setRegion] = useState<Region>('todas');
  const [open, setOpen] = useState<string | null>(null);
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  );
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
  };

  const shown = data.filter((j) => region === 'todas' || j.region === region);
  const pending = data.filter((j) => !j.reviewed).length;
  const latest = data.map((j) => j.checked).sort().at(-1);

  // Clicking a country on the ladder opens its row below.
  const focus = (id: string) => {
    setRegion('todas');
    setOpen(id);
    requestAnimationFrame(() => document.getElementById(`j-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <main>
      <header>
        <div className="topbar">
          <a className="byline" href={PORTFOLIO} target="_blank" rel="noopener">
            <img src="/avatar.png" alt="" width={40} height={40} />
            <span>
              <span className="by-label">Un proyecto de</span>
              <span className="by-name">
                Santiago Doval <span className="by-link">Ver portfolio ↗</span>
              </span>
            </span>
          </a>
          <button type="button" className="theme" onClick={toggleTheme} aria-label="Cambiar modo claro u oscuro">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
        <div className="hero">
          <div>
            <h1>IA y el Estado</h1>
            <p className="lead">
              Cómo están regulando la inteligencia artificial los países de América Latina, comparados con la Unión
              Europea, Estados Unidos y China.
            </p>
          </div>
          <Globe data={data} onSelect={focus} />
        </div>
      </header>

      <section aria-labelledby="ladder-title">
        <h2 id="ladder-title" className="kicker">
          Qué tan vinculante es la regulación
        </h2>
        <p className="scale" aria-hidden="true">
          <span>Menos vinculante</span>
          <span className="scale-bar" style={{ background: `linear-gradient(90deg, ${STATUS.map((s) => s.color).join(', ')})` }} />
          <span>Más vinculante</span>
        </p>
        <div className="ladder">
          {STATUS.map((s) => {
            const here = data.filter((j) => j.status === s.id);
            return (
              <div className="rung" key={s.id}>
                <div className="rung-head">
                  <span className="swatch" style={{ background: s.color }} aria-hidden="true" />
                  <strong>{s.label}</strong>
                  <small>{s.hint}</small>
                </div>
                <ul>
                  {here.map((j) => (
                    <li key={j.id}>
                      <button type="button" className="pill" onClick={() => focus(j.id)}>
                        {j.name}
                      </button>
                    </li>
                  ))}
                  {here.length === 0 && <li className="empty">—</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="compare-title">
        <div className="compare-head">
          <h2 id="compare-title" className="kicker">
            País por país
          </h2>
          <div className="filter" role="group" aria-label="Región">
            {REGIONS.map((r) => (
              <button key={r.id} type="button" aria-pressed={region === r.id} onClick={() => setRegion(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="rows">
          <li className="rows-head" aria-hidden="true">
            <span />
            <span>País</span>
            <span>Estado</span>
            <span>Enfoque</span>
          </li>
          {shown.map((j) => {
            const isOpen = open === j.id;
            return (
              <li key={j.id} id={`j-${j.id}`} className={isOpen ? 'open' : ''}>
                <button type="button" className="row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : j.id)}>
                  <span className="swatch" style={{ background: statusOf(j.status).color }} aria-hidden="true" />
                  <span className="row-name">{j.name}</span>
                  <span className="row-status">{statusOf(j.status).label}</span>
                  <span className="row-approach">{APPROACH[j.approach]}</span>
                </button>
                {isOpen && (
                  <div className="detail">
                    <p className="summary">{j.summary}</p>
                    <dl className="facts">
                      <div>
                        <dt>Enfoque</dt>
                        <dd>{APPROACH[j.approach]}</dd>
                      </div>
                      <div>
                        <dt>Usos prohibidos</dt>
                        <dd className={j.prohibitions}>{YES_NO[j.prohibitions]}</dd>
                      </div>
                      <div>
                        <dt>Reglas para IA generativa</dt>
                        <dd className={j.genai}>{YES_NO[j.genai]}</dd>
                      </div>
                      <div className="wide">
                        <dt>Autoridad</dt>
                        <dd>{j.authority ?? 'Sin autoridad específica'}</dd>
                      </div>
                    </dl>
                    <h3>Instrumentos</h3>
                    <ul className="instruments">
                      {j.instruments.map((ins) => (
                        <li key={ins.name}>
                          <span className="ins-type">{INSTRUMENT[ins.type]}</span>
                          <a href={ins.url} target="_blank" rel="noreferrer">
                            {ins.name} ↗
                          </a>
                          <span className="ins-meta">
                            {fmtMonth(ins.date)} · {ins.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {j.uncertain.length > 0 && (
                      <>
                        <h3>A confirmar</h3>
                        <ul className="uncertain">
                          {j.uncertain.map((u) => (
                            <li key={u}>{u}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="sources">
                      Fuentes:{' '}
                      {j.sources.map((s, i) => (
                        <span key={s}>
                          {i > 0 && ' · '}
                          <a href={s} target="_blank" rel="noreferrer">
                            {host(s)}
                          </a>
                        </span>
                      ))}
                      . Revisado el {fmtDay(j.checked)}.
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer>
        <p>
          <strong>Método.</strong> Cada país se ubica según su instrumento más vinculante sobre IA en general (no las
          normas sectoriales). El enfoque es el del instrumento principal o del proyecto más avanzado. “Propuesto” indica
          que la medida figura en un proyecto, no en una norma vigente.
        </p>
        {pending > 0 && (
          <p>
            Borrador: {pending} de {data.length} fichas están pendientes de revisión contra sus fuentes.
          </p>
        )}
        {latest && <p>Última revisión: {fmtDay(latest)}.</p>}
      </footer>
    </main>
  );
}
