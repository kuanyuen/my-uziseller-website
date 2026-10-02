# Production deployment

## Current production target

- Vercel project: `my-uziseller-website` in the `uzi-seller` scope
- Production domains: `https://www.uziseller.com` and `https://uziseller.com`
- Production configuration: Vercel project environment variables and Vercel KV

Deployments must use the existing project so the production aliases, serverless functions, and data integrations remain connected. Use `vercel --prod` from a directory linked to this project, or the project's Vercel Git integration.

## Smoke checks

- `/` - storefront
- `/order-status.html` - order lookup
- `/admin/` - administrator sign-in
- `/api/smm?action=services` - SMM catalogue
- `/api/subscriptions?action=products` - subscription catalogue
- `/api/order-status` - returns a validation response when no order ID is supplied

Do not put production credentials, environment variable values, or customer data in this report or any tracked file. Configure secrets only in the Vercel project settings.
