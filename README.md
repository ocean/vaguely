# Vaguely

A minimalist Cloudflare Worker that reveals your location and time through mysterious means.

## Routes

- `/` - Root page listing available abilities
- `/where` - Your location (country, city, coordinates, postcode)
- `/when` - Your local time and timezone information

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update `wrangler.toml` with your domain:
   - Change `route` to your custom subdomain
   - Update `zone_name` to your domain

3. Deploy:
   ```bash
   npm run deploy
   ```

## Development

Test locally:
```bash
npm run dev
```

## Features

- Random animal emoji spirit guide for each request
- Mysterious preambles from Cloudflare deities
- Minimal, clean text-based responses
- Uses Cloudflare's geo-IP data from request headers
