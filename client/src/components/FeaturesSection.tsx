export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="px-6 py-20 bg-gray-50 dark:bg-gray-900"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2
          id="features-heading"
          className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        >
          Why Choose GlycoGuide?
        </h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Your trusted companion for recipes, wellness, and progress—built to
          support both holistic health and diabetes-friendly living.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <FeatureCard
            emoji="🍲"
            title="500+ Low-GI Recipes"
            body="Nutritious, delicious meals designed to help balance blood sugar while enjoying food you love."
            requiredPlan="In order to use this feature you must upgrade to Pro or Premium"
          />
          <FeatureCard
            emoji="🌱"
            title="Daily Wellness Practices"
            body="Gentle nudges and holistic routines to keep you grounded, calm, and inspired each day."
            requiredPlan="In order to use this feature you must upgrade to Pro or Premium"
          />
          <FeatureCard
            emoji="📈"
            title="Progress Tracking"
            body="Easily log meals, moods, and milestones to celebrate your growth and keep momentum strong."
            requiredPlan="In order to use this feature you must upgrade to Pro or Premium"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ emoji, title, body, requiredPlan }: { emoji: string; title: string; body: string; requiredPlan: string }) {
  const handleClick = () => {
    // Scroll to pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition cursor-pointer dark:border-gray-800 dark:bg-gray-950 hover:ring-2 hover:ring-emerald-500"
    >
      <div className="text-4xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{body}</p>
      <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
        {requiredPlan} →
      </p>
    </div>
  );
}
