import { useQuery } from "@tanstack/react-query";

export default function AdminBadge({ isAdmin }: { isAdmin: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["modQueueCount"],
    queryFn: async () => {
      const res = await fetch("/api/community/mod/queue/count");
      if (!res.ok) throw new Error("Failed to fetch mod queue count");
      const json = await res.json();
      return json.count as number;
    },
    enabled: isAdmin, // only fetch if admin
    refetchInterval: 60_000, // optional: refresh once per minute
    staleTime: 30_000, // consider data fresh for 30 seconds
  });

  if (!isAdmin) return null; // don't show anything for regular users

  return (
    <div className="relative inline-flex items-center">
      <span className="text-sm font-medium">Community</span>
      {isLoading ? null : data && data > 0 ? (
        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold px-2 py-0.5">
          {data}
        </span>
      ) : null}
    </div>
  );
}