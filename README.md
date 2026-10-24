# WearShop

Luxury wristwatch store built with Next.js 16 (App Router), Firebase (Auth, Firestore, Storage) and Bachs payments.

- **Live:** https://wearshop-eosin.vercel.app (Vercel project `wearshop`, auto-deploys every push to `main`)
- **Firebase project:** `wearshop-a4079`
- **Bachs webhook URL:** `https://wearshop-eosin.vercel.app/api/webhooks/bachs`

- **Customers** browse watches, add them to a cart, sign in with Google, pay through Bachs, and track every delivery update from their dashboard.
- **Managers** upload products with several photos at once, see revenue sold and stock left, restock, and move orders through delivery. Each update sends the customer a notification.

## Project structure

```
app/                     Routes (each page is a thin wrapper around a component)
  page.js                /            Homepage with the intro animation
  shop/                  /shop, /shop/[id]
  cart/, checkout/       /cart, /checkout, /checkout/success
  auth/login, register   Google sign-in and sign-up
  dashboard/             /dashboard   Customer or manager view, chosen by role
  api/checkout           Creates the order and the Bachs checkout session (server)
  api/checkout/verify    Asks Bachs whether a checkout was paid (success-page fallback)
  api/webhooks/bachs     Bachs webhook: marks orders paid, updates stock, notifies customers
components/              Page sections and shared UI (home/, shop/, checkout/, dashboard/, ui/ …)
lib/
  firebase.js            Firebase client SDK setup
  firebase-actions.js    Every browser-side read and write to Firebase
  server/                Server-only code: Firebase Admin, Bachs client, order logic
  config.js              Currency, collections, order statuses, formatting
  hooks.js               Live-data React hooks built on firebase-actions
styles/                  Shared stylesheets (tokens, components, animations, page styles)
images/                  Static images used by the site
scripts/                 Admin scripts: seed sample products, promote a manager
firestore.rules, storage.rules, firestore.indexes.json
```

## Starter catalogue

`lib/catalog-data.json` lists 90 starter watches; their photos are in `images/products/`. After Firebase is set up, `npm run seed` uploads the photos to Firebase Storage and creates the products in Firestore. The photos are from [Unsplash](https://unsplash.com) (free Unsplash License); each product's photographer is listed under `credit` in the JSON. Some show real watch brands' logos, so replace them with your own product photos before launch.

## 1. Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Google**. Under Settings → Authorized domains, add your production domain.
3. **Firestore Database** → create a database (production mode).
4. **Storage** → get started.
5. Project settings → **Your apps** → add a Web app and copy its config into `.env.local` (see below).
6. Project settings → **Service accounts** → *Generate new private key*. Copy `project_id`, `client_email` and `private_key` into the `FIREBASE_ADMIN_*` variables. Never commit this key.
7. Deploy the rules and indexes with the Firebase CLI:

   ```bash
   npx firebase-tools login
   npx firebase-tools use --add
   npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
   ```

   The Storage rules read the user's role from Firestore. The first deploy asks you to allow that; answer yes.

## 2. Bachs setup

1. In the Bachs dashboard developer section, create a **sandbox** secret key (`sk_sandbox_…`).
2. Add a webhook destination pointing at `https://<your-domain>/api/webhooks/bachs` and subscribe to `checkout.completed`, `checkout.expired`, `collection.succeeded`, `collection.failed` and `collection.underpaid`. Copy its signing secret.
3. Put both in `.env.local`. To go live, swap in an `sk_live_` key, set `BACHS_API_BASE=https://api.bachs.io`, and use the live webhook's secret.

While developing on localhost, Bachs can't reach your webhook. The success page calls `/api/checkout/verify`, which asks Bachs directly, so payments still confirm. To test the webhook itself, expose your dev server with a tunnel (for example `cloudflared` or `ngrok`) and use that URL as the destination.

## 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in every value. `NEXT_PUBLIC_CURRENCY` must be a currency Bachs supports for your account (for example `USD` or `NGN`). `NEXT_PUBLIC_SITE_URL` is used for the Bachs return URLs.

## 4. Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Make yourself a manager

Sign in on the site once with Google, then:

```bash
npm run make-manager -- you@gmail.com
```

Reload `/dashboard` to see the manager view. You can also set `role: "manager"` on your `users/{uid}` document in the Firestore console.

After that, managers give other people access from **Dashboard → Team**. The person must have signed in once with Google.

| Role | Can |
|---|---|
| **Manager** | Everything: add, edit, restock and delete products; see revenue; update orders; manage the team |
| **Staff** | View products (including drafts and stock) and update orders, which notifies the customer. Can't change products, see revenue or manage the team |
| **Customer** | Shop, pay and track their own orders |

Role changes go through `/api/team`, which checks the caller is a manager. The store always keeps at least one manager, and nobody can change their own role. The Firestore rules enforce the same limits.

### Load the starter catalogue

```bash
npm run seed
```

This uploads the 90 starter watches and their photos to Firebase Storage and Firestore. It's safe to run again; existing products are skipped. The store shows no products until this has run (or the manager adds some).

## How payments flow

1. The customer presses **Pay** on `/checkout`. The browser sends the cart and delivery details, plus their Firebase ID token, to `POST /api/checkout`.
2. The server re-prices the cart from Firestore, checks stock, creates the order as `pending_payment`, and creates a Bachs checkout session for the total. The browser is redirected to Bachs.
3. After paying, Bachs sends the customer to `/checkout/success?orderId=…`, and sends a signed webhook to `/api/webhooks/bachs`.
4. Either path calls `markOrderPaid`, which runs once per order: it marks the order paid, reduces stock, records units sold, clears the saved cart, and notifies the customer.
5. The manager moves the order through *Packed → In transit → Out for delivery → Delivered*. Each step writes a timeline entry and a notification.

Prices, stock and payment status are only ever written by the server. The Firestore rules block the browser from creating orders or marking them paid.

## Deploying

Deployed on Vercel from GitHub (`dha-stix/wearshop`): every push to `main` goes live. Environment variables live in the Vercel project settings (Production). `firebase-admin` is pinned to v13 because v14's dependencies (jose 6, ES-module only) can't be loaded by Vercel's Node runtime.

To use another host or domain:

Any Node host that runs Next.js works (Vercel, Firebase App Hosting, Render…). Add the same environment variables in the host's dashboard, then update `NEXT_PUBLIC_SITE_URL`, the Firebase authorized domains and the Bachs webhook URL to the production domain.
