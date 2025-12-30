// KONFIGURASJON: Rediger denne filen for å endre ordenselev-rotasjon
export const ordenselever = [
  { name: "Ola Nordmann", weekNumber: 51 },
  { name: "Kari Hansen", weekNumber: 52 },
  { name: "Per Olsen", weekNumber: 1 },
  { name: "Lise Berg", weekNumber: 2 },
];

export function getTodaysOrdenselev(): string {
  // Enkelt oppsett: Vi bruker ukenummer for å finne ordenselev.
  // I en ekte app ville vi kanskje brukt dato mer presist.
  const currentWeek = getWeekNumber(new Date());
  const elev = ordenselever.find(e => e.weekNumber === currentWeek);
  return elev ? elev.name : "Ingen satt opp";
}

// Hjelpefunksjon for å finne ukenummer (ISO 8601)
export function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}
