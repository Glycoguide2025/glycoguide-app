type Shot = { src: string; alt: string; caption: string };

const SHOTS: Shot[] = [
  { src: "/assets/screens/recipes.png",    alt: "Recipe search with low-GI filter",        caption: "500+ Low-GI Recipes" },
  { src: "/assets/screens/wellness.png",   alt: "Guided wellness practices screen",        caption: "Daily Wellness Practices" },
  { src: "/assets/screens/progress.png",   alt: "Progress tracking chart view",            caption: "Progress Tracking" },
  { src: "/assets/screens/community.png",  alt: "Community Hub weekly theme banner",       caption: "Community Hub" },
];

export default function ScreenshotsSection() {
  return (
    <section id="screens" className="px-6 py-20 bg-white dark:bg-gray-950" aria-labelledby="screens-heading">
      <div className="mx-auto max-w-5xl text-center">
        <h2 id="screens-heading" className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          See GlycoGuide in Action
        </h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Simple, calming screens designed for clarity—on both mobile and desktop.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SHOTS.map((s, i) => (
            <figure
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <img
                src={s.src}
                alt={s.alt}
                className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                loading="lazy"
              />
              <figcaption className="p-4 text-sm text-gray-800 dark:text-gray-200">{s.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
