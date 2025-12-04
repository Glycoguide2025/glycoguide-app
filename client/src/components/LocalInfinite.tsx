import { useEffect, useRef, useState } from "react";

export function useLocalInfinite<T>(all: T[], pageSize = 40) {
  const [limit, setLimit] = useState(pageSize);
  const loadMore = () => setLimit((n) => Math.min(n + pageSize, all.length));
  return { items: all.slice(0, limit), hasMore: limit < all.length, loadMore };
}

export function Sentinel({ onHit }: { onHit: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onHit();
    }, { rootMargin: "600px 0px" }); // pre-load ahead
    io.observe(el);
    return () => io.disconnect();
  }, [onHit]);
  return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />;
}