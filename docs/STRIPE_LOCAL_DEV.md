# Stripe Local Development Guide

This guide explains how to test Stripe subscriptions locally with webhook support.

## Prerequisites

1. Install the Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   # or visit: https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

## Local Development Setup (CRITICAL)

To test Stripe checkout and subscriptions locally, you **MUST** run the webhook listener in a separate terminal.

### Step 1: Start Your Dev Server

In Terminal 1:
```bash
npm run dev
```

### Step 2: Start Stripe Webhook Forwarding (REQUIRED)

In Terminal 2:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**IMPORTANT:** The Stripe CLI will output a webhook signing secret that looks like:
```
> Ready! Your webhook signing secret is whsec_abc123xyz... (^C to quit)
```

### Step 3: Update Your .env

Copy the webhook secret from Terminal 2 and update your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
```

**NOTE:** This secret changes every time you run `stripe listen`. You must update `.env` each session.

### Step 4: Restart Dev Server (if needed)

If you updated the webhook secret, restart your dev server in Terminal 1:
```bash
# Ctrl+C to stop, then:
npm run dev
```

## Testing the Flow

1. Navigate to `http://localhost:3000/pricing`
2. Click "Upgrade to Plus"
3. Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
4. Complete checkout
5. You'll be redirected to `/dashboard?success=true`
6. In Terminal 2, you should see webhook events being received:
   ```
   --> checkout.session.completed
   --> customer.subscription.created
   <-- [200] POST http://localhost:3000/api/webhooks/stripe
   ```
7. Refresh the dashboard - you should now see "PLUS" plan

## Troubleshooting

### "Still showing FREE after checkout"

**Cause:** Webhook listener not running or webhook secret mismatch.

**Fix:**
1. Verify Terminal 2 is running `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Check Terminal 2 logs for incoming webhooks
3. Verify `STRIPE_WEBHOOK_SECRET` in `.env` matches the current session
4. Restart dev server after updating webhook secret

### "Webhook signature verification failed"

**Cause:** Webhook secret in `.env` doesn't match current `stripe listen` session.

**Fix:**
1. Stop `stripe listen` (Ctrl+C)
2. Restart `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the NEW webhook secret to `.env`
4. Restart dev server

### "No webhook events in Terminal 2"

**Cause:** Stripe CLI not authenticated or incorrect forward URL.

**Fix:**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Database Verification

Check if the subscription was created:

```bash
npx prisma studio
```

Then inspect:
- `stripe_customers` table - Should have a row with your userId
- `subscriptions` table - Should have a row with status "active" or "trialing"
- `stripe_events` table - Should show received webhook events

## Production Deployment

In production, you don't use `stripe listen`. Instead:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

## Common Commands

```bash
# Test webhook locally
stripe trigger checkout.session.completed

# List recent events
stripe events list --limit 10

# View specific event
stripe events retrieve evt_xxx

# Forward webhooks (run in separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Workflow Checklist

Every local dev session:
- [ ] Terminal 1: `npm run dev`
- [ ] Terminal 2: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Copy webhook secret from Terminal 2 to `.env`
- [ ] Restart Terminal 1 if you updated `.env`
- [ ] Test checkout flow
- [ ] Verify webhook events in Terminal 2
- [ ] Verify subscription in Prisma Studio
