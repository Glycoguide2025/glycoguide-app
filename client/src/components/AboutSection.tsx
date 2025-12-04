export default function AboutSection() {
  return (
    <section id="about" className="px-6 py-16 bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100" aria-labelledby="about-heading">
      <div className="mx-auto max-w-5xl">
        <h2 id="about-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
          About GlycoGuide
        </h2>

        <div className="mt-5 space-y-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            <strong>GlycoGuide was created with you in mind</strong> — to make balanced living simple, supportive, and sustainable.
            Our approach blends modern nutrition science with mindful awareness, helping you understand how food, movement, and lifestyle work together to support lasting wellbeing.
          </p>
          <p>
            With <span className="font-semibold">500+ low-GI recipes</span>, guided wellness practices, and built-in progress tracking,
            GlycoGuide gently <span className="font-semibold">nudges you to include daily wellness practices for good health</span>,
            helping you balance blood sugar, improve energy, and feel supported every day.
          </p>
          <p className="text-emerald-800 dark:text-emerald-300">
            <strong>GlycoGuide — your life-changing wellness companion.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
