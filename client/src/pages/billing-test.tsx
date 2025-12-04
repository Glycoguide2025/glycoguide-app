import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BillingStatus {
  plan: string;
  subscriptionId?: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  cached: boolean;
}

export default function BillingTest() {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBillingStatus = async () => {
    setLoading(true);
    try {
      const start = Date.now();
      const res = await fetch('/api/billing/status', { credentials: 'include' });
      const data = await res.json();
      const duration = Date.now() - start;
      
      setBillingStatus(data);
      addResult(`Billing status fetched in ${duration}ms, cached: ${data.cached}`);
    } catch (error: any) {
      addResult(`Billing status error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCsvExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/export/csv', { credentials: 'include' });
      if (res.status === 402) {
        addResult(`✅ CSV Export blocked with 402 UPGRADE_REQUIRED (correct!)`);
      } else if (res.ok) {
        addResult(`✅ CSV Export allowed (user has premium access)`);
      } else {
        addResult(`❌ CSV Export failed with ${res.status}`);
      }
    } catch (error: any) {
      addResult(`CSV export error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCheckout = async (plan: 'premium' | 'pro') => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          tier: plan
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        addResult(`✅ Checkout URL created: ${data.url ? 'Success' : 'Failed'}`);
        if (data.url) {
          window.open(data.url, '_blank');
        }
      } else {
        addResult(`❌ Checkout failed with ${res.status}`);
      }
    } catch (error: any) {
      addResult(`Checkout error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/products', { credentials: 'include' });
      const data = await res.json();
      addResult(`✅ Products loaded: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addResult(`Products error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Billing System Test - Drop 1 Proof
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Testing cache, plan gating, checkout flow
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Billing Status</CardTitle>
          </CardHeader>
          <CardContent>
            {billingStatus ? (
              <div className="space-y-2">
                <div>Plan: <Badge>{billingStatus.plan}</Badge></div>
                <div>Status: <Badge variant="outline">{billingStatus.status}</Badge></div>
                <div>Cached: <Badge variant={billingStatus.cached ? "secondary" : "default"}>
                  {billingStatus.cached ? "Yes" : "No"}
                </Badge></div>
                {billingStatus.subscriptionId && (
                  <div>Subscription: {billingStatus.subscriptionId}</div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Click "Test Billing Status" to load</p>
            )}
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Drop 1 Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={testBillingStatus} disabled={loading}>
                Test Billing Status (Cache Test)
              </Button>
              <Button onClick={testCsvExport} disabled={loading} variant="outline">
                Test CSV Export (Plan Gate)
              </Button>
              <Button onClick={testProducts} disabled={loading} variant="outline">
                Test Products
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => testCheckout('premium')} disabled={loading} variant="secondary">
                Test Premium Checkout
              </Button>
              <Button onClick={() => testCheckout('pro')} disabled={loading} variant="secondary">
                Test Pro Checkout
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Instructions: 1) Test billing status twice (15m cache) 2) Test CSV export (402 for free) 3) Test checkout flow
            </p>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length > 0 ? (
              <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
                {testResults.map((result, i) => (
                  <div key={i} className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    {result}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No test results yet</p>
            )}
            {testResults.length > 0 && (
              <Button 
                onClick={() => setTestResults([])} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Clear Results
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}