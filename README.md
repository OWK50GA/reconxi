# ReconXi API

Backend API for ReconXi — an AI-powered financial reconciliation platform built for Nigerian SMEs, accounting firms, and finance teams.

## About ReconXi

ReconXi helps businesses match their internal financial records against bank statements, identify discrepancies, and resolve them efficiently. The platform combines intelligent matching algorithms with AI-generated insights to reduce manual reconciliation time from hours to minutes.

### What It Does

- **Smart Matching** — Automatically pairs transactions from your ledger with bank statement entries using amount, date, and description similarity
- **Nigerian Bank Support** — Built-in understanding of Nigerian bank statement formats and narration styles
- **Manual Review** — Interactive workspace for reviewing fuzzy matches and resolving discrepancies
- **Audit Trail** — Complete history of every matching decision and override
- **Export Reports** — Generate PDF and CSV reports with preparer/reviewer sign-off fields
- **AI Summaries** — Plain-language reconciliation summaries for quick executive review

### Key Features

- Multi-organization support with role-based access (Admin / Member)
- CSV and Excel file upload with flexible column mapping
- Vector embedding-based description matching (OpenAI + pgvector)
- Bank charge detection and annotation for common Nigerian fees
- Email notifications for reconciliation completion and review requests
- OAuth 2.0 authentication (Google SSO + email/password)
- Match rate trends and reconciliation history dashboard

## Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 14+ with pgvector extension
- **Authentication**: JWT (access + refresh tokens via HttpOnly cookies)
- **Queue**: BullMQ + Redis for async file processing
- **AI/ML**: OpenAI API (text-embedding-3-small for semantic matching)
- **Storage**: Local filesystem (extensible to cloud storage)
- **Reports**: Puppeteer for PDF generation

## Architecture

```
┌─────────────┐
│   Client    │
│  (Web App)  │
└──────┬──────┘
       │ HTTPS (REST + JSON)
       ↓
┌─────────────┐
│  NestJS API │ ← This Repository
│  (Node.js)  │
└──────┬──────┘
       │
       ├──→ PostgreSQL (financial data + pgvector embeddings)
       ├──→ Redis (queue + cache)
       └──→ OpenAI API (embeddings + summaries)
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 14+ with `pgvector` extension
- Redis 6+
- OpenAI API key

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
pnpm migration:run

# Seed initial data (optional)
pnpm seed

# Start development server
pnpm start:dev
```

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication & authorization
│   ├── users/             # User management
│   ├── organizations/     # Multi-tenancy
│   ├── reconciliations/   # Core reconciliation engine
│   ├── files/             # File upload & processing
│   ├── matches/           # Matching logic & workspace
│   ├── reports/           # Export & PDF generation
│   └── notifications/     # Email notifications
├── common/                # Shared utilities & middleware
├── config/                # Configuration management
└── database/              # Migrations, entities, seeds
```

## API Documentation

API documentation is available via Swagger UI when the server is running:

```
http://localhost:3000/api/docs
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=reconxi_db
DATABASE_USER=reconxi_user
DATABASE_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_secret_here

# OpenAI
OPENAI_API_KEY=sk-...

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

## Scripts

```bash
# Development
pnpm start:dev          # Start with hot reload
pnpm start:debug        # Start with debugger

# Build
pnpm build              # Compile TypeScript
pnpm start:prod         # Run production build

# Database
pnpm migration:generate # Generate new migration
pnpm migration:run      # Run pending migrations
pnpm migration:revert   # Revert last migration
pnpm db:reset          # Drop, migrate, and seed (dev only)

# Code Quality
pnpm lint               # Lint and auto-fix
pnpm format             # Format code
pnpm validate           # Lint + test + build
```

## Contributing

1. Create a feature branch from `dev`
2. Make your changes with tests
3. Run `pnpm validate` to ensure quality
4. Submit a pull request to `dev`

## License

Proprietary - All rights reserved

## Support

For issues, questions, or feature requests, please contact the development team.

---

**ReconXi** — Making financial reconciliation simple, smart, and fast for Nigerian businesses.
