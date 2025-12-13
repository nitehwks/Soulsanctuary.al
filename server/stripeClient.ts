// BETA: Stripe disabled - all functions return errors
// Uncomment and reinstall stripe packages after beta

export async function getUncachableStripeClient(): Promise<any> {
  throw new Error('Stripe is disabled during beta. Use GoFundMe for donations.');
}

export async function getStripePublishableKey(): Promise<string> {
  throw new Error('Stripe is disabled during beta.');
}

export async function getStripeSecretKey(): Promise<string> {
  throw new Error('Stripe is disabled during beta.');
}

export async function getStripeSync(): Promise<any> {
  throw new Error('Stripe is disabled during beta.');
}
