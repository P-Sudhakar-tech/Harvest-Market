# Harvest Market — full-stack farmers marketplace starter

A responsive Next.js marketplace starter for multiple local farmers. Includes a produce storefront, farmer profiles, basket, validated order-request API, Prisma data model, seeded sample data, and API-key-protected starter admin endpoints.

## Stack

- Next.js App Router + React + TypeScript
- Prisma ORM + SQLite for local development
- Zod request validation
- INR pricing (prices stored as integer paise)
- CSS responsive layout

## Requirements

Node.js 20.9+ and npm.

## Run locally

```bash
npm install
cp .env.example .env
```

Set a long random `ADMIN_API_KEY` in `.env`, then:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

If `cp` is unavailable on Windows, copy `.env.example` to `.env` manually. SQLite database is created by Prisma according to `DATABASE_URL`.

## Included routes

- `GET /api/products` — active products; supports `?category=Vegetables&search=tomato`
- `POST /api/orders` — validates customer data and basket, checks stock, creates an order and decrements inventory transactionally
- `POST /api/admin/products` — create product with `x-admin-api-key` header
- `GET /api/admin/orders` — read up to 100 recent orders with `x-admin-api-key` header

Example product request (replace the farmer ID with a real ID from your local database):

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H 'Content-Type: application/json' \
  -H 'x-admin-api-key: YOUR_ADMIN_API_KEY' \
  -d '{"name":"Fresh okra","description":"Picked this morning","category":"Vegetables","pricePaise":4500,"unit":"kg","image":"https://example.com/okra.jpg","stock":20,"farmerId":"FARMER_ID","featured":false}'
```

Prices are in paise: `4500` means ₹45.00.

## Important production work before launch

This is a practical starter, not a production-ready commerce deployment.

1. **Payments are not wired up.** The checkout creates an order request with `PENDING_PAYMENT`; it does not collect money. Integrate Razorpay (or another supported provider) on the server, create payment orders server-side, verify provider signatures server-side, and only mark an order paid after verified webhook/callback confirmation. Never trust a browser-only success flag.
2. **Authentication and roles:** replace the shared admin API key with real customer, farmer, and administrator authentication, session protection, role-based access control, and audit logs. The API key protects the included admin routes only; do not put it in frontend code.
3. **Database:** SQLite is for local development. Use PostgreSQL or another managed production database before deploying with multiple app instances.
4. **Inventory:** review reservation/stock policies, refunds, cancellation and restocking. Use database constraints and concurrency-safe transaction logic appropriate to the production database.
5. **Delivery:** define serviceable PIN codes, fees, cut-off times, delivery slots, failed-delivery policy, and tracking. Current starter sets delivery fee to zero and displays it as awaiting confirmation.
6. **Marketplace settlement:** model commissions, farmer payouts, tax invoices, refunds, disputes, and per-farmer fulfilment. Payment-provider marketplace features may require approval and onboarding.
7. **Operations:** add image upload/storage, email/SMS order notifications, monitoring, backups, rate limiting, privacy/terms/refund pages, and accessibility testing.
8. **Images:** demo product photos use remote Unsplash URLs. Replace with your own licensed images and a managed image service before launch.

## Suggested next milestone

Build secure sign-in and separate admin/farmer dashboards, then connect the payment provider in test mode. Do not accept real payments until webhook verification, refunds, order state transitions and deployment secrets are tested.
