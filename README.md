# FreePlus — Health & Wellness Shopping, All-India (Demo)

Built in honour of **DHEVADHARSHAN G**. "Welcome to all" — the rolling
banner and hero heading — is FreePlus's greeting to every shopper, from
any pincode in India.

## What's included

**Frontend** — `index.html`, `style.css`, `script.js`
- Rolling "Welcome to all" announcements ticker, editorial Fraunces + Inter type pairing, dot-textured background, and a hero motif — a distinct look rather than a generic template
- Login / Register modal, with an account menu (My Orders / Log out) once signed in
- Category filters (7 categories), search, sort (price/rating)
- Paginated product grid backed by a large database
- Cart drawer + real checkout that creates a persisted order (tied to your account if logged in)
- Order history modal
- Live pincode delivery checker

**Backend** — `backend/`
- `database.py` — SQLAlchemy models (`User`, `Product`, `Order`, `OrderItem`) and a
  generator that seeds **~900 realistic OTC products** into SQLite
  (`freeplus.db`), built from real Indian OTC brands × item types × pack
  sizes across 7 categories: pain relief, vitamins, first aid, devices,
  personal care, baby care, elder care.
- `app.py` — Flask REST API:
  - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` — account system with hashed passwords
  - `GET /api/products` — paginated, searchable, sortable, filterable by category
  - `GET /api/products/<id>` — single product
  - `GET /api/categories` — categories with item counts
  - `GET/POST /api/cart`, `DELETE /api/cart/<id>` — session cart
  - `POST /api/checkout` — turns the cart into a persisted `Order`
  - `GET /api/orders`, `GET /api/orders/<id>` — order history
  - `GET /api/pincode/<code>` — **live** internet lookup via India Post's
    public API (`api.postalpincode.in`) to check delivery areas

## Running it locally

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The first run auto-creates and seeds `freeplus.db` with the full catalog
(you'll see "Seeded 900+ products..." printed once). The API runs on
`http://localhost:5000`.

Then open `index.html` in your browser — it talks to the API for every
product, cart, checkout, and pincode action.

To rebuild the catalog from scratch, delete `backend/freeplus.db` and
restart `app.py`.

## Deploying it

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for local dev, a one-command
Docker deployment (Nginx + gunicorn, included and ready to go), and cloud
platform options.

## Important — before this could sell real medicines

This remains a demo/starter template, not a launch-ready pharmacy:
- The catalog is OTC (non-prescription) items only.
- Selling actual medicines online in India requires a valid **drug
  licence**, compliance with Pharmacy Council of India / state drug
  control rules, and licensed-pharmacist verification for prescription
  items — a legal/regulatory step, not something code can substitute for.
- There's no real payment gateway; `POST /api/checkout` records the order
  but doesn't take payment. You'd want to integrate a gateway (e.g.
  Razorpay) before going live.
- `freeplus.db` is a local SQLite file — fine for a demo, but you'd move
  to a managed database (Postgres/MySQL) for production traffic.

## Ideas to extend
- User accounts and order history pages
- Product images and low-stock indicators (schema already has `stock`)
- A real payment gateway at checkout
- An admin view for managing inventory
