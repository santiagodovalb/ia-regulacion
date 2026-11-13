import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { useEffect, useMemo, useRef, useState } from 'react';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { statusOf, type Jurisdiction } from './types';

// world-atlas identifies countries by ISO 3166-1 numeric code.
const EU_MEMBERS = [
  '040', '056', '100', '191', '196', '203', '208', '233', '246', '250', '276', '300', '348', '372',
  '380', '428', '440', '442', '470', '528', '616', '620', '642', '703', '705', '724', '752',
]; // ponytail: Malta (470) is too small to exist at this map scale; harmless to list.
const COUNTRY_TO_ENTRY: Record<string, string> = {
  '032': 'argentina',
  '076': 'brasil',
  '152': 'chile',
  '484': 'mexico',
  '170': 'colombia',
  '858': 'uruguay',
  '840': 'eeuu',
  '156': 'china',
  ...Object.fromEntries(EU_MEMBERS.map((c) => [c, 'ue'])),
};

const SIZE = 520;
const START: [number, number] = [62, 12]; // centred on South America
const SPIN = 0.005; // degrees per millisecond
const DRAG = 0.28; // degrees per pixel dragged

const countries = feature(world as unknown as Topology, (world as unknown as Topology).objects.countries as GeometryCollection).features;
const graticule = geoGraticule10();
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

type Props = { data: Jurisdiction[]; onSelect: (id: string) => void };

export default function Globe({ data, onSelect }: Props) {
  const byId = useMemo(() => new Map(data.map((j) => [j.id, j])), [data]);
  const [rotation, setRotation] = useState(START);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  // Spins until the viewer interacts: pauses while the pointer is over it, stops for good after a drag.
  const [spinning, setSpinning] = useState(() => !reducedMotion());
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; y: number; start: [number, number]; moved: boolean; target: string | null } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spinning || paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      setRotation(([l, p]) => [l + (now - last) * SPIN, p]);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinning, paused]);

  const path = useMemo(() => {
    const projection = geoOrthographic()
      .scale(SIZE / 2 - 6)
      .translate([SIZE / 2, SIZE / 2])
      .rotate(rotation);
    return geoPath(projection);
  }, [rotation]);

  const entryAt = (el: EventTarget | null) => (el instanceof Element ? el.closest<SVGPathElement>('path[data-entry]')?.dataset.entry ?? null : null);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, start: rotation, moved: false, target: entryAt(e.target) };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) > 4) {
        d.moved = true;
        setSpinning(false);
        setHover(null);
      }
      if (d.moved) setRotation([d.start[0] + dx * DRAG, Math.max(-70, Math.min(70, d.start[1] - dy * DRAG))]);
      return;
    }
    const id = entryAt(e.target);
    const box = wrap.current?.getBoundingClientRect();
    setHover(id && box ? { id, x: e.clientX - box.left, y: e.clientY - box.top } : null);
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    // A press that didn't move is a click on whatever country it started on.
    if (d && !d.moved && d.target) onSelect(d.target);
  };

  const hovered = hover && byId.get(hover.id);

  return (
    <div className="globe" ref={wrap}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Globo interactivo: arrastrá para girarlo y tocá un país relevado para ver su ficha. Los mismos países están en la escalera y en la lista de abajo."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          setPaused(false);
          setHover(null);
        }}
      >
        <path className="sphere" d={path({ type: 'Sphere' }) ?? ''} />
        <path className="graticule" d={path(graticule) ?? ''} />
        {countries.map((c, i) => {
          const entry = COUNTRY_TO_ENTRY[String(c.id)];
          const j = entry ? byId.get(entry) : undefined;
          const d = path(c);
          if (!d) return null;
          return j ? (
            <path
              key={i}
              d={d}
              data-entry={entry}
              className={`country covered${hover?.id === entry ? ' hot' : ''}`}
              style={{ fill: statusOf(j.status).color }} // inline: a fill attribute would lose to the .country CSS rule
            />
          ) : (
            <path key={i} d={d} className="country" />
          );
        })}
      </svg>
      {hovered && (
        <div className="globe-tip" style={{ left: hover.x, top: hover.y }}>
          <strong>{hovered.name}</strong>
          <span>{statusOf(hovered.status).label}</span>
        </div>
      )}
      <p className="globe-hint">Arrastrá para girar · tocá un país para ver su ficha</p>
    </div>
  );
}
