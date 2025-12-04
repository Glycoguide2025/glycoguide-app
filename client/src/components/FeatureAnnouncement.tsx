import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

/**
 * Reusable feature announcement component
 * - Shows a big popup once per user during LAUNCH window
 * - After the window, shows a small mini banner
 * - Uses localStorage keys with a version suffix so you can re-run future campaigns
 */
export type FeatureAnnouncementProps = {
  launchISO: string;           // e.g. "2025-09-29T00:00:00Z" (UTC)
  windowDays?: number;         // default 7
  storageNamespace: string;    // unique name for the feature, e.g. "communityHub"
  version?: string;            // bump to "v2" for new campaigns

  title?: string;
  body?: string;
  highlights?: Array<{ emoji: string; title: string; desc: string }>;
  primaryCTAText?: string;
  primaryCTALink?: string;
  secondaryCTAText?: string;
  secondaryCTALink?: string;

  miniText?: string;
  miniCTAText?: string;
  miniCTALink?: string;

  gradient?: boolean;
};

export default function FeatureAnnouncement({
  launchISO,
  windowDays = 7,
  storageNamespace,
  version = "v1",
  title = "🎉 New Feature",
  body = "Discover what's new — designed to support your wellness journey.",
  highlights = [
    { emoji: "🌱", title: "Fresh & Helpful", desc: "Thoughtful features to support daily habits." },
    { emoji: "💬", title: "Share & Connect", desc: "Built-in ways to reflect and engage." },
    { emoji: "🔥", title: "Celebrate Progress", desc: "Badges and streaks to motivate you." },
    { emoji: "💖", title: "Supportive Space", desc: "Safe interactions; positive by design." },
  ],
  primaryCTAText = "Explore Now",
  primaryCTALink = "/",
  secondaryCTAText = "Learn More",
  secondaryCTALink = "/",
  miniText = "✨ A new feature is live — take a look.",
  miniCTAText = "Open",
  miniCTALink = "/",
  gradient = true,
}: FeatureAnnouncementProps) {
  const DISMISSED_KEY = useMemo(
    () => `gg.${storageNamespace}.announce.dismissed.${version}`,
    [storageNamespace, version]
  );
  const SEEN_KEY = useMemo(
    () => `gg.${storageNamespace}.announce.firstSeen.${version}`,
    [storageNamespace, version]
  );

  type Mode = "popup" | "mini" | "none";
  const [mode, setMode] = useState<Mode>("none");

  useEffect(() => {
    const now = new Date();
    const launch = new Date(launchISO);
    const windowEnds = new Date(launch.getTime() + windowDays * 24 * 60 * 60 * 1000);

    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    const alreadySeen = localStorage.getItem(SEEN_KEY) === "true";
    const withinWindow = now >= launch && now <= windowEnds;

    if (withinWindow && !dismissed && !alreadySeen) {
      setMode("popup");
      localStorage.setItem(SEEN_KEY, "true");
    } else if (now > windowEnds) {
      setMode("mini");
    } else {
      setMode("none");
    }
  }, [DISMISSED_KEY, SEEN_KEY, launchISO, windowDays]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setMode("none");
  };

  if (mode === "none") return null;

  if (mode === "popup") {
    return (
      <section
        role="status"
        aria-live="polite"
        className={`relative overflow-hidden rounded-2xl border border-emerald-300 p-6 shadow-md ${
          gradient
            ? "bg-gradient-to-br from-emerald-100 via-rose-50 to-emerald-100"
            : "bg-emerald-50"
        }`}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-pink-200/40 blur-2xl" />

        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-3 rounded-full p-1 text-emerald-800 hover:bg-emerald-200/60"
        >
          ✕
        </button>

        {/* Heading */}
        <h1 className="mb-2 text-center text-2xl font-bold text-emerald-900 md:text-3xl">{title}</h1>

        {/* Body */}
        <p className="mx-auto mb-4 max-w-2xl text-center leading-relaxed text-gray-800">{body}</p>

        {/* Highlights */}
        {!!highlights?.length && (
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
            {highlights.map((h, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-1 text-lg font-semibold text-emerald-900">
                  {h.emoji} {h.title}
                </div>
                <p className="text-sm text-gray-700">{h.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to={primaryCTALink}
            className="rounded-full bg-emerald-600 px-6 py-2 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            {primaryCTAText}
          </Link>
          <Link
            to={secondaryCTALink}
            className="rounded-full border border-emerald-700 px-6 py-2 text-emerald-800 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            {secondaryCTAText}
          </Link>
          <button
            onClick={dismiss}
            className="rounded-full px-4 py-2 text-emerald-800 underline-offset-2 hover:underline"
          >
            Remind me later
          </button>
        </div>
      </section>
    );
  }

  // Mini banner (post-window)
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center shadow-sm sm:flex-row">
      <p className="font-medium text-emerald-900">{miniText}</p>
      <Link
        to={miniCTALink}
        className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
      >
        {miniCTAText}
      </Link>
    </div>
  );
}
