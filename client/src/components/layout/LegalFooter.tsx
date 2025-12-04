import { Link } from "wouter";

export default function LegalFooter() {
  return (
    <footer className="hidden md:block bg-[#F9F9F9] border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center text-[#4B5320] text-xs">
          <span>© 2025 GlycoGuide</span>
          <span className="mx-2">|</span>
          <Link 
            href="/terms" 
            className="hover:underline"
            data-testid="footer-link-terms"
          >
            Terms of Service
          </Link>
          <span className="mx-2">|</span>
          <Link 
            href="/privacy" 
            className="hover:underline"
            data-testid="footer-link-privacy"
          >
            Privacy Policy
          </Link>
          <span className="mx-2">|</span>
          <Link 
            href="/refund-policy" 
            className="hover:underline"
            data-testid="footer-link-refund"
          >
            Refund Policy
          </Link>
          <span className="mx-2">|</span>
          <a 
            href="mailto:support@glycoguide.app" 
            className="hover:underline"
            data-testid="footer-link-support"
          >
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
}
