export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="px-6 py-20 bg-gray-50 dark:bg-gray-900"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2
          id="pricing-heading"
          className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        >
          Simple, Professional Plans
        </h2>
        <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
          GlycoGuide is your professional partner for diabetes-friendly living
          and holistic health — choose the plan that works best for your journey.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Starter */}
          <PlanCard
            name="Starter"
            price="$0"
            cadence="forever"
            features={[
              "Diabetes-friendly recipe sampler",
              "Basic meal logging",
              "Access to Evening Wind-Down guided practice",
            ]}
            badge="Great for getting started"
            ctaLabel="Get Started (Free)"
            ctaHref="/auth"
          />

          {/* Care Plan */}
          <PlanCard
            name="Care Plan"
            price="$15.00"
            cadence="/month"
            features={[
              "Full recipe library (500+ low-GI recipes)",
              "Guided practices (stress, sleep, gratitude)",
              "Wellness tips & reminders",
              "No progress tracking or full community participation",
            ]}
            badge="Professional Support"
            highlight
            ctaLabel="Choose Care Plan"
            ctaHref="/auth"
          />

          {/* Premium Care */}
          <PlanCard
            name="Premium Care"
            price="$19.95"
            cadence="/month"
            features={[
              "Everything in Care Plan",
              "Progress tracking (meals, moods, milestones)",
              "Full Community Hub participation",
              "Personalized dietary health coaching",
            ]}
            badge="Best Value"
            ctaLabel="Choose Premium Care"
            ctaHref="/auth"
          />
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  features,
  badge,
  ctaLabel,
  ctaHref,
  highlight = false,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border p-6 text-left shadow-sm transition",
        "bg-white border-gray-200 hover:shadow-md",
        "dark:bg-gray-950 dark:border-gray-800",
        highlight ? "ring-2 ring-emerald-500" : "",
      ].join(" ")}
    >
      {badge && (
        <span className="absolute -top-3 left-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{price}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{cadence}</span>
      </div>

      <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span aria-hidden>✅</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => window.location.href = ctaHref}
        className={[
          "mt-6 inline-flex items-center justify-center rounded-full px-6 py-2 font-semibold transition",
          highlight
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "border border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/70 dark:hover:bg-emerald-400/10",
        ].join(" ")}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
