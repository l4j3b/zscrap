# zScrap

The app is using Remix + Cloudflare.

- 📖 [Remix docs](https://remix.run/docs)
- 📖 [Remix Cloudflare docs](https://remix.run/guides/vite#cloudflare)

## Development

Configure env:

```sh
cp .env.example .env

# Adjust the values as needed.

cp .env .dev.vars
```

Run the dev server:

```sh
npm run dev
```

To run Wrangler:

```sh
npm run build
npm run start
```

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
npm run typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Styling

Styling is done via [Tailwind CSS](https://tailwindcss.com/).

## Misc

### Stripe

For local development, you can use the test card number `4242 4242 4242 4242`.

To test the webhook locally, you can use [Stripe CLI](https://stripe.com/docs/stripe-cli).

```sh
stripe login
stripe listen --forward-to localhost:5173/webhooks/stripe
```

### Manual deployment

Deployment should be automatic.

Below are the instructions to manually deploy if needed.

> [!WARNING]  
> Cloudflare uses `wrangler.toml` to configure deployment bindings and non protected variables.
> Secrets are set in the Cloudflare dashboard.

First, build your app for production:

```sh
npm run build
```

Then, deploy your app to Cloudflare Pages:

```sh
npm run deploy
```

## Checklist before launch

- [ ] Config contact email
- [ ] Config social media links
- [ ] Config legal pages
- [ ] Config Stripe
- [ ] Config Cloudflare
- [ ] Config Analytics
- [ ] Config Supabase
- [ ] Whitelisting
- [ ] Config webhook on: <https://dashboard.stripe.com/test/webhooks>
