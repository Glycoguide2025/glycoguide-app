import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function LoggedOut() {
  return (
    <div className="h-screen w-screen fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Logged Out</CardTitle>
          <CardDescription>
            You have been successfully logged out of GlycoGuide.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth">
            <Button 
              className="w-full bg-[#86A873] hover:bg-[#86A873]/90"
              data-testid="button-login-again"
            >
              Log in again
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
