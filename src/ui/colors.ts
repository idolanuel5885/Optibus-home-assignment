// One colour per movie so the day can be scanned at a glance.
const COLORS: Record<string, string> = {
  'gravity-well': '#4f6bd8',
  'last-ferry': '#2a9d8f',
  'paper-lanterns': '#e9a23b',
  'blue-hour': '#6c8ebf',
  'kibbutz-kids-3': '#d1495b',
  sonata: '#8e6cbf',
  'quiet-fleet': '#5b8c5a',
  marmalade: '#e07a3f',
};
export const movieColor = (id: string) => COLORS[id] ?? '#888';
