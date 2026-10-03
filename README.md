# Pavani's Portfolio

A React + Vite portfolio site in a pnpm workspace.

## Run locally

From the repository root:

```sh
pnpm install
pnpm --filter @workspace/pavani-portfolio run dev
```

Run the portfolio typecheck with:

```sh
pnpm --filter @workspace/pavani-portfolio run typecheck
```

## Contact form

To enable message delivery, configure these Vite environment variables in your local environment:

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

Do not commit private credentials or secret values.
