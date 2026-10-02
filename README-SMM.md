# SMM catalogue and checkout

The SMM catalogue is loaded from `GET /api/smm?action=services`. Customers place orders through `POST /api/checkout`; the server looks up the live supplier price before creating a Billplz bill. The browser must not send a trusted price or supplier API key.

Configure the supplier credential as `SMM_API_KEY` in the production Vercel project's environment variables. Never add a real key to this repository, a screenshot, or a support message.

The administrator-only supplier and order actions are protected server-side. Public clients should use only the catalogue and customer checkout/status routes.
