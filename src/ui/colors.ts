// One soft colour per movie so the day can be scanned at a glance; text on them is dark.
const COLORS: Record<string, string> = {
  'gravity-well': '#bcd3f2',
  'last-ferry': '#b5e0d6',
  'paper-lanterns': '#f6dfae',
  'blue-hour': '#cdd5ec',
  'kibbutz-kids-3': '#f5c6c4',
  sonata: '#ddd0f0',
  'quiet-fleet': '#c9e3bd',
  marmalade: '#f8d3b8',
};
export const movieColor = (id: string) => COLORS[id] ?? '#e2e5ea';
