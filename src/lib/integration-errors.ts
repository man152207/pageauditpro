// Standardized error handling for all integrations

export interface IntegrationError {
  error_code: string;
  human_message: string;
  fix_steps: readonly string[];
  is_config_issue: boolean;
  missing_keys?: readonly string[];
}

export const INTEGRATION_ERRORS: Record<string, IntegrationError> = {
  // Facebook errors
  FACEBOOK_NOT_CONFIGURED: {
    error_code: 'FACEBOOK_NOT_CONFIGURED',
    human_message: 'Facebook integration is not configured yet.',
    fix_steps: [
      'Contact your Super Admin to configure Facebook integration',
      'Super Admin: Go to Settings → Integrations → Facebook API',
      'Enter your Facebook App ID and App Secret',
      'Save the settings and try again'
    ],
    is_config_issue: true,
    missing_keys: ['facebook_app_id', 'facebook_app_secret']
  },

  // Stripe errors  
  STRIPE_NOT_CONFIGURED: {
    error_code: 'STRIPE_NOT_CONFIGURED',
    human_message: 'Stripe payment gateway is not configured.',
    fix_steps: [
      'Super Admin: Go to Settings → Payment → Stripe',
      'Enter your Stripe Secret Key and Webhook Secret',
      'Configure the webhook URL in Stripe Dashboard'
    ],
    is_config_issue: true,
    missing_keys: ['stripe_secret_key']
  },

  // PayPal errors
  PAYPAL_NOT_CONFIGURED: {
    error_code: 'PAYPAL_NOT_CONFIGURED',
    human_message: 'PayPal payment gateway is not configured.',
    fix_steps: [
      'Super Admin: Go to Settings → Payment → PayPal',
      'Enter your PayPal Client ID and Client Secret',
      'Configure the webhook URL in PayPal Developer Dashboard'
    ],
    is_config_issue: true,
    missing_keys: ['paypal_client_id', 'paypal_client_secret']
  },

  // eSewa errors
  ESEWA_NOT_CONFIGURED: {
    error_code: 'ESEWA_NOT_CONFIGURED',
    human_message: 'eSewa payment gateway is not configured.',
    fix_steps: [
      'Super Admin: Go to Settings → Payment → eSewa',
      'Enter your eSewa Merchant ID and Secret Key',
      'Verify your merchant account is active'
    ],
    is_config_issue: true,
    missing_keys: ['esewa_merchant_id', 'esewa_secret_key']
  },

  // Email errors
  EMAIL_NOT_CONFIGURED: {
    error_code: 'EMAIL_NOT_CONFIGURED',
    human_message: 'Email service is not configured.',
    fix_steps: [
      'Super Admin: Go to Settings → Integrations → Email Provider',
      'Enter your Resend API Key',
      'Verify your sending domain is configured in Resend'
    ],
    is_config_issue: true,
    missing_keys: ['resend_api_key']
  },

  // Auth errors
  AUTH_FAILED: {
    error_code: 'AUTH_FAILED',
    human_message: 'Authentication failed.',
    fix_steps: [
      'Check your email and password are correct',
      'If you forgot your password, use the reset option',
      'Try signing up if you don\'t have an account'
    ],
    is_config_issue: false
  },

  FACEBOOK_AUTH_FAILED: {
    error_code: 'FACEBOOK_AUTH_FAILED',
    human_message: 'Facebook login failed.',
    fix_steps: [
      'Make sure you allowed the app permissions',
      'Try clearing your browser cookies and try again',
      'If the issue persists, contact support'
    ],
    is_config_issue: false
  },

  // Report errors
  REPORT_GENERATION_FAILED: {
    error_code: 'REPORT_GENERATION_FAILED',
    human_message: 'Failed to generate report.',
    fix_steps: [
      'Make sure your Facebook page is still connected',
      'Try reconnecting your Facebook page',
      'If the issue persists, contact support'
    ],
    is_config_issue: false
  },

  // Generic
  UNKNOWN_ERROR: {
    error_code: 'UNKNOWN_ERROR',
    human_message: 'An unexpected error occurred.',
    fix_steps: [
      'Try refreshing the page',
      'If the issue persists, contact support'
    ],
    is_config_issue: false
  }
} as const;

export type IntegrationErrorCode = keyof typeof INTEGRATION_ERRORS;

export function getIntegrationError(code: IntegrationErrorCode): IntegrationError {
  return INTEGRATION_ERRORS[code] || INTEGRATION_ERRORS.UNKNOWN_ERROR;
}

export function createErrorResponse(code: IntegrationErrorCode, additionalInfo?: string) {
  const error = getIntegrationError(code);
  return {
    success: false,
    error: {
      ...error,
      additional_info: additionalInfo
    }
  };
}
