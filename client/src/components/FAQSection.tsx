import { useState } from "react";

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "Is GlycoGuide only for people with diabetes?",
    a: "No. GlycoGuide supports everyone interested in holistic health. Many features are designed to be diabetes-friendly—like low-GI recipes and gentle wellness practices—but the app benefits anyone building sustainable habits.",
  },
  {
    q: "What does \"low-GI recipes\" mean?",
    a: "GI (Glycemic Index) measures how quickly a food may raise blood sugar. Our 500+ recipes favor low-GI ingredients to support steadier energy and balanced meals.",
  },
  {
    q: "How do wellness practices help?",
    a: "Short, calming routines—like evening wind-down, gratitude reflection, and quick stress relief—can support nervous system balance, sleep quality, and mindful choices.",
  },
  {
    q: "What is progress tracking?",
    a: "You can log meals, moods, and milestones to notice patterns and celebrate growth over time. It's designed to be simple, encouraging, and non-judgmental.",
  },
  {
    q: "Can I post in the Community Hub?",
    a: "Starter users can browse; Plus and above can post, react, and join weekly themes. Community is optional—privacy matters and sharing is always your choice.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="px-6 py-20 bg-white dark:bg-gray-950" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-4xl">
        <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl text-center">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 divide-y divide-gray-200 dark:divide-gray-800 rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
          {FAQS.map((item, i) => (
            <Accordion key={i} {...item} defaultOpen={i === 0} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Accordion({ q, a, defaultOpen = false, index }: QA & { defaultOpen?: boolean; index: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div data-testid={`accordion-faq-${index}`}>
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-testid={`button-faq-toggle-${index}`}
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{q}</span>
        <span className="ml-4 text-gray-600 dark:text-gray-300" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-700 dark:text-gray-300" data-testid={`text-faq-answer-${index}`}>
          <p>{a}</p>
        </div>
      )}
    </div>
  );
}
