/**
 * Environment Variable Verification
 * Ensures all required secrets are present before app starts
 */

interface EnvCheck {
  key: string;
  required: boolean;
  description: string;
}

const REQUIRED_ENV_VARS: EnvCheck[] = [
  // Authentication
  { key: 'SESSION_SECRET', required: false, description: 'Session encryption secret (auto-generated if missing)' },
  { key: 'REPLIT_DOMAINS', required: false, description: 'Allowed domains for auth callbacks' },
  { key: 'REPL_ID', required: false, description: 'Replit application ID' },
  { key: 'ISSUER_URL', required: false, description: 'OIDC issuer URL (auto-configured in Replit)' },
  
  // Database
  { key: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },
  
  // Stripe Payment
  { key: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe API secret key' },
  { key: 'STRIPE_PREMIUM_CARE_PRICE_ID', required: false, description: 'Premium plan price ID' },
  { key: 'STRIPE_CARE_PLAN_PRICE_ID', required: false, description: 'Pro plan price ID' },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook signing secret' },
  { key: 'VITE_STRIPE_PUBLIC_KEY', required: false, description: 'Stripe publishable key' },
  
  // SendGrid Email (optional in dev, required in production)
  { key: 'SENDGRID_API_KEY', required: false, description: 'SendGrid API key for emails' },
  { key: 'SENDGRID_FROM', required: false, description: 'SendGrid sender email' },
  { key: 'EMAIL_TEST_ALLOWLIST', required: false, description: 'Allowed email recipients (dev)' },
  
  // App Configuration
  { key: 'APP_URL', required: false, description: 'Application base URL' },
];

export function verifyEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log('\n🔍 Verifying Environment Variables...\n');
  
  for (const check of REQUIRED_ENV_VARS) {
    const value = process.env[check.key];
    
    if (!value) {
      if (check.required) {
        errors.push(`❌ MISSING REQUIRED: ${check.key} - ${check.description}`);
      } else {
        warnings.push(`⚠️  MISSING OPTIONAL: ${check.key} - ${check.description}`);
      }
    } else {
      // Validate format for specific keys (warnings only, not blocking)
      if (check.key === 'STRIPE_PREMIUM_CARE_PRICE_ID' || check.key === 'STRIPE_CARE_PLAN_PRICE_ID') {
        if (!value.startsWith('price_')) {
          warnings.push(`⚠️  FORMAT WARNING: ${check.key} should start with 'price_' (got: ${value.substring(0, 10)}...)`);
        }
      }
      
      if (check.key === 'STRIPE_WEBHOOK_SECRET') {
        if (!value.startsWith('whsec_')) {
          warnings.push(`⚠️  FORMAT WARNING: ${check.key} should start with 'whsec_' (got: ${value.substring(0, 10)}...)`);
        }
      }
      
      if (check.key === 'SENDGRID_API_KEY') {
        if (!value.startsWith('SG.')) {
          warnings.push(`⚠️  INVALID FORMAT: ${check.key} should start with 'SG.' (got: ${value.substring(0, 10)}...)`);
        }
      }
      
      console.log(`✅ ${check.key}: Set`);
    }
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`   ${w}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Critical Errors:');
    errors.forEach(e => console.log(`   ${e}`));
    console.log('\n🚨 Application cannot start with missing required environment variables!');
    console.log('📝 Please configure these in your Deployment Secrets settings.\n');
  } else {
    console.log('\n✅ All required environment variables are configured!\n');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
