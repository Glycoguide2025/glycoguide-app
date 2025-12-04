import { Link } from "wouter";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function RefundPolicy() {
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
            <DollarSign className="w-6 h-6 text-[#86A873]" />
            <h1 className="text-xl font-bold text-[#86A873]" data-testid="text-page-title">
              Refund Policy
            </h1>
          </div>
          <p className="text-xs text-muted-foreground" data-testid="text-effective-date">
            Effective Date: October 13, 2025
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-4 text-sm">
          <section>
            <p className="text-gray-700 leading-relaxed">
              At GlycoGuide, we strive to provide exceptional value through our wellness platform. This Refund Policy outlines our policies regarding subscription payments and refunds.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">1. No Refunds Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All subscription fees for GlycoGuide are non-refundable. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Monthly subscription payments</li>
              <li>Annual subscription payments</li>
              <li>Upgrade fees between subscription tiers</li>
              <li>Partial periods of service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              By purchasing a subscription to GlycoGuide, you acknowledge and agree that all payments are final and non-refundable.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">2. Free Trial Period</h2>
            <p className="text-gray-700 leading-relaxed">
              We offer a free plan with basic features so you can explore GlycoGuide before committing to a paid subscription. We encourage you to use the free plan to determine if our platform meets your needs before upgrading to a Premium or Pro subscription.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">3. Cancellation Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While refunds are not available, you may cancel your subscription at any time:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Cancellations can be made through your account Settings page</li>
              <li>Upon cancellation, you will retain access to paid features until the end of your current billing period</li>
              <li>No further charges will be made after your current billing period ends</li>
              <li>Your account will automatically downgrade to the free plan when the paid period expires</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Important:</strong> Canceling your subscription does not entitle you to a refund for the current billing period or any previous billing periods.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">4. Billing and Payment</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Subscription fees are charged as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Monthly subscriptions:</strong> Billed on the same day each month</li>
              <li><strong>Annual subscriptions:</strong> Billed once per year on the anniversary of your subscription date</li>
              <li>All payments are processed securely through Stripe</li>
              <li>You are responsible for providing accurate payment information</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              If a payment fails, we will attempt to process it again. If payment continues to fail, your subscription may be suspended or downgraded to the free plan.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">5. Exceptions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In rare circumstances, we may consider refund requests on a case-by-case basis for the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Duplicate charges:</strong> If you were accidentally charged multiple times for the same subscription period</li>
              <li><strong>Technical errors:</strong> If a billing error on our part resulted in an incorrect charge</li>
              <li><strong>Service unavailability:</strong> If GlycoGuide experiences significant downtime preventing access to the platform</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To request a refund under these exceptional circumstances, please contact our support team at support@glycoguide.app with details of the issue. We will review your request and respond within 5-7 business days.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">6. Chargebacks and Disputes</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you initiate a chargeback or dispute with your payment provider without first contacting us:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your GlycoGuide account may be immediately suspended or terminated</li>
              <li>All data associated with your account may be permanently deleted</li>
              <li>You may be prohibited from creating a new account in the future</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We strongly encourage you to contact our support team first if you have any billing concerns or disputes. We are committed to resolving any legitimate issues fairly and promptly.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">7. Changes to Subscription Pricing</h2>
            <p className="text-gray-700 leading-relaxed">
              GlycoGuide reserves the right to change subscription pricing at any time. If we increase prices, we will provide at least 30 days advance notice via email. Existing subscribers will be able to continue at their current pricing for the remainder of their current billing period. The new pricing will apply upon renewal.
            </p>
          </section>

          <Separator className="my-4 bg-[#86A873]/20" />

          <section>
            <h2 className="text-lg font-semibold text-[#86A873] mb-3">8. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Refund Policy or need to discuss a billing issue, please contact us:
            </p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>GlycoGuide Support</strong></p>
              <p className="text-gray-700 mb-2">Email: support@glycoguide.app</p>
              <p className="text-gray-700 mb-2">Billing inquiries: billing@glycoguide.app</p>
              <p className="text-gray-700">Location: Ontario, Canada</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We aim to respond to all inquiries within 2-3 business days.
            </p>
          </section>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Review our{" "}
              <Link href="/terms" className="text-[#86A873] hover:underline" data-testid="link-terms">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[#86A873] hover:underline" data-testid="link-privacy">
                Privacy Policy
              </Link>
              {" "}for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
