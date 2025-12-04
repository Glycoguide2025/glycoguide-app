import RegionSelection from "@/components/RegionSelection";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function RegionSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="mb-6 text-center">
        <Link href="/settings">
          <Button variant="ghost">
            ← Back to Settings
          </Button>
        </Link>
      </div>
      <RegionSelection onComplete={() => {
        window.location.href = '/settings';
      }} />
    </div>
  );
}
