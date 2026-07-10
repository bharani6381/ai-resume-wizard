## Goal
Turn each failing ATS checklist item into an inline, actionable fix so the user can resolve issues without leaving the builder.

## Approach
Extend the ATS check model with an `action` describing how to fix it, then render a small action control under each failing item in `ATSPanel`. Actions either jump to the correct form field/tab or run a one-click fix (e.g. Generate with AI).

## Changes

### 1. `src/lib/ats-score.ts`
Add optional `action` to `ATSCheck`:
```ts
action?:
  | { kind: "focus"; tab: "personal" | "education" | "skills" | "experience" | "projects"; field?: string; label: string }
  | { kind: "generate"; label: string }
```
Attach the right action to each check (e.g. `name` → focus personal/fullName; `skills` → focus skills tab; `generated`/`summary`/`quantified`/`action-verbs`/`bullet-length` → generate; `experience-bullets` → focus experience tab, etc.).

### 2. `src/routes/_authenticated/builder.$id.tsx`
- Lift the active tab into state: `const [tab, setTab] = useState("personal")` and pass `value={tab} onValueChange={setTab}` to `Tabs`.
- Give each input a stable id (e.g. `field-personal-fullName`, `field-education`, etc.).
- Pass callbacks to `ATSPanel`:
  - `onFocusField(tab, fieldId?)` → `setTab(tab)`, then `requestAnimationFrame` → scroll form panel into view + `document.getElementById(fieldId)?.focus()`.
  - `onGenerate()` → reuse existing `generate()`; disable when already `generating`.

### 3. `src/components/ATSPanel.tsx`
- Accept `onFocusField` and `onGenerate` (+ `generating` flag) props.
- For each failing check with an `action`, render a small button beneath the hint:
  - `focus` → "Edit {label} →" button calls `onFocusField`.
  - `generate` → "Generate with AI" button calls `onGenerate`, shows spinner when generating.
- Passed checks: no action shown (unchanged).

## Out of scope
- No changes to AI prompt, templates, or scoring weights.
- No new data persisted; purely UX wiring on existing state.
