import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
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
            <FileText className="w-6 h-6 text-[#86A873]" />
            <h1 className="text-xl font-bold text-[#86A873]" data-testid="text-page-title">
              Terms of Service
            </h1>
          </div>
          <p className="text-xs text-muted-foreground" data-testid="text-effective-date">
            Effective Date: October 13, 2025
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-4 text-sm">
          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to GlycoGuide. By accessing or using our wellness platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services. GlycoGuide reserves the right to modify these Terms at any time, and your continued use of the platform constitutes acceptance of any changes.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GlycoGuide is a wellness and self-tracking platform designed to help individuals manage their health through:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Blood sugar tracking and glucose monitoring</li>
              <li>Low glycemic meal planning and nutrition guidance</li>
              <li>Health metrics tracking (sleep, hydration, exercise, energy, digestive health)</li>
              <li>Educational resources and wellness content</li>
              <li>Community features and peer support</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
              Important: GlycoGuide is NOT a medical device and does not provide medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">3. User Accounts and Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To access GlycoGuide's features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">4. Subscription Plans and Billing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GlycoGuide offers multiple subscription tiers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Free Plan:</strong> Basic access to core features</li>
              <li><strong>Premium Plan:</strong> Enhanced features and extended data history</li>
              <li><strong>Pro Plan:</strong> Full access to all features and unlimited data retention</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Subscription fees are billed monthly or annually as selected. By subscribing, you authorize GlycoGuide to charge your payment method on a recurring basis until you cancel your subscription.
            </p>
            <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
              <p className="text-gray-800 font-semibold mb-2">No Refunds Policy:</p>
              <p className="text-gray-700">
                All subscription fees are non-refundable. You may cancel your subscription at any time, but no refunds will be issued for partial subscription periods. Upon cancellation, you will retain access to paid features until the end of your current billing period.
              </p>
            </div>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">5. Cancellation and Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activity.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">6. User Content and Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of any content you submit to GlycoGuide, including health data, meal logs, and community posts. By submitting content, you grant GlycoGuide a license to use, store, and process this data to provide our services.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Post false, misleading, or harmful health information</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the platform for commercial purposes without authorization</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">7. Medical Disclaimer</h2>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-gray-800 font-semibold mb-2">Important Health Information:</p>
              <p className="text-gray-700 leading-relaxed mb-2">
                GlycoGuide is a wellness and self-tracking tool designed to support your health journey. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition. Never disregard professional medical advice or delay seeking it because of information provided by GlycoGuide.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you think you may have a medical emergency, call your doctor or emergency services immediately.
              </p>
            </div>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">8. Data Accuracy and Limitations</h2>
            <p className="text-gray-700 leading-relaxed">
              While we strive to provide accurate nutritional information and glycemic index data, individual responses to foods may vary. All information is provided "as is" without warranty of any kind. You are responsible for verifying information and making informed decisions about your health and diet.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">9. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content, features, and functionality of GlycoGuide, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the exclusive property of GlycoGuide and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">10. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our{" "}
              <Link href="/privacy" className="text-[#86A873] hover:underline font-semibold" data-testid="link-privacy">
                Privacy Policy
              </Link>{" "}
              to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">11. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, GlycoGuide and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your use or inability to use the service</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any bugs, viruses, or other harmful code that may be transmitted to or through our service</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content posted, emailed, transmitted, or otherwise made available through the service</li>
            </ul>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">12. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless GlycoGuide and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with your access to or use of the service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">13. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario, Canada, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in Ontario, Canada, and you hereby consent to personal jurisdiction and venue therein.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">14. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Effective Date" above. Your continued use of GlycoGuide after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700"><strong>GlycoGuide Support</strong></p>
              <p className="text-gray-700">Email: support@glycoguide.app</p>
              <p className="text-gray-700">Location: Ontario, Canada</p>
            </div>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">16. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect and enforceable.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">17. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and GlycoGuide regarding your use of the service and supersede all prior agreements and understandings, whether written or oral, regarding such subject matter.
            </p>
          </section>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Read our{" "}
              <Link href="/privacy" className="text-[#86A873] hover:underline" data-testid="link-privacy">
                Privacy Policy
              </Link>
              {" "}to learn how we protect your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
