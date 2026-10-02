# Billplz webhook configuration

Configure the Billplz webhook in the Billplz dashboard and use the production endpoint:

```text
https://www.uziseller.com/api/billplz-webhook
```

Enable the relevant paid and failed bill events and use Billplz's X Signature verification. Store the corresponding signature key as `BILLPLZ_X_SIGNATURE_KEY` in the `my-uziseller-website` Vercel project's production environment variables.

Never place the signature key, Billplz API key, or webhook payload containing customer information in this file, source control, screenshots, or chat.
