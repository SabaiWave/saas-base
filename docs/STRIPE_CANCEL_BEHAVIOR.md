# Stripe Subscription Cancellation Behavior

This document explains how subscription cancellations work in FocusFlow.

## Cancel Flow

### User Actions
1. User goes to `/dashboard/settings/billing`
2. Clicks "Manage Subscription" button
3. Redirected to Stripe Billing Portal
4. Clicks "Cancel subscription"
5. Chooses "Cancel at end of billing period"
6. Confirms cancellation

### What Happens

#### Immediate Effects (Stripe Portal)
- Stripe updates the subscription object
- Sets `cancel_at_period_end = true`
- Keeps `status = "active"` (subscription is still valid)
- Keeps `current_period_end` as the final date

#### Webhook Processing
Stripe sends `customer.subscription.updated` event to your webhook:

```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xxx",
      "status": "active",
      "cancel_at_period_end": true,
      "current_period_end": 1738886400  // Unix timestamp
    }
  }
}
```

Your webhook handler ([app/api/webhooks/stripe/route.ts:113-145](app/api/webhooks/stripe/route.ts#L113-L145)) processes this:

```typescript
await prisma.subscription.upsert({
  where: { stripeSubscriptionId: subscription.id },
  update: {
    status: subscription.status,              // "active"
    cancelAtPeriodEnd: subscription.cancel_at_period_end,  // true
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  },
  // ...
});
```

#### Database State After Cancel
```
subscriptions table:
- status: "active"
- cancel_at_period_end: true
- current_period_end: <future date>
```

#### Entitlements Behavior
User **keeps Plus benefits** until `current_period_end`:

```typescript
// lib/entitlements.ts
export async function getUserPlan(userId: string): Promise<"FREE" | "PLUS"> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "trialing"],  // Includes canceled-but-active subs
      },
    },
  });

  return subscription ? "PLUS" : "FREE";
}
```

**Key Point:** We check `status IN ("active", "trialing")` **regardless** of `cancel_at_period_end`. This means:
- ✅ User can still create unlimited projects
- ✅ User retains Plus access until end of period
- ✅ No immediate downgrade upon cancellation

#### UI Display
On `/dashboard/settings/billing`:

**If `cancel_at_period_end = true`:**
```
┌─────────────────────────────────────────┐
│ Subscription Ending                     │
│ Your Plus plan will end on Jan 15, 2026 │
│ You'll keep Plus benefits until then.   │
│ After that, you'll return to Free plan. │
└─────────────────────────────────────────┘
```

**If `cancel_at_period_end = false`:**
```
┌──────────────────────────┐
│ Subscription Status      │
│ active                   │
│ Renews on Jan 15, 2026   │
└──────────────────────────┘
```

### When Period Ends

On the `current_period_end` date, Stripe sends `customer.subscription.deleted`:

```json
{
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_xxx",
      "status": "canceled"
    }
  }
}
```

Webhook updates database:
```typescript
await prisma.subscription.update({
  where: { stripeSubscriptionId: subscription.id },
  data: { status: "canceled" },
});
```

Database state after period ends:
```
subscriptions table:
- status: "canceled"
- cancel_at_period_end: true (unchanged)
- current_period_end: <past date>
```

Now `getUserPlan()` returns `"FREE"` because status is not in `["active", "trialing"]`.

## Return URL Issue (Local Dev)

### Problem
After canceling in Stripe Billing Portal, user is not redirected back to the app.

### Root Cause
The Billing Portal doesn't trust the `return_url` if:
1. Domain not allowlisted in Stripe Dashboard
2. URL is localhost (local dev)
3. HTTPS required but using HTTP

### Solutions

#### For Local Development
Stripe Billing Portal may not redirect to `localhost` by default.

**Workaround:**
1. In Stripe Dashboard → Settings → Billing → Customer Portal
2. Add `http://localhost:3000` to "Allowed redirect URLs"
3. OR accept that users must manually navigate back during local testing

**Alternative:** Test with ngrok:
```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000

# Terminal 3 (use ngrok HTTPS URL)
stripe listen --forward-to https://abc123.ngrok.io/api/webhooks/stripe
```

Update `.env`:
```bash
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

Now the Billing Portal will redirect back over HTTPS.

#### For Production
In Stripe Dashboard → Settings → Billing → Customer Portal:
- Add your production domain to "Allowed redirect URLs"
- Example: `https://yourdomain.com/dashboard/settings/billing`

The return_url is already configured in [lib/stripe.ts:84](lib/stripe.ts#L84):
```typescript
return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`
```

## Testing Cancellation Flow

### Prerequisites
- Stripe CLI installed and authenticated
- Webhook listener running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Dev server running: `npm run dev`

### Steps
1. Create a Plus subscription (test card: `4242 4242 4242 4242`)
2. Verify in Prisma Studio:
   ```
   subscriptions:
   - status: "active"
   - cancel_at_period_end: false
   ```
3. Go to `/dashboard/settings/billing`
4. Click "Manage Subscription"
5. In Billing Portal, click "Cancel subscription"
6. Choose "Cancel at end of period"
7. Confirm

### Verify Webhook Received
In Terminal 2 (stripe listen):
```
--> customer.subscription.updated [evt_xxx]
<-- [200] POST http://localhost:3000/api/webhooks/stripe
```

### Verify Database Updated
```bash
npx prisma studio
```

Check `subscriptions` table:
```
- status: "active"              ✅
- cancel_at_period_end: true    ✅
- current_period_end: <future>  ✅
```

### Verify UI
1. Navigate back to `/dashboard/settings/billing`
2. Should see orange "Subscription Ending" banner
3. Dashboard still shows "PLUS" plan
4. Can still create unlimited projects

### Simulate Period End
```bash
# Trigger subscription deletion
stripe trigger customer.subscription.deleted
```

Verify:
- Database: `status = "canceled"`
- Dashboard: Shows "FREE" plan
- Project limit: Back to 3 projects

## Expected Behavior Summary

| State | `status` | `cancel_at_period_end` | User Plan | Project Limit | UI Message |
|-------|----------|------------------------|-----------|---------------|------------|
| Active sub | `"active"` | `false` | PLUS | Unlimited | "Renews on..." |
| Canceled (before end) | `"active"` | `true` | PLUS | Unlimited | "Ends on..." (orange) |
| After period ends | `"canceled"` | `true` | FREE | 3 | Upgrade CTA |
| Trialing | `"trialing"` | `false` | PLUS | Unlimited | "Renews on..." |

## Key Takeaways

1. **Cancel = Schedule Downgrade:** Cancellation schedules the downgrade but doesn't execute it immediately
2. **Access Retained:** Users keep Plus until `current_period_end`
3. **Status = Source of Truth:** We check subscription `status`, not `cancel_at_period_end`
4. **Webhook = Critical:** Database is updated by webhooks, not client actions
5. **Local Testing Limitation:** Billing Portal may not redirect back to localhost
