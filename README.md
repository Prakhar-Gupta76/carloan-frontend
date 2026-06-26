# Car Loan Frontend

Next.js frontend built with JavaScript, Material UI, Redux, Zod, and Axios.

## Setup

```bash
npm install
npm run dev
```

Create or update `.env` with the API base URL:

```bash
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Client-side requests use `NEXT_PUBLIC_API_URL` because Next.js only exposes public environment variables to the browser.
