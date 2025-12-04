import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f9fbf8]">
      <div className="container max-w-4xl mx-auto px-4 py-8 pb-24">
        <Link href="/settings">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-[#86A873]" />
            <h1 className="text-xl font-bold text-[#86A873]" data-testid="text-page-title">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xs text-muted-foreground" data-testid="text-effective-date">
            Effective Date: October 13, 2025
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-4 text-sm">
          <section>
            <p className="text-gray-700 leading-relaxed">
              At GlycoGuide, your privacy and the security of your personal health information are our top priorities. This Privacy Policy explains how we collect, use, store, and protect your data when you use our wellness platform.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">1. Information We Collect</h2>
            
            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">1.1 Account Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create a GlycoGuide account, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Name and email address</li>
              <li>Authentication credentials (through Replit Auth)</li>
              <li>Profile information you choose to provide</li>
              <li>Subscription and billing information</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">1.2 Health and Wellness Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You voluntarily provide health tracking data, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Blood glucose readings and CGM data</li>
              <li>Meal logs, food intake, and nutrition information</li>
              <li>Sleep tracking data</li>
              <li>Hydration levels</li>
              <li>Exercise and movement activities</li>
              <li>Energy levels and mood check-ins</li>
              <li>Digestive health tracking</li>
              <li>Mindfulness and meditation sessions</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">1.3 Usage Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We automatically collect information about how you use GlycoGuide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Pages visited and features used</li>
              <li>Time spent on the platform</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and general location (city/region level)</li>
              <li>Session data and authentication logs</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">1.4 Community Content</h3>
            <p className="text-gray-700 leading-relaxed">
              If you participate in GlycoGuide's community features, we collect your posts, comments, shared recipes, and interactions with other users.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Provide our services:</strong> Enable tracking, meal planning, insights, and personalized recommendations</li>
              <li><strong>Improve your experience:</strong> Analyze patterns to provide tailored wellness tips and glucose impact predictions</li>
              <li><strong>Process payments:</strong> Manage subscriptions and billing through our payment processor (Stripe)</li>
              <li><strong>Communicate with you:</strong> Send service updates, respond to inquiries, and provide customer support</li>
              <li><strong>Enhance our platform:</strong> Analyze usage patterns to improve features and develop new functionality</li>
              <li><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and unauthorized access</li>
              <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements and respond to lawful requests</li>
            </ul>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">3. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GlycoGuide uses cookies and similar technologies to enhance your experience and ensure platform functionality.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">3.1 Essential Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Required for the platform to function properly:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Session cookies:</strong> Maintain your login state and authentication</li>
              <li><strong>Security cookies:</strong> Protect against unauthorized access and CSRF attacks</li>
              <li><strong>Preference cookies:</strong> Remember your settings and interface preferences</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">3.2 Analytics Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Help us understand how users interact with GlycoGuide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Page views and feature usage</li>
              <li>User flow and navigation patterns</li>
              <li>Performance metrics and error tracking</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can opt out of analytics tracking in your Settings. Note that analytics data is anonymized and does not include personal health information.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">3.3 Local Storage</h3>
            <p className="text-gray-700 leading-relaxed">
              We use browser local storage to save your preferences, cache data for offline access, and improve performance. You can clear local storage through your browser settings at any time.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">4. Data Sharing and Disclosure</h2>
            <div className="p-4 bg-[#86A873]/5 border-l-4 border-[#86A873] rounded mb-4">
              <p className="text-gray-800 font-semibold mb-2">Your Health Data is Private</p>
              <p className="text-gray-700">
                We never sell your personal health information to third parties. Your glucose readings, meal logs, and wellness data remain confidential.
              </p>
            </div>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">4.1 Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We share limited data with trusted service providers who help us operate GlycoGuide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Hosting:</strong> Replit platform for application hosting</li>
              <li><strong>Database:</strong> Neon for secure PostgreSQL data storage</li>
              <li><strong>Payment processing:</strong> Stripe for subscription billing (they receive only payment information, not health data)</li>
              <li><strong>Authentication:</strong> Replit Auth for secure user authentication</li>
              <li><strong>Email:</strong> SendGrid for transactional emails and notifications</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              All service providers are contractually obligated to protect your data and may only use it to provide services to GlycoGuide.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">4.2 Aggregated and Anonymized Data</h3>
            <p className="text-gray-700 leading-relaxed">
              We may share aggregated, anonymized statistics that cannot identify you individually (e.g., "70% of users report improved energy levels after tracking sleep"). This helps us conduct research and improve wellness outcomes.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-3 mb-2">4.3 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law, court order, or governmental request, or to protect the rights, property, or safety of GlycoGuide, our users, or the public.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest</li>
              <li><strong>Secure authentication:</strong> OAuth-based login with session management</li>
              <li><strong>Access controls:</strong> Strict permissions ensure only authorized personnel can access systems</li>
              <li><strong>Regular backups:</strong> Automated backups protect against data loss</li>
              <li><strong>Security monitoring:</strong> Continuous monitoring for suspicious activity and vulnerabilities</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              While we take extensive precautions, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security but are committed to protecting your data using best practices.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your data based on your subscription tier:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Free Plan:</strong> 30 days of health tracking data</li>
              <li><strong>Premium Plan:</strong> 1 year of health tracking data</li>
              <li><strong>Pro Plan:</strong> Unlimited data retention</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Account information and settings are retained as long as your account is active. If you delete your account, we will permanently delete your personal data within 30 days, except as required for legal compliance or dispute resolution.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">7. Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> View all your personal data at any time through your account dashboard</li>
              <li><strong>Export:</strong> Download your complete data in portable CSV or PDF format from the Insights page</li>
              <li><strong>Correction:</strong> Update or correct any inaccurate information through your account settings or by contacting support</li>
              <li><strong>Deletion:</strong> Permanently delete your account and all associated data at any time through Settings → Delete Account</li>
              <li><strong>Opt-Out:</strong> Control analytics tracking, personalized insights, and marketing communications through your privacy settings</li>
              <li><strong>Portability:</strong> Transfer your data to other services using our export functionality</li>
            </ul>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              GlycoGuide is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child under 13, please contact us immediately so we can delete it.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">9. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              GlycoGuide operates from Ontario, Canada. If you access our services from outside Canada, your data may be transferred to and processed in Canada or other countries where our service providers operate. By using GlycoGuide, you consent to such transfers. We ensure appropriate safeguards are in place to protect your data regardless of location.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">10. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              GlycoGuide may contain links to third-party websites, services, or resources. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on this page and updating the "Effective Date" above. Significant changes will also be communicated via email or in-app notification.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">12. Medical Privacy Notice</h2>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
              <p className="text-gray-800 font-semibold mb-2">Important Notice:</p>
              <p className="text-gray-700 leading-relaxed mb-2">
                GlycoGuide is a wellness and lifestyle tracking platform, NOT a medical device or healthcare provider. We are not subject to HIPAA (Health Insurance Portability and Accountability Act) or similar medical privacy regulations.
              </p>
              <p className="text-gray-700 leading-relaxed">
                While we implement strong privacy and security measures, the data you enter into GlycoGuide is not protected health information (PHI) under medical privacy laws. Do not use GlycoGuide to store medical records or sensitive medical diagnoses. Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">13. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us:
            </p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>GlycoGuide Privacy Team</strong></p>
              <p className="text-gray-700 mb-2">Email: privacy@glycoguide.app</p>
              <p className="text-gray-700 mb-2">Support: support@glycoguide.app</p>
              <p className="text-gray-700">Location: Ontario, Canada</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We will respond to privacy inquiries within 30 days.
            </p>
          </section>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Questions? Read our{" "}
              <Link href="/terms" className="text-[#86A873] hover:underline" data-testid="link-terms">
                Terms of Service
              </Link>
              {" "}or contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
