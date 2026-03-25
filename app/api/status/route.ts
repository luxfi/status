import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const GATEWAY = {
  mainnet: process.env.MAINNET_GATEWAY || 'https://api.lux.network/mainnet',
  testnet: process.env.TESTNET_GATEWAY || 'https://api.lux.network/testnet',
  devnet: process.env.DEVNET_GATEWAY || 'https://api.lux.network/devnet',
}

// v5 blockchain IDs (redeployed 2026-03-01 on lux-k8s)
const CHAINS: Record<string, { name: string; path: Record<string, string>; chainId: Record<string, number> }> = {
  cchain: {
    name: 'C-Chain (LUX)',
    path: { mainnet: '/ext/bc/C/rpc', testnet: '/ext/bc/C/rpc', devnet: '/ext/bc/C/rpc' },
    chainId: { mainnet: 96369, testnet: 96368, devnet: 96370 },
  },
  hanzo: {
    name: 'Hanzo',
    path: {
      mainnet: '/ext/bc/2GiQb73CeJESjc4omFv2YtQHZrRgJf25NXPzAr5J6UNHRcDV2F/rpc',
      testnet: '/ext/bc/2wbYEFh7ELuovqXhyYeCLvweZrcEgNUoZVJUAtw145qTVAUJxE/rpc',
      devnet: '/ext/bc/tecXMucYDxwN65mebPE6cvQ9GynG6Y5WEvwGFsY3xVDWHxiqT/rpc',
    },
    chainId: { mainnet: 36963, testnet: 36964, devnet: 36964 },
  },
  spc: {
    name: 'SPC',
    path: {
      mainnet: '/ext/bc/rtjwvtE1tEvrokmpeYdTq7b2zqZgmybKwR5MLjKMGAR1W78dQ/rpc',
      testnet: '/ext/bc/u4pC2tT61o83pbQ8qwAyfXXGF6nyGFNSwCYHEFcUeESGiNKfu/rpc',
      devnet: '/ext/bc/213ZsFLRCBSmrii4huQqa6S3SxYPP8ec6dPEn6ad4CtLk3RdXp/rpc',
    },
    chainId: { mainnet: 36911, testnet: 36910, devnet: 36912 },
  },
}

const SERVICES = [
  { name: 'Explorer (Mainnet)', url: 'https://explore.lux.network' },
  { name: 'Explorer Hanzo', url: 'https://explore-hanzo.lux.network' },
  { name: 'Explorer SPC', url: 'https://explore-spc.lux.network' },
  { name: 'Exchange', url: 'https://lux.exchange' },
  { name: 'Bridge', url: 'https://bridge.lux.network' },
  { name: 'MPC Wallet', url: 'https://mpc.lux.network' },
  { name: 'API (Mainnet)', url: 'https://api.lux.network/mainnet/ext/health' },
  { name: 'API (Testnet)', url: 'https://api.lux.network/testnet/ext/health' },
  { name: 'API (Devnet)', url: 'https://api.lux.network/devnet/ext/health' },
]

// Deployed contracts (v5, 2026-03-01 re-genesis)
// Subnet chains all share same addresses (deployer nonce=0 on fresh chains)
// C-Chain pending redeploy from nonce=5
const CONTRACTS: Record<string, Record<string, { address: string; name: string }[]>> = {
  'Mainnet Subnets (Hanzo/SPC)': {
    'Core Tokens': [
      { address: '0x548f54dfb32ea6ce4fa3515236696cf3d1b7d26a', name: 'WLUX' },
      { address: '0xe0f7e9a0cb1688cca453995fd6e19ae4fbd9cbfd', name: 'LETH' },
      { address: '0x7d7cc8d05bb0f38d80b5ce44b4b069a6fb769468', name: 'LBTC' },
      { address: '0xc5e4a6f54be469551a342872c1ab83ab46f61b22', name: 'LUSDC' },
      { address: '0xab95c8b59f68ce922f2f334dfc8bb8f5b0525326', name: 'StakedLUX (sLUX)' },
    ],
    'AMM': [
      { address: '0x84cf0a13db1be8e1f0676405cfcbc8b09692fd1c', name: 'AMMV2Factory' },
      { address: '0x2382f7a49fa48e1f91bec466c32e1d7f13ec8206', name: 'AMMV2Router' },
    ],
    'NFT AMM': [
      { address: '0xd13ab81f02449b1630ecd940be5fb9cd367225b4', name: 'LinearCurve' },
      { address: '0xbc92f4e290f8ad03f5348f81a27fb2af3b37ec47', name: 'ExponentialCurve' },
      { address: '0xb43db9af0c5cacb99f783e30398ee0aee6744212', name: 'LSSVMPairFactory' },
    ],
    'DeFi': [
      { address: '0xd984fed38c98c1eab66e577fd1ddc8dcd88ea799', name: 'Perp' },
    ],
  },
  'C-Chain Mainnet (96369)': {
    'Status': [
      { address: '0xEAbCC110fAcBfebabC66Ad6f9E7B67288e720B59', name: 'Deployer (nonce=5, contracts pending)' },
    ],
  },
}

async function rpcCall(url: string, method: string, params: unknown[] = []): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      signal: controller.signal,
    })
    const data = await res.json()
    return data.result
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function checkService(url: string): Promise<{ status: string; latency: number }> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    clearTimeout(timeout)
    return { status: res.ok ? 'up' : 'degraded', latency: Date.now() - start }
  } catch {
    return { status: 'down', latency: Date.now() - start }
  }
}

export async function GET() {
  const networks = ['mainnet', 'testnet', 'devnet'] as const

  // Fetch all chain statuses in parallel
  const chainResults: Record<string, Record<string, { block: number | null; chainId: number; status: string }>> = {}

  const promises: Promise<void>[] = []

  for (const [key, chain] of Object.entries(CHAINS)) {
    chainResults[key] = {}
    for (const net of networks) {
      const url = GATEWAY[net] + chain.path[net]
      promises.push(
        rpcCall(url, 'eth_blockNumber').then((result) => {
          const block = result ? parseInt(result as string, 16) : null
          chainResults[key][net] = {
            block,
            chainId: chain.chainId[net],
            status: block !== null ? 'operational' : 'down',
          }
        })
      )
    }
  }

  // Fetch service statuses in parallel
  const serviceResults: Record<string, { status: string; latency: number }> = {}
  for (const svc of SERVICES) {
    promises.push(
      checkService(svc.url).then((r) => {
        serviceResults[svc.name] = r
      })
    )
  }

  await Promise.all(promises)

  // Build response
  const chains = Object.entries(CHAINS).map(([key, chain]) => ({
    id: key,
    name: chain.name,
    networks: Object.fromEntries(
      networks.map((net) => [net, chainResults[key][net]])
    ),
  }))

  const services = SERVICES.map((svc) => ({
    name: svc.name,
    url: svc.url,
    ...serviceResults[svc.name],
  }))

  const allOperational = chains.every((c) =>
    Object.values(c.networks).every((n) => n.status === 'operational')
  )
  const allServicesUp = services.every((s) => s.status === 'up')

  return NextResponse.json({
    overall: allOperational && allServicesUp ? 'operational' : 'degraded',
    timestamp: new Date().toISOString(),
    version: 'v1.23.23',
    chains,
    services,
    contracts: CONTRACTS,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
