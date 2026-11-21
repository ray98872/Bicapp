import type { Units } from './types';

const LB_PER_KG = 2.2046226218;

export function kgToDisplay(kg: number | undefined, units: Units): number | undefined {
  if (kg === undefined || kg === null || Number.isNaN(kg)) return undefined;
  const v = units === 'kg' ? kg : kg * LB_PER_KG;
  return Math.round(v * 10) / 10;
}

export function displayToKg(value: number | undefined, units: Units): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return units === 'kg' ? value : value / LB_PER_KG;
}

export function fmtWeight(kg: number | undefined, units: Units, withUnit = true) {
  const v = kgToDisplay(kg, units);
  if (v === undefined) return '—';
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return withUnit ? `${s} ${units}` : s;
}

export function fmtVolume(kg: number, units: Units) {
  const v = kgToDisplay(kg, units) ?? 0;
  return `${Math.round(v).toLocaleString()} ${units}`;
}

export function fmtClock(totalSec: number) {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? h + ':' : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

export function fmtDuration(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: new Date(ts).getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

export function fmtRelativeDay(ts: number) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  return fmtDate(ts);
}

export function parseNum(text: string): number | undefined {
  const cleaned = text.replace(',', '.').trim();
  if (cleaned === '') return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
