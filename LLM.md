# Lux Network Status

## Overview
Real-time status dashboard for the Lux blockchain network, subnets, and services. Vite 8 + React 19 SPA.

## Architecture
- **Single-page app** -- no backend, no API routes. All status checks run client-side.
- **Chain checks**: `fetch` JSON-RPC `eth_blockNumber` against `api.lux.network/{env}/ext/{path}`. CORS-enabled upstream gateway.
- **Service checks**: `fetch` with `mode: 'no-cors'` to avoid preflight against third-party origins. Successful fetch (no network error) = reachable.
- **Auto-refresh**: 30s polling.

## Tech Stack
- Vite 8 (ES2022, build -> `dist/`)
- React 19
- TypeScript, pure CSS (monochrome dark theme, Basel Grotesk)
- No router, no state library.

## Config
All monitored chains, services, and contracts live in `src/lib/chains.ts`.
Status fetching logic lives in `src/lib/status.ts`.

## Deployment
Dockerfile uses `ghcr.io/hanzoai/spa` as the static server (FROM scratch, port 3000, SPA mode with history-api fallback). Build stage runs `pnpm build`, publish stage copies `dist/` to `/public`.

### Custom Domains
- `luxstat.us`
- `status.lux.network`

### Build & Deploy
```bash
pnpm install
pnpm dev            # vite on :3333
pnpm build          # tsc -b && vite build
pnpm preview        # serve dist/ on :3000
docker build .      # multi-stage build -> hanzoai/spa
```

CI: `.github/workflows/` builds multi-arch image and pushes to registry.

## Monitored Endpoints

### Chains (JSON-RPC `eth_blockNumber`)
- C-Chain (LUX): mainnet/testnet/devnet
- Hanzo subnet: mainnet/testnet/devnet
- SPC subnet: mainnet/testnet/devnet

### Services (HTTP reachability, `no-cors`)
- Explorer (Mainnet, Hanzo, SPC)
- Exchange (lux.exchange)
- Bridge (bridge.lux.network)
- MPC Wallet (mpc.lux.network)
- API Gateway (mainnet/testnet/devnet health endpoints)

### Contracts (static list, display-only)
- Mainnet subnet tokens: WLUX, LETH, LBTC, LUSDC, sLUX
- AMM: AMMV2Factory, AMMV2Router
- NFT AMM: LinearCurve, ExponentialCurve, LSSVMPairFactory
- DeFi: Perp
