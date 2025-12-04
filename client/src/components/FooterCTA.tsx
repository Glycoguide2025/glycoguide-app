export default function FooterCTA() {
  return (
    <section
      id="cta-footer"
      className="px-6 py-20 bg-emerald-600 text-center text-white"
    >
      <h2 className="text-3xl font-extrabold sm:text-4xl">
        Start Your Journey to Good Health
      </h2>
      <p className="mt-4 text-lg max-w-2xl mx-auto">
        Whether you're living with diabetes or simply seeking holistic wellness,
        GlycoGuide is here to support every step of the way.
      </p>
      <div className="mt-8">
        <a
          href="#pricing"
          className="rounded-full bg-white px-8 py-3 text-emerald-700 font-semibold shadow hover:bg-gray-100 transition inline-block"
        >
          Get Started Today
        </a>
      </div>
    </section>
  );
}
