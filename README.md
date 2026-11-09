# Posterwala — Custom Printed Posters, Polaroids & Photo Prints

A full-stack, mobile-first e-commerce web application for museum-grade printed posters, vintage polaroids, and photo prints in India. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Postgres, Auth, Storage), and Razorpay.

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Home Page**: Hero banner with live interactive mockups, featured editor picks, curated category links, and 4-step "How Posterwala Works" workflow.
- **Curated Catalog (`/designs`)**: High-res art catalog with instant category filtering (Minimal, Anime, Travel, Quotes, Abstract), real-time search, and sorting by newest arrivals or price.
- **Interactive Design Page (`/designs/[slug]`)**:
  - Live interactive frame simulation (Dark Walnut Wood, Matte Black Metal, Pure White, or Unframed).
  - Ambient room wall simulator vs neutral studio backdrop.
  - Product switcher (Art Poster, Polaroid Pack, Fine Photo Print).
  - Size picker with 300 DPI specifications and dimensions (A4, A3, A2, etc.).
  - Paper finish selector: Velvet Matte vs Lustre Glossy.
  - Dynamic live price in INR with instant cart slide-over drawer.
- **Custom Print Studio (`/custom`)**:
  - Upload custom personal photos or artwork (JPG, PNG, PDF up to 25 MB).
  - Canvas editor powered by **Konva.js** with zoom, pan, crop, rotation, and custom typography overlay.
  - **Live DPI Guard**: Automatically calculates resolution against chosen product dimensions in inches. Warns when below 150 DPI minimum to prevent pixelated prints.
  - Browser-applied filter suite (Monochrome B&W, Vintage Retro, Pencil Sketch).
  - **Original File Preservation**: Stores the pristine high-resolution original in private storage while applying vector edit instructions.
- **Cart & Razorpay Checkout (`/checkout`)**:
  - Slide-over cart drawer with animated progress bar for Free Shipping across India (orders > ₹499).
  - Complete Indian shipping address form with strict 6-digit PIN code validation.
  - Server-side Razorpay order creation and cryptographic signature verification.
  - Integrated testing sandbox for one-click payment testing.
- **Customer Account (`/account`)**:
  - Sign in and sign up with email and Google OAuth.
  - Live 4-stage order status tracking: **Received ➔ Printing ➔ Shipped ➔ Delivered**.
  - One-click AWB courier tracking links (Delhivery, BlueDart, DTDC).

---

### 🛡️ Admin Portal (`/admin`)
- **Role-Based Protection**: Secured by Supabase Row Level Security (RLS) and profile role authorization. Includes instant demo switcher for development.
- **Curated Artwork Upload (`/admin/designs/new`)**:
  - Upload high-resolution master image (kept strictly private in `secure-originals` bucket).
  - Automatic **Sharp** image processing pipeline generating watermarked previews (with diagonal anti-piracy pattern) and 600px catalog thumbnails.
  - Form validation with Zod (Title, slug, category, tags, starting price, active toggle).
- **Products, Sizes & Pricing (`/admin/products`)**:
  - Manage product specifications, 300 DPI pixel dimensions, bleed allowances (3mm standard), and prices in INR.
- **Orders & Prepress Pre-flight Dashboard (`/admin/orders`)**:
  - Review incoming customer orders and payments.
  - **View Customer's Original Master**: Inspect raw customer file.
  - **Download 300 DPI Print-Ready File with Bleed**: Generates a high-fidelity TIFF/PNG resized to exact size specifications at 300 DPI with 3mm bleed margin for immediate print production.
  - Update status and assign courier tracking numbers (Delhivery, BlueDart).
  - **Email Notification Dispatch**: Automatically sends branded HTML status update emails to customers.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 14** (App Router, Server Components & Route Handlers) |
| Language | **TypeScript** with strict type safety |
| Styling | **Tailwind CSS** with custom design tokens, glassmorphism & `tailwindcss-animate` |
| Image Processing | **Sharp** (server-side watermarking, thumbnails, 300 DPI bleed exports) |
| Canvas Editor | **Konva.js** & `react-konva` (client-side interactive manipulation) |
| Database | **Supabase PostgreSQL** with Row Level Security (RLS) |
| Auth & Storage | **Supabase Auth** (Email + Google OAuth) & **Supabase Storage** (Public + Private buckets) |
| Payments | **Razorpay** (Server-side order creation + Webhook HMAC SHA-256 verification) |
| Validation | **Zod** schema validation across client forms and server APIs |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js v18+ or v20+
- npm or pnpm

### 2. Clone and Install Dependencies
```bash
cd /Users/barani/.gemini/antigravity-ide/scratch/posterwala
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials (or run immediately in zero-config demo mode with built-in fallbacks):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Database Setup (Supabase)
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run `supabase/schema.sql` to create all tables, triggers, and Row Level Security policies.
3. Run `supabase/seed.sql` to populate default categories, products, sizes, and sample curated designs.
4. In Supabase Storage, create two buckets:
   - `public-assets` (Public: Yes)
   - `secure-originals` (Public: No — private access via signed URLs)

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Razorpay Webhook Configuration

1. In your Razorpay Dashboard, navigate to **Settings** -> **Webhooks**.
2. Click **Add New Webhook**.
3. Set Webhook URL: `https://your-domain.vercel.app/api/webhooks/razorpay`
4. Enter a strong secret and set `RAZORPAY_WEBHOOK_SECRET` in your environment.
5. Select active events:
   - `payment.captured`
   - `order.paid`
6. Save. Posterwala will automatically verify incoming cryptographic HMAC signatures and update the order status to `Received`.

---

## ☁️ Deployment Instructions for Vercel

1. Push your repository to GitHub / GitLab.
2. Log in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
3. Import your `posterwala` repository.
4. In **Project Settings** -> **Environment Variables**, add:
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://posterwala.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
5. Click **Deploy**. Vercel will build the production bundle with Edge CDN optimization.
