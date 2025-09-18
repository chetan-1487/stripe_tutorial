backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Auto-generated migrations
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment variables
│   │   ├── prisma.ts           # Prisma client
│   │   └── stripe.ts           # Stripe client
│   ├── constants/
│   │   └── http-status.ts      # Standard HTTP status codes
│   ├── middlewares/
│   │   ├── auth.ts             # JWT auth middleware
│   │   ├── errorHandler.ts     # Global error handling
│   │   └── validateRequest.ts  # Joi validation middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.webhook.ts
│   │   └── user/
│   │       ├── user.service.ts
│   │       └── user.controller.ts
│   ├── utils/
│   │   ├── logger.ts           # Winston or console logger
│   │   └── response.ts         # Standard API response helpers
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entrypoint
├── .env
├── package.json
├── tsconfig.json
└── README.md
