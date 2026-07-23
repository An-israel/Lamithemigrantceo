"use client";

/**
 * A reusable list of add/removable single-line text rows (e.g. "who it is for",
 * "what you get"). Kept deliberately simple — reorder by editing in place.
 */
export function RepeatableRows({
  label,
  values,
  onChange,
  placeholder = "Add a line",
  max,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  function update(i: number, v: string) {
    const next = [...values];
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  function add() {
    if (max && values.length >= max) return;
    onChange([...values, ""]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label">{label}</label>
        {max && (
          <span className="text-xs text-muted">
            {values.length}/{max}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="field"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 rounded-input border border-line px-3 text-muted hover:border-clay"
              aria-label="Remove row"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={!!max && values.length >= max}
        className="mt-2 text-sm text-clay underline disabled:text-muted disabled:no-underline"
      >
        + Add
      </button>
    </div>
  );
}
