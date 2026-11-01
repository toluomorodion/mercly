import { env } from '@/lib/env';

const FLW_API_BASE = 'https://api.flutterwave.com/v3';

type FlutterwavePaymentRequest = {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name?: string;
  };
  customizations: {
    title: string;
    description?: string;
    logo?: string;
  };
};

export async function createPaymentLink(payload: FlutterwavePaymentRequest) {
  const response = await fetch(`${FLW_API_BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to create payment link');
  }

  return data.data.link;
}

export async function verifyTransaction(transactionId: string) {
  const response = await fetch(`${FLW_API_BASE}/transactions/${transactionId}/verify`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Failed to verify transaction');
  }

  return data.data;
}
