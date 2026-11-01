# Flutterwave Integration Skill

Load this skill for any task that touches Flutterwave: creating payment links, verifying transactions, handling webhooks, or debugging payment flows. Do not write Flutterwave code from memory. Flutterwave's API changes, and this skill is the source of truth for how SellSnap uses it.

## What Flutterwave Does for SellSnap

Flutterwave is our payment gateway. It does three things for us:

1. **Hosts the checkout page.** When a buyer clicks "Pay Now," we hand them off to Flutterwave's hosted checkout. We never collect card details in our own UI. This keeps us out of PCI compliance scope.
2. **Processes the payment.** Flutterwave charges the card, handles 3D Secure, handles bank transfers, and settles the money.
3. **Notifies us via webhook.** When a payment succeeds or fails, Flutterwave sends a webhook to our server. The webhook is how we know the truth.

## API Version

SellSnap uses the **Flutterwave v3 API** (`https://api.flutterwave.com/v3/`). Flutterwave has released v4, but v3 remains supported with no announced deprecation date. Do not mix v3 and v4 calls in the same integration. If a future migration to v4 is requested, treat it as a separate project — the endpoint shapes and webhook signature mechanism differ.

## The Payment Flow End to End

```
Buyer clicks "Pay Now"
        |
        v
POST /api/orders (creates pending Order, amount in kobo)
        |
        v
Server calls Flutterwave "create payment link" endpoint (via lib/flutterwave.ts)
        |
        v
Server returns hosted checkout URL to the browser
        |
        v
Browser redirects to Flutterwave
        |
        v
Buyer pays on Flutterwave's page
        |
        v
Flutterwave redirects buyer to /p/[slug]/success (untrusted, display only)
        |
        v
Flutterwave sends webhook to /api/webhooks/flutterwave (TRUSTED)
        |
        v
Webhook handler verifies signature, verifies transaction via API, marks Order paid
        |
        v
Seller notified via dashboard + email
```

The key insight: the browser redirect and the webhook are two different things. The browser redirect is just a UX signal to tell the buyer "we are checking your payment." The webhook is what actually updates the database.

## Environment Variables

Flutterwave needs three keys. These names match `security.md` and `lib/env.ts` — do not invent new ones:

```
FLW_PUBLIC_KEY         Safe to expose. Used in client-side Flutterwave widgets if we ever use them.
FLW_SECRET_KEY         Server-only. Used to call the Flutterwave API. Never log it.
FLW_SECRET_HASH        Server-only. Used to verify incoming webhooks. Never log it.
```

Get the keys from the Flutterwave dashboard under the Developer section. In development, use test keys. In production, use live keys. The secret hash is something you set yourself in the Flutterwave dashboard under Settings > Webhooks; choose a long random string and paste it into both the dashboard and your environment variables.

All Flutterwave keys are accessed through the validated env getter in `lib/env.ts`, not by reading `process.env` inline.

## The Flutterwave Wrapper

All Flutterwave API calls go through `lib/flutterwave.ts`. This wrapper:
- Reads `FLW_SECRET_KEY` from `lib/env.ts` and sets the `Authorization` header.
- Handles HTTP errors and retries on transient failures.
- Exposes typed methods: `createPaymentLink()`, `verifyTransaction()`.

Do not make raw `fetch` calls to the Flutterwave API from route handlers. Use the wrapper.

## Creating a Payment Link

When a buyer hits "Pay Now," we create a pending order and request a payment link from Flutterwave. The Flutterwave endpoint is `POST https://api.flutterwave.com/v3/payments`. We send a JSON body:

```json
{
  "tx_ref": "sellsnap_<ORDER_ID>_<RANDOM>",
  "amount": "5000",
  "currency": "NGN",
  "redirect_url": "https://sellsnap.app/p/<slug>/success?tx_ref=<tx_ref>",
  "customer": {
    "email": "buyer@example.com",
    "name": "Buyer Name"
  },
  "customizations": {
    "title": "<Seller business name>",
    "description": "<Product name>",
    "logo": "https://sellsnap.app/logo.png"
  },
  "meta": {
    "order_id": "<ORDER_ID>",
    "product_id": "<PRODUCT_ID>",
    "seller_id": "<SELLER_ID>"
  }
}
```

With the header `Authorization: Bearer ${FLW_SECRET_KEY}`.

Notes:
- `tx_ref` must be unique per payment attempt. Use the pattern `sellsnap_<ORDER_ID>_<RANDOM>` where RANDOM is from `crypto.randomUUID()`. Save it to the `Order` record before making the request.
- `amount` is in the major unit (naira), not kobo, for this specific Flutterwave endpoint. Convert from your internal kobo representation: `String(order.amount / 100)`. Flutterwave accepts both string and number for amount, but the docs use string — follow that convention. This is the one place we go major-unit; everywhere else we stay in kobo. Double-check the conversion.
- `currency` is always `NGN` at launch.
- `meta` fields come back in the webhook, which makes reconciliation easier.
- `redirect_url` includes the `tx_ref` so the success page can show "verifying..." while waiting for the webhook.

