export function buildAlphaIndex(recipes: { title: string }[]) {
  const map: Record<string, number> = {};
  const sorted = [...recipes].sort((a, b) => a.title.localeCompare(b.title));
  for (let i = 0; i < sorted.length; i++) {
    const ch = (sorted[i].title[0] || "").toUpperCase();
    if (/[A-Z]/.test(ch) && map[ch] === undefined) map[ch] = i;
  }
  return { sorted, map };
}

export function scrollToIndex(index: number) {
  const elements = document.querySelectorAll('[data-recipe]');
  if (elements[index]) {
    elements[index].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}