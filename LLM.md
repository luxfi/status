# LLM.md - Lux Network Status

## Overview
Real-time status dashboard for the Lux blockchain network, subnets, and services.

## Deployment
Deployed as a Cloudflare Worker via `@opennextjs/cloudflare`.

### Custom Domains
- `luxstat.us` (custom domain on CF Worker)
- `status.lux.network` (custom domain on CF Worker)
- `lux-status.zeekay.workers.dev` (workers.dev fallback)

### How it works
- Next.js app with a server-side API route (`/api/status`) that checks health endpoints
- Client polls `/api/status` every 30s and renders status UI
- API route runs as a CF Worker (edge), makes RPC calls and HTTP health checks

### Build & Deploy
```bash
pnpm install
pnpm build          # opennextjs-cloudflare build
pnpm deploy         # build + wrangler deploy
```

CI: `.github/workflows/deploy.yml` runs on push to main.
Needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets.

## Monitored Endpoints

### Chains (via JSON-RPC eth_blockNumber)
- C-Chain (LUX): mainnet/testnet/devnet
- Hanzo subnet: mainnet/testnet/devnet
- SPC subnet: mainnet/testnet/devnet

### Services (via HTTP health check)
- Explorer (Mainnet, Hanzo, SPC)
- Exchange (lux.exchange)
- Bridge (bridge.lux.network)
- MPC Wallet (mpc.lux.network)
- API Gateway (mainnet/testnet/devnet health endpoints)

### Contracts
- Mainnet subnet tokens: WLUX, LETH, LBTC, LUSDC, sLUX
- AMM: AMMV2Factory, AMMV2Router
- NFT AMM: LinearCurve, ExponentialCurve, LSSVMPairFactory
- DeFi: Perp

## Tech Stack
- Next.js 16, React 19, TypeScript
- @opennextjs/cloudflare for CF Worker deployment
- No external monitoring dependencies -- all checks run in the Worker
