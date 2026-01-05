# Troubleshooting Guide

Common issues and solutions for FocusFlow development.

## Stripe Integration Issues

### "Still showing FREE after successful checkout"

**Symptoms:**
- Completed Stripe checkout with test card
- Redirected to `/dashboard?success=true`
- Dashboard still shows "FREE" plan
- "Processing upgrade..." banner appears but plan doesn't change

**Root Cause:**
Stripe webhooks not reaching your local server, so the subscription was never created in the database.

**Solution:**

1. **Verify webhook listener is running:**
   ```bash
   # In a separate terminal:
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   You should see:
   ```
   > Ready! Your webhook signing secret is whsec_...
   ```

2. **Update webhook secret in .env:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
   ```
   Copy the secret from the `stripe listen` output.

3. **Restart dev server:**
   ```bash
   # Stop (Ctrl+C) and restart:
   npm run dev
   ```

4. **Test the checkout flow again:**
   - Go to `/pricing`
   - Click "Upgrade to Plus"
   - Complete checkout
   - Watch Terminal 2 for webhook events:
     ```
     --> checkout.session.completed [evt_xxx]
     <-- [200] POST http://localhost:3000/api/webhooks/stripe
     ```

5. **Verify database:**
   ```bash
   npx prisma studio
   ```
   Check:
   - `subscriptions` table should have a row with `status: "active"`
   - `stripe_customers` table should have your user
   - `stripe_events` table should show received events

---

### "Webhook signature verification failed"

**Error in logs:**
```
Webhook signature verification failed
```

**Cause:**
Webhook secret in `.env` doesn't match the current `stripe listen` session.

**Solution:**

Each time you run `stripe listen`, a new webhook secret is generated. You must:

1. Stop the current `stripe listen` (Ctrl+C)
2. Start a new session:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the NEW secret to `.env`
4. Restart your dev server

**Pro tip:** Keep Terminal 2 visible so you can see when webhooks arrive.

---

### "No webhook events received"

**Symptoms:**
- Checkout completes successfully
- Terminal 2 (stripe listen) shows no activity
- No logs in webhook terminal

**Possible causes:**

1. **Stripe CLI not authenticated:**
   ```bash
   stripe login
   ```

2. **Wrong forward URL:**
   Ensure you're using:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   NOT `127.0.0.1` or a different port.

3. **Test mode mismatch:**
   Ensure you're using test mode keys:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...  # NOT sk_live_
   ```

---

### "Customer not found" error in webhook logs

**Error:**
```
Customer not found: cus_xxx
```

**Cause:**
The `checkout.session.completed` event didn't create the customer mapping, or it wasn't processed first.

**Solution:**

The webhook now handles `checkout.session.completed` and creates the customer mapping automatically. If you still see this:

1. Check that you're using the latest webhook code (should include `checkout.session.completed` case)
2. Verify `client_reference_id` is set in checkout session
3. Clear old test data:
   ```bash
   npx prisma studio
   # Delete rows from stripe_customers, subscriptions, stripe_events
   ```
4. Test checkout flow again

---

### "Billing Portal doesn't redirect back after cancel"

**Symptoms:**
- Click "Manage Subscription" → opens Stripe Billing Portal
- Cancel subscription
- Portal doesn't redirect back to app
- Must manually navigate back

**Cause:**
Stripe Billing Portal doesn't trust localhost URLs by default.

**Solutions:**

1. **For local dev:** Accept that you must manually navigate back
   - After canceling, manually go to `http://localhost:3000/dashboard/settings/billing`
   - This is a Stripe limitation with localhost

2. **Use ngrok for testing:**
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   ngrok http 3000

   # Terminal 3 (use ngrok URL)
   stripe listen --forward-to https://abc123.ngrok.io/api/webhooks/stripe
   ```
   Update `.env`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```

3. **For production:** Add domain to Stripe Dashboard
   - Go to Stripe Dashboard → Settings → Billing → Customer Portal
   - Add your domain to "Allowed redirect URLs"
   - Example: `https://yourdomain.com/dashboard/settings/billing`

**See [STRIPE_CANCEL_BEHAVIOR.md](STRIPE_CANCEL_BEHAVIOR.md) for complete details.**

---

### "cancel_at_period_end not updating after cancel"

**Symptoms:**
- User cancels subscription in Billing Portal
- Database shows `cancel_at_period_end: false`
- No "Subscription Ending" notice in UI

**Cause:**
Webhook listener not running or webhook not processed.

**Solution:**

1. Verify webhook listener is running:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Cancel subscription again in Billing Portal

3. Watch Terminal 2 for webhook:
   ```
   --> customer.subscription.updated [evt_xxx]
   <-- [200] POST http://localhost:3000/api/webhooks/stripe
   ```

4. Verify database:
   ```bash
   npx prisma studio
   ```
   Check `subscriptions` table:
   - `status: "active"`
   - `cancel_at_period_end: true`

5. Refresh `/dashboard/settings/billing` - should show orange "Subscription Ending" banner

---

## Database Issues

### "Tables missing in Supabase"

**Error:**
```
Invalid `prisma.project.findMany()` invocation:
The table `public.projects` does not exist
```

**Solution:**
```bash
npx prisma migrate deploy
```

---

### "Prisma Client out of sync"

**Error:**
```
Prisma Client could not locate the Query Engine for runtime "darwin"
```

**Solution:**
```bash
npx prisma generate
```

---

## Authentication Issues

### "Unauthorized" errors on all pages

**Cause:**
Kinde Auth not configured or invalid credentials.

**Solution:**

1. Verify `.env` has Kinde credentials:
   ```bash
   KINDE_CLIENT_ID=your_client_id
   KINDE_CLIENT_SECRET=your_client_secret
   KINDE_ISSUER_URL=https://your-subdomain.kinde.com
   ```

2. Verify callback URLs in Kinde Dashboard match:
   - Allowed callback URLs: `http://localhost:3000/api/auth/kinde_callback`
   - Allowed logout redirect URLs: `http://localhost:3000`

3. Restart dev server

---

### "Redirect loop" at login

**Cause:**
Misconfigured redirect URLs.

**Solution:**

Check `.env`:
```bash
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard
```

Do NOT use trailing slashes.

---

## Build Issues

### "Type error: Cannot find module"

**Solution:**
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

---

### "Lint errors blocking build"

**Solution:**
```bash
npm run lint
# Fix reported errors, then:
npm run build
```

---

## Environment Variables

### "Missing environment variable" errors

**Checklist:**

Required variables:
```bash
# Database
DATABASE_URL=postgresql://...

# Kinde Auth
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From stripe listen
STRIPE_PRICE_ID_PLUS=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

After updating `.env`, restart the dev server.

---

## Getting Help

1. Check the logs:
   - Dev server terminal (Terminal 1)
   - Stripe webhook terminal (Terminal 2)
   - Browser console (F12)

2. Use Prisma Studio to inspect database:
   ```bash
   npx prisma studio
   ```

3. Test webhooks manually:
   ```bash
   stripe trigger checkout.session.completed
   ```

4. Review documentation:
   - [STRIPE_LOCAL_DEV.md](STRIPE_LOCAL_DEV.md)
   - [README.md](README.md)
   - [CLAUDE.md](CLAUDE.md)
