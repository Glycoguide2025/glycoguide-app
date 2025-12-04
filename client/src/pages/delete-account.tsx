import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function DeleteAccount() {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: 'Please type "DELETE" exactly to confirm.',
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Implement actual account deletion API call
      toast({
        title: "Account deletion requested",
        description: "Your request has been received. Please contact support to complete the process.",
        variant: "destructive"
      });
      setConfirmText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            <CardTitle>Delete Account</CardTitle>
          </div>
          <CardDescription>
            This action cannot be undone and will permanently remove all your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm font-medium mb-2">What will be deleted:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>All meal logs and tracking data</li>
              <li>Wellness records and progress</li>
              <li>Account settings and preferences</li>
              <li>Active subscription (if any)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Type DELETE to confirm</Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== "DELETE"}
            >
              {isDeleting ? "Processing..." : "Delete Account"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Need help? Contact support instead at support@glycoguide.app
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
