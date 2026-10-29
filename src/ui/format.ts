// ₪ amounts. Signed amounts always show + or − (₪0 has no sign).
export const shekels = (n: number) => `₪${Math.abs(n).toLocaleString('en-US')}`;
export const signedShekels = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '') + shekels(n);
