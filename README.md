# TapRead

A flipped-classroom English reading companion for adult A1 learners (Farsi L1).
**Lesson 1 ("Marta's New Career") is fully functional; Lessons 2–20 are locked placeholders** showing a "Coming soon" pill.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4. UI components are written in the shadcn/ui style under `components/ui/` (Button, Card, Switch, Sheet, Toast, Segmented, Progress…) — no external UI dependency.
- No backend, no database, no API keys. All state lives in `localStorage` under the key `tapread:v1`.
- English audio via the browser `SpeechSynthesis` API (`en-US`, rate `0.85`). No bundled audio files.
- Fonts: Inter (English) + **Vazirmatn** (Farsi) via `next/font/google`. Farsi text renders RTL inside `.fa` / `[dir="rtl"]` islands.

## Content architecture (edit here, not in React code)

```
content/
  registry.ts             # ordered 20-lesson list + lesson/dictionary loaders (override-aware)
  lessons/lesson-01.json  # full Lesson 1 (vocabulary, tokenized sentences, quiz, discussion, retelling)
  dictionary.json         # shared glossary, matched on `lemma`
  types.ts                # Lesson/Token/… types
```

- Every English sentence carries `tokens` that **cover the sentence exactly when joined with spaces**. A token with a `lemma` looks up `dictionary.json`; without it, the learner sees «ترجمه به‌زودی» and the tap is logged to `missingGlosses`.
- Multi-word units (`give up`, `in front of`, `look forward to`, `public speaking`, `every single day`, `twice a week`) are single `isPhrase` tokens (dotted underline).
- `presentSimple: true` on a token marks it for the "Show the verbs" amber highlight.
- Retelling key words carry their own Farsi gloss (`{ en, fa }`).

## Editing content without a code editor

- **Settings → Content editor** (toggle) unlocks `/editor`: edit every sentence/translation/vocab card/quiz item as a form, save to `localStorage` (overrides the bundled JSON), **Export JSON**, **Reset to default**, plus a validation panel (missing translations, unresolved tokens, incomplete questions) and the missing-glosses log.
- `/teacher` (unlock via **Settings → Teacher mode**) shows vocabulary self-ratings, the comprehension score with per-question answers, discussion notes + audio players, the retelling recording + checked key words, the three teacher questions, and a "Common problems" panel. **Print session plan** produces a clean one-page printout; **Copy student data** copies the full `localStorage` JSON.

## Screens

| Route | Screen |
|---|---|
| `/` | Winding 20-node lesson path, progress ring, summary stats |
| `/lesson/lesson-01` | Overview: metadata, grammar chips, 6-step checklist, Start/Continue |
| `/lesson/lesson-01/step/1…6` | Vocabulary · Reading · Comprehension · Discussion · Retelling · Ask your teacher |
| `/settings` | Support mode, UI language (EN/فارسی), text size, teacher mode, editor, reset progress |

## Develop

```bash
npm run dev     # http://localhost:3000 (or the port it prints)
npm run build   # production build
```

Mobile-first: content column max-width 480px, usable at 360px with no horizontal scroll. Word/sentence tap targets are ≥44px; motion respects `prefers-reduced-motion`.
