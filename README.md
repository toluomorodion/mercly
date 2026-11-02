## Mercly
Mercly is a web application currently in development, built with AI-assisted development tools. This repository contains the application code and its ongoing implementation.

## Project Overview
The project explores the development of a web-based product with user authentication and onboarding at its core.

## Implemented Functionality
- User Registration: Users can create an account.
- Onboarding: New users can complete the onboarding flow.
- Authentication: Registered users can log in.
- Product Creation: Registered users can create a new product and instantly generate a unique payment link for the item.

## Development Status
Mercly is an ongoing project. The following functionality is not yet complete:
- Payment integration: Flutterwave integration is pending.
- Email integration: Email-related functionality is pending.
- Product image uploads: Vercel Blob integration is not yet functional.

The features listed as incomplete should not be considered production-ready.

## Technology
The project uses the following technologies and services:
- Next.js
- TypeScript
- PostgreSQL
- Prisma
- NextAuth
- Vercel Blob (planned for product image storage)
- Flutterwave (planned for payment processing)
- Resend (planned for email integration)

## Getting Started
To run the project locally:

Clone the repository:

git clone https://github.com/toluomorodion/mercly.git

Navigate into the project directory:

cd mercly

Install dependencies:

npm install

Configure the required environment variables in a .env file, including the PostgreSQL database connection string (DATABASE_URL) and any authentication credentials required by the application.

Start the development server:

npm run dev

Open http://localhost:3000 in your browser.

Current Focus

Development is ongoing, with attention currently on completing the core application experience and integrating the remaining services.

Project repository: github.com/toluomorodion/mercly
