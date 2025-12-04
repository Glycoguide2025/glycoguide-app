export default function Press() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6" data-testid="press-kit-page">
      <h1 className="text-3xl font-semibold" data-testid="text-press-title">GlycoGuide Press Kit</h1>
      <p className="text-gray-700 dark:text-gray-300" data-testid="text-press-description">
        GlycoGuide is a calm, wellness-first companion for everyday food habits.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold" data-testid="text-brand-assets-title">Brand Assets</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <a 
              href="https://glycoguide.replit.app/logo.png" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              data-testid="link-logo-png"
            >
              Logo (PNG)
            </a>
          </li>
          <li>
            <a 
              href="https://glycoguide.replit.app/icon.svg" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              data-testid="link-app-icon-svg"
            >
              App Icon (SVG)
            </a>
          </li>
          <li>
            <a 
              href="https://glycoguide.replit.app/screenshots.zip" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              data-testid="link-screenshots-zip"
            >
              Screenshots (ZIP)
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold" data-testid="text-boilerplate-title">Boilerplate</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed" data-testid="text-boilerplate-content">
          GlycoGuide helps people build healthy food habits with fast logging, supportive insights, and 
          privacy-first design. It is not medical advice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold" data-testid="text-contact-title">Contact</h2>
        <p className="text-gray-700 dark:text-gray-300" data-testid="text-contact-email">
          Email: support@glycoguide.app
        </p>
      </section>

      <div className="pt-6 border-t">
        <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-press-footer">
          For media inquiries, partnership opportunities, or additional brand assets, please contact us at the email above.
        </p>
      </div>
    </div>
  );
}