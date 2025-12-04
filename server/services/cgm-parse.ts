/**
 * CGM Data Parsing Services
 * Supports Dexcom CSV, Libre CSV, and generic CSV/JSON formats
 */

export function toMgdl(value: number, unit?: string): number {
  if (!Number.isFinite(value)) return NaN as any;
  if (!unit || unit.toLowerCase().includes("mg")) return Math.round(value);
  // mmol/L → mg/dL
  return Math.round(value * 18.0182);
}

function parseCsv(text: string): string[][] {
  return text.split(/\r?\n/).map(l => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, "")));
}

export function parseDexcomCsv(text: string) {
  // Dexcom Clarity export often has headers like: "Timestamp (Local Time)","Glucose Value (mg/dL)", ...
  const rows = parseCsv(text);
  const header = rows.shift()?.map(h => h.toLowerCase()) ?? [];
  const tIdx = header.findIndex(h => h.includes("timestamp"));
  const vIdx = header.findIndex(h => h.includes("glucose") && h.includes("value"));
  const unit = header[vIdx]?.includes("mmol") ? "mmol/L" : "mg/dL";

  return rows
    .filter(r => r[tIdx] && r[vIdx])
    .map(r => ({ ts: r[tIdx], value: Number(r[vIdx]), unit, source: "dexcom_csv" }));
}

export function parseLibreCsv(text: string) {
  // LibreView export often: "Device","SerialNumber","Device Timestamp","Historic Glucose mg/dL",...
  const rows = parseCsv(text);
  const header = rows.shift()?.map(h => h.toLowerCase()) ?? [];
  const tIdx = header.findIndex(h => h.includes("timestamp"));
  const vIdx = header.findIndex(h => h.includes("glucose"));
  const unit = header[vIdx]?.includes("mmol") ? "mmol/L" : "mg/dL";

  return rows
    .filter(r => r[tIdx] && r[vIdx])
    .map(r => ({ ts: r[tIdx], value: Number(r[vIdx]), unit, source: "libre_csv" }));
}

export function parseGenericCsv(text: string) {
  // Expect columns: timestamp,value,unit?
  const rows = parseCsv(text);
  const header = rows.shift()?.map(h => h.toLowerCase()) ?? [];
  const tIdx = header.findIndex(h => h.startsWith("time"));
  const vIdx = header.findIndex(h => h.startsWith("value"));
  const uIdx = header.findIndex(h => h.startsWith("unit"));

  return rows
    .filter(r => r[tIdx] && r[vIdx])
    .map(r => ({ ts: r[tIdx], value: Number(r[vIdx]), unit: uIdx >= 0 ? r[uIdx] : "mg/dL", source: "csv" }));
}