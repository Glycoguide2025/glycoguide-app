export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="bg-white dark:bg-gray-950 px-6 py-20"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-5xl text-center">
        <h2
          id="testimonials-heading"
          className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        >
          Loved by Our Community
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {/* Original Testimonials */}
          <blockquote className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              "GlycoGuide completely changed how I approach my meals. I feel
              healthier and more in control."
            </p>
            <footer className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              — Maria S.
            </footer>
          </blockquote>

          <blockquote className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              "Finally, an app that combines recipes, wellness, and progress
              tracking all in one place."
            </p>
            <footer className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              — James K.
            </footer>
          </blockquote>

          {/* New Testimonials */}
          <blockquote className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              "As someone managing type 2 diabetes, GlycoGuide helped me discover
              meals that keep my blood sugar steady and taste amazing."
            </p>
            <footer className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              — Daniel R.
            </footer>
          </blockquote>

          <blockquote className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              "The wellness practices reminded me to slow down and care for myself.
              It's not just food — it's a lifestyle reset."
            </p>
            <footer className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              — Priya M.
            </footer>
          </blockquote>

          <blockquote className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              "Seeing my progress chart grow gave me the motivation to keep going.
              Small wins added up to big changes."
            </p>
            <footer className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              — Jordan T.
            </footer>
          </blockquote>

          <blockquote className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              "The Community Hub feels like family. Knowing I'm not alone on this
              journey makes all the difference."
            </p>
            <footer className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
              — Elena V.
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
