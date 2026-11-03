// All "day" logic (streaks, weekly activity, daily challenge) uses Indian Standard Time.
const IST = 'Asia/Kolkata';

/** YYYY-MM-DD for the given moment in IST */
export const istDayKey = (d: Date | string | number = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(d));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};

/** The 7 YYYY-MM-DD keys (Mon..Sun) of the current IST week */
export const istWeekKeys = (): string[] => {
  const today = new Date(`${istDayKey()}T00:00:00Z`);
  const sinceMonday = (today.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  return Array.from({ length: 7 }, (_, i) =>
    new Date(today.getTime() + (i - sinceMonday) * 86400000).toISOString().slice(0, 10)
  );
};