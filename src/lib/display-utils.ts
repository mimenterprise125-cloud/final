// Small helper for formatting realized P&L consistently across the app
export function formatRealizedEntry(entry: any, opts?: { absolute?: boolean }) {
  const absolute = opts?.absolute ?? false;

  if (entry && entry.result === 'BREAKEVEN') {
    return 'BE ($0.00)';
  }

  const amount = Number(entry?.realized_amount ?? entry?.realized_points ?? 0);
  if (absolute) {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

export function formatRealizedValue(amountInput: any, opts?: { absolute?: boolean }) {
  const absolute = opts?.absolute ?? false;
  const amount = Number(amountInput ?? 0);
  if (absolute) return `$${Math.abs(amount).toFixed(2)}`;
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

// Return YYYY-MM-DD for a given ISO or Date, using local time (not UTC)
export function isoToLocalDateKey(iso?: string | Date | null) {
  if (!iso) return '';
  const d = new Date(iso as any);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Produce a value suitable for <input type="datetime-local"/>'s value attribute (local timezone)
export function localDatetimeInputValue(date?: Date) {
  const d = date ? new Date(date) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
