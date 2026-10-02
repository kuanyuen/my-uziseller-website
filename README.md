# UziSeller

UziSeller is a digital-services storefront for supplier product subscriptions and social-media marketing services.

## Features

- Supplier-backed digital product catalogue with category filters, search, sorting, and progressive loading
- SMM catalogue and server-priced checkout
- Billplz payments and webhook-driven order processing
- Customer accounts with email-code password recovery, order lookup, and an admin order dashboard
- English and Chinese UI, with MYR, USD, and CNY price display

## Architecture

- Static HTML, CSS, and browser JavaScript
- Vercel serverless functions in `api/`
- Vercel KV for order, account, and session data
- Billplz for payment collection
- APPMMO supplier APIs for products and SMM services

## Local development

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and set the required values in your local environment.
3. Link the repository to the existing `my-uziseller-website` Vercel project, or import it in Vercel.
4. Run `vercel dev` to serve the static site and API functions together.

Never commit `.env.local`, provider API keys, payment credentials, or admin passwords.

## Production deployment

The production project is `my-uziseller-website` in the `uzi-seller` Vercel scope. Vercel serves `https://www.uziseller.com` and `https://uziseller.com`; deployments must target this existing project so its domains and environment variables remain attached.

For a new local checkout, link it once with `vercel link --yes --project my-uziseller-website --scope uzi-seller`. Deploy from that linked project with `vercel --prod`, or use its configured Git integration. GitHub Pages is not the production host.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment and payment setup details.

## Main routes

- `/` - storefront
- `/order-status.html` - customer order lookup
- `/admin/` - protected order management
- `/api/smm?action=services` - public SMM catalogue
- `/api/subscriptions?action=products` - public product catalogue
- `/api/checkout` and `/api/subscription-checkout` - payment checkout endpoints

Password recovery sends a short-lived email code through Resend. Configure `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` in Vercel; the sending domain must be verified with Resend.

## License

MIT

## Contact

- WhatsApp: +60 11-6363 0234
- WeChat: UziShopeeseller
