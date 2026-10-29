import type { Minutes } from './types.ts';
import { START_STEP } from './data.ts';

export const fmt = (m: Minutes): string => {
  const h = Math.floor(m / 60) % 24;
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const ceilStep = (m: Minutes): Minutes => Math.ceil(m / START_STEP) * START_STEP;
