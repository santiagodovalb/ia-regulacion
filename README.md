# ¿Cómo se regula la IA?

How Latin American countries (Argentina, Brazil, Chile, Mexico, Colombia, Uruguay) regulate artificial intelligence, compared with three reference models: the European Union, the United States and China.

```bash
npm install
npm run dev
npm run check   # validates src/data.json (also runs before every build)
```

## Data

Everything lives in `src/data.json`, one entry per jurisdiction. The fields and allowed values are in `src/types.ts`. There is no build step for the data: edit the JSON, run `npm run check`, and push.

### Review workflow

The first version of every entry was drafted with AI-assisted research on 2026-11-13. Every source URL was opened during that research, and anything that couldn't be verified is listed in the entry's `uncertain` field. The site shows those notes under "A confirmar".

Every entry starts with `"reviewed": false`, so the site marks it "Pendiente de revisión" and the footer counts how many are pending. To review an entry:

1. Open its sources and check `status`, `approach`, `prohibitions`, `genai` and `authority` against them.
2. Fix or rewrite the `summary` in your own words.
3. Resolve what you can from `uncertain`, and delete the notes you've settled.
4. Set `"checked"` to today's date and `"reviewed": true`.

## Method

- **Status** is set by the most binding *general* AI instrument. Sector-specific or criminal-law provisions are mentioned in the summary but don't move a country up the ladder.
- **Approach** is the approach of the main instrument, or of the most advanced bill.
- **"Propuesto"** means a measure appears in a bill, not in a rule in force.
