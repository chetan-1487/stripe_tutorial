# Backend Service Documentation

---

## 1. Overview

This project is a **Node.js + TypeScript backend** built with **Express, Prisma, Redis, and Stripe**.  
It provides APIs for **authentication, payments, subscriptions, user management, and webhooks**.

---

## 2. Project Structure

```
├── .gitignore
├── package-lock.json
├── package.json
├── prisma
│   ├── migrations/                # Database migrations
│   └── schema.prisma              # Database schema
├── readme.md
├── src
│   ├── app.ts                     # App initialization
│   ├── config/                    # Configuration files
│   │   ├── env.ts                 # Environment variables
│   │   ├── prisma.ts              # Prisma client
│   │   ├── redis.ts               # Redis client
│   │   └── stripe.ts              # Stripe client
│   ├── constants/
│   │   └── http-status.ts         # HTTP status codes
│   ├── middlewares/               # Global middlewares
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validationRequest.ts
│   ├── modules/                   # Feature-based modules
│   │   ├── auth/                  # Authentication
│   │   ├── checkout/              # Checkout flow
│   │   ├── payment/               # Payment handling
│   │   ├── plan/                  # Subscription plans
│   │   ├── subscription/          # Subscription management
│   │   ├── user/                  # User management
│   │   └── webhook/               # Stripe webhooks
│   ├── server.ts                  # Server entry point
│   └── utils/                     # Utility functions
│       ├── emailTemplates.ts
│       ├── errorHandler.ts
│       ├── logger.ts
│       ├── otp.ts
│       ├── otpStore.ts
│       └── response.ts
└── tsconfig.json
```

---

## 3. Technology Stack

* **Runtime**: Node.js
* **Language**: TypeScript
* **Framework**: Express.js
* **ORM**: Prisma
* **Database**: PostgreSQL / MySQL / SQLite (configurable)
* **Caching / Sessions**: Redis
* **Payment**: Stripe
* **Authentication**: JWT
* **Validation**: Zod
* **Email Service**: Nodemailer

---

## 4. Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/chetan-1487/stripe_tutorial.git
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your_database_url"
REDIS_URL="your_redis_url"
STRIPE_SECRET_KEY="your_stripe_secret"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"
JWT_SECRET="your_jwt_secret"

SMTP_HOST="your_smtp_host"
SMTP_PORT=587
SMTP_USER="your_email_user"
SMTP_PASS="your_email_password"
```

### Step 4: Run Prisma Migrations

```bash
npx prisma migrate dev
```

### Step 5: Start Development Server

```bash
npm run dev
```

### Step 6: Run Stripe Webhook Listener Locally

```bash
stripe login
stripe listen --forward-to localhost:4000/api/webhook
```

### Step 7: Build and Run Production

```bash
npm run build
npm start
```

---

## 5. Scripts

* **Development**:

  ```bash
  npm run dev
  ```

  Runs the server with **hot reload**.

* **Build**:

  ```bash
  npm run build
  ```

  Compiles TypeScript to JavaScript.

* **Start (Production)**:

  ```bash
  npm start
  ```

  Runs the compiled app from `dist/`.

---

## 6. Features

* 🔐 **Authentication & Authorization** (JWT-based)
* 📧 **Email + OTP verification system**
* 💳 **Stripe integration for checkout & subscriptions**
* 🗂 **Plan & Subscription management**
* ⚡ **Redis integration for caching & OTP**
* 🚨 **Global error handling & logging**
* 📦 **Modular, feature-based folder structure**
* 🛠 **Prisma migrations & schema management**

---

## 7. API Modules

* **Auth Module**
  * Login, Register, Token validation

* **User Module**
  * User profile & management

* **Plan Module**
  * Create, update, list subscription plans

* **Checkout Module**
  * Handle checkout sessions with Stripe

* **Payment Module**
  * Payment status & history

* **Subscription Module**
  * Manage active subscriptions

* **Webhook Module**
  * Handle Stripe webhooks (payment, subscription events)

---

## 8. Author

* **Chetan**
* [GitHub Profile](https://github.com/chetan-1487)