The response looks like:

```json
{
  "status": "success",
  "message": "Hosted Link",
  "data": { "link": "https://checkout.flutterwave.com/v3/hosted/pay/..." }
}
```

Return `data.link` to the browser. Redirect the buyer there.

## Verifying a Transaction

After receiving a webhook, call the Flutterwave verify endpoint to confirm the payload is real. Do not trust the webhook body alone, even after signature verification.

```
GET https://api.flutterwave.com/v3/transactions/{transaction_id}/verify
Authorization: Bearer ${FLW_SECRET_KEY}
```

The response includes the transaction's real status, amount, currency, and `tx_ref`. Compare them to what you have stored. Only mark the order paid if:

1. `data.status === 'successful'`
2. `data.currency === 'NGN'` (the only currency we support at launch)
3. `Number(data.amount) * 100 === order.amount` (Flutterwave reports amount in naira; multiply by 100 to compare against kobo stored in the database)
4. `data.tx_ref === order.transactionReference`

If any check fails, log a warning and do not mark the order paid. Respond 200 to the webhook anyway so Flutterwave does not keep retrying a known bad payload.

## Webhook Handling

The webhook handler lives at `app/api/webhooks/flutterwave/route.ts`. It must follow this sequence:

### Step 1: Verify the webhook signature

Flutterwave sends the signature in the `flutterwave-signature` header. Verify it using HMAC-SHA256:

```ts
import crypto from 'node:crypto';

function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash) return false;
  const computed = crypto.createHmac('sha256', secretHash).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}
```

If the signature is missing or does not match, reject with 401 immediately. Do not process the payload.

Note: older Flutterwave docs reference a `verif-hash` header with plain string comparison. That is the deprecated v2 approach. Use `flutterwave-signature` with HMAC verification as shown above.

### Step 2: Parse the payload

Extract the `transaction_id` (or `data.id`) and `tx_ref` from the webhook body.

### Step 3: Call the verify endpoint

Call `GET /v3/transactions/{transaction_id}/verify` with the `FLW_SECRET_KEY`. This confirms the transaction actually exists on Flutterwave's side.

### Step 4: Reconcile against the stored Order

Compare the verification response against the `Order` record:
- Status is `successful`
- Amount matches (remember: Flutterwave returns naira, we store kobo)
- Currency is `NGN`
- `tx_ref` matches `order.transactionReference`

### Step 5: Update in a single transaction

Inside a Prisma transaction:
1. Update the `Order` status to `paid`.
2. Create a `Payment` record with `gatewayReference` (Flutterwave's transaction ID), `status`, and `paidAt`.

Only allow `pending → paid` and `pending → failed` transitions. Never overwrite an already `paid` order.

### Step 6: Handle idempotency

Let the unique constraint on `Payment.gatewayReference` catch duplicates. Catch the Prisma `P2002` error and respond 200 without reprocessing. Do not mark the order paid twice, do not send two emails, do not notify the seller twice.

### Step 7: Respond quickly

Respond 200 to Flutterwave as soon as the database update is complete. Heavy work like sending seller notification emails goes in a background job, not in the webhook response path.

## OrderStatus Transitions

The `Order` model uses the `OrderStatus` enum (`pending | paid | failed`). Valid transitions:

- `pending → paid`: payment confirmed via webhook
- `pending → failed`: payment explicitly failed
- Any other transition is invalid and should be rejected

Never change an order from `paid` back to `pending` or `failed`. If a refund is needed in the future, add a new status (e.g., `refunded`) rather than reusing an existing one.

## Testing

Flutterwave's test mode supports test cards documented at their developer docs. The two you need most often:
- Successful charge: `4187427415564246` (test PIN `3310`, OTP `12345`).
- Failed charge: `5258584131808179`.

Always verify end-to-end with the test keys before shipping any payment-related change. Do not rely on unit tests alone; the bug is almost always in the integration.

## Common Mistakes

- Storing amounts as floats. Stay in integer kobo in the database, convert to naira only when calling Flutterwave.
- Trusting the browser redirect. The redirect is not proof of payment.
- Skipping the verify API call. The webhook signature proves the request came from someone who knows the secret hash; calling verify proves the transaction actually exists and succeeded.
- Forgetting idempotency. Flutterwave can retry webhooks. Duplicates must be no-ops.
- Logging the secret key or the webhook body with sensitive fields. Strip before logging.
- Using Paystack patterns. SellSnap is on Flutterwave; ignore anything in old PRDs or references that say Paystack.
- Using the deprecated `verif-hash` header for webhook verification. Use `flutterwave-signature` with HMAC-SHA256.
- Forgetting to convert kobo to naira when calling Flutterwave, or forgetting to convert back when reconciling.
- Making raw `fetch` calls to Flutterwave instead of using `lib/flutterwave.ts`.
