export async function downloadCsv(range?: { start?: string; end?: string }) {
  const params = new URLSearchParams();
  if (range?.start) params.set("start", range.start);
  if (range?.end) params.set("end", range.end);

  const res = await fetch(`/export/csv?${params.toString()}`, {
    credentials: "include"
  });

  if (res.status === 402) {
    // Optional: trigger your Upgrade modal here
    throw new Error("UPGRADE_REQUIRED");
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`CSV export failed: ${res.status} ${txt}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `GlycoGuide_Export_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}