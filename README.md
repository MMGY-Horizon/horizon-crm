# Horizon CRM

Modern CRM and analytics platform for managing customer relationships and business insights.

## Features

- 📊 **Dashboard** - Analytics and metrics overview with charts
- 💬 **Chats** - Manage customer conversations
- 📍 **Places** - Track locations and venues
- 👥 **Users** - Manage registered users
- 👨‍💼 **Team** - Team management
- 🔍 **Crawler** - Web crawling management
- 🌐 **Web Integration** - Technical documentation for integration
- ⚙️ **Settings** - Configure your CRM
- 🔐 **Authentication** - Secure Google OAuth login

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google OAuth credentials (see [ENV_SETUP.md](./ENV_SETUP.md))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory. See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions on setting up Google OAuth and other required variables.

3. Run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001).

### Authentication Setup

This application uses NextAuth.js with Google OAuth for authentication. You'll need to:

1. Create a Google Cloud project
2. Set up OAuth 2.0 credentials
3. Configure the environment variables

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

## Project Structure

```
horizon-crm/
├── app/
│   ├── admin/          # Protected admin pages
│   ├── api/auth/       # NextAuth API routes
│   └── auth/           # Authentication pages
├── components/
│   ├── admin/          # Admin UI components
│   ├── charts/         # Chart components
│   └── providers/      # Context providers
├── lib/
│   └── auth.ts         # NextAuth configuration
└── middleware.ts       # Route protection
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Protected Routes

All `/admin/*` routes are protected and require authentication. Unauthenticated users will be redirected to the sign-in page.

## Development

- The CRM runs on port **3001** to avoid conflicts with other applications
- Hot reload is enabled for all code changes
- TypeScript is configured for type safety

## Deployment

The application is deployed on Vercel and connected to GitHub for automatic deployments.

```bash
vercel --prod
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
