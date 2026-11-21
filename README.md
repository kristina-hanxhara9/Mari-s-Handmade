# Mari's Handmade

Shop website for Mari's Handmade candles. React + Vite, hosted on **Netlify**, with:

- **Supabase**: products, orders, site images, admin login, image uploads
- **Stripe**: card payments (prices are checked on the server)
- **Resend** (optional): "new order" email to the shop owner. Customers get Stripe's own receipt.

Without any keys the site still runs: the shop shows the starter catalogue from `data.ts`, checkout says payments are being set up, and the admin page says it isn't connected yet.

## Run locally

```bash
npm install
npm run dev          # site only, http://localhost:3001
npx netlify dev      # site + payment functions (needs keys in .env.local)
```

Copy `.env.example` to `.env.local` and fill in the keys.

## One-time setup

### 1. Supabase (database + admin login)
1. Create a project at supabase.com using the shop's email.
2. **Authentication → Users → Add user**: the admin's email and a strong password.
3. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
4. Open `supabase-schema.sql`, replace `admin@example.com` with the admin's email, then paste it into **SQL Editor** and run it. This creates the tables, the security rules, the image bucket and the 12 starter products.
5. **Project Settings → API**: copy the Project URL, the `anon` key and the `service_role` key.

### 2. Stripe (payments)
1. In stripe.com, while in **test mode**, copy the publishable key (`pk_test_…`) and secret key (`sk_test_…`).
2. **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
   - Event: `payment_intent.succeeded`
   - Copy the signing secret (`whsec_…`).
3. **Settings → Customer emails**: turn on "Successful payments" so customers get a receipt.
4. When a test order works end to end, repeat with the live keys.

### 3. Resend (optional order notifications)
Create an API key at resend.com. Until you verify a domain there, it can only send to your own Resend account email, so set `ADMIN_EMAIL` to that address.

### 4. Netlify
1. **Add new site → Import from Git →** this GitHub repo. The build settings come from `netlify.toml`.
2. **Site configuration → Environment variables**: add every name from `.env.example`.
3. **Deploys → Trigger deploy**. (`VITE_` variables are baked in at build time, so redeploy after changing them.)

## Admin
Go to `/#/admin` (or the "Admin Portal" link in the footer) and sign in with the Supabase admin user. From there you can:
- add, edit and delete products, change prices, and upload photos
- hide a product by unticking "In stock"
- see orders and change their status
- change the homepage images (press **Save Site Settings**)

Changes are live for every visitor straight away.

## Test checklist
- Pay with Stripe test card `4242 4242 4242 4242` (any future date, any CVC). The order should appear under Admin → Orders, and the owner email should arrive.
- Change a price in Admin, then refresh the shop in a private window: the new price shows and is what Stripe charges.
