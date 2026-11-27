// Parsing/matching helpers for the `ing()` step-authoring syntax. Pure
// functions only — no React Native dependencies — so they're fully testable
// in plain Jest, same as scale.ts.

const ING_TRIGGER = "ing(";
const ING_PATTERN = /ing\(([^)]*)\)/g;
const KEYWORD_PATTERN = /(?:ing|amt|unit)\(([^)]*)\)/g;

export type OpenIngContext = {
  /** Index in the text right after "ing(" — where the splice should start. */
  start: number;
  /** Whatever's been typed so far between "ing(" and the cursor. */
  query: string;
};

/**
 * If the cursor currently sits inside an *unclosed* "ing(...)" — i.e. the
 * user just typed "ing(" and hasn't typed a closing ")" yet — returns where
 * that name starts and what's been typed so far. Otherwise returns null.
 */
export function findOpenIngContext(
  text: string,
  cursorPosition: number,
): OpenIngContext | null {
  const beforeCursor = text.slice(0, cursorPosition);
  const triggerIndex = beforeCursor.lastIndexOf(ING_TRIGGER);
  if (triggerIndex === -1) return null;

  const start = triggerIndex + ING_TRIGGER.length;
  const query = beforeCursor.slice(start);
  if (query.includes(")")) return null;

  return { start, query };
}

/**
 * Splices `name` into `text` at the given open `ing(` context, closing the
 * parenthesis and moving the cursor to just after it.
 */
export function applyIngredientSelection(
  text: string,
  context: OpenIngContext,
  cursorPosition: number,
  name: string,
): { text: string; cursorPosition: number } {
  const before = text.slice(0, context.start);
  const after = text.slice(cursorPosition);
  const inserted = `${name})`;
  return {
    text: `${before}${inserted}${after}`,
    cursorPosition: before.length + inserted.length,
  };
}

/** Case-insensitive substring filter — matches the recipe's own ingredients. */
export function filterIngredientNames(
  names: string[],
  query: string,
): string[] {
  const normalized = query.trim().toLowerCase();
  const nonEmpty = names.filter((name) => name.trim() !== "");
  if (normalized === "") return nonEmpty;
  return nonEmpty.filter((name) => name.toLowerCase().includes(normalized));
}

/**
 * Every `ing(...)` reference in the text that does NOT exactly
 * (case-insensitively) match one of `names`. Each entry includes a
 * low-edit-distance suggestion when one exists, for a "did you mean" fix.
 */
export type UnresolvedReference = {
  raw: string;
  suggestion: string | null;
};

export function findUnresolvedReferences(
  text: string,
  names: string[],
): UnresolvedReference[] {
  const normalizedNames = names.map((name) => name.trim().toLowerCase());
  const unresolved: UnresolvedReference[] = [];

  const pattern = new RegExp(ING_PATTERN);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const raw = match[1].trim();
    if (raw === "") continue;
    if (normalizedNames.includes(raw.toLowerCase())) continue;

    unresolved.push({
      raw,
      suggestion: findClosestName(raw, names),
    });
  }

  return unresolved;
}

/** Every `ing(...)` reference that DOES resolve, mapped to the matching name. */
export function parseIngredientReferences(
  text: string,
  names: string[],
): string[] {
  const resolved: string[] = [];
  const pattern = new RegExp(ING_PATTERN);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const raw = match[1].trim().toLowerCase();
    const found = names.find((name) => name.trim().toLowerCase() === raw);
    if (found) resolved.push(found);
  }
  return resolved;
}

const MAX_SUGGESTION_DISTANCE = 3;

function findClosestName(raw: string, names: string[]): string | null {
  let best: { name: string; distance: number } | null = null;

  for (const name of names) {
    if (name.trim() === "") continue;
    const distance = levenshteinDistance(raw.toLowerCase(), name.toLowerCase());
    if (!best || distance < best.distance) {
      best = { name, distance };
    }
  }

  if (!best || best.distance > MAX_SUGGESTION_DISTANCE) return null;
  return best.name;
}

/**
 * Splits a step's raw command text into display segments: plain text, and
 * the bolded inner value of every `ing()`/`amt()`/`unit()` occurrence, with
 * the keyword and parens stripped. Used to render a saved (non-editable)
 * step — the raw syntax is only ever shown while actually editing.
 */
export type StepDisplaySegment =
  | { type: "text"; text: string }
  | { type: "value"; text: string };

export function parseStepDisplaySegments(command: string): StepDisplaySegment[] {
  const segments: StepDisplaySegment[] = [];
  let lastIndex = 0;

  const pattern = new RegExp(KEYWORD_PATTERN);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(command))) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", text: command.slice(lastIndex, match.index) });
    }
    segments.push({ type: "value", text: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < command.length) {
    segments.push({ type: "text", text: command.slice(lastIndex) });
  }

  return segments;
}

/** Standard edit-distance: how many single-character edits turn `a` into `b`. */
export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0),
  );

  for (let i = 0; i < rows; i++) table[i][0] = i;
  for (let j = 0; j < cols; j++) table[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      table[i][j] = Math.min(
        table[i - 1][j] + 1,
        table[i][j - 1] + 1,
        table[i - 1][j - 1] + cost,
      );
    }
  }

  return table[rows - 1][cols - 1];
}
