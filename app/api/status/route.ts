import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const GATEWAY = {
  mainnet: process.env.MAINNET_GATEWAY || 'http://luxd-0.luxd-headless.lux-mainnet.svc.cluster.local:9630',
  testnet: process.env.TESTNET_GATEWAY || 'http://luxd-0.luxd-headless.lux-testnet.svc.cluster.local:9640',
  devnet: process.env.DEVNET_GATEWAY || 'http://luxd-0.luxd-headless.lux-devnet.svc.cluster.local:9650',
}

const CHAINS: Record<string, { name: string; path: Record<string, string>; chainId: Record<string, number> }> = {
  cchain: {
    name: 'C-Chain (LUX)',
    path: { mainnet: '/ext/bc/C/rpc', testnet: '/ext/bc/C/rpc', devnet: '/ext/bc/C/rpc' },
    chainId: { mainnet: 96369, testnet: 96368, devnet: 96370 },
  },
  zoo: {
    name: 'Zoo',
    path: {
      mainnet: '/ext/bc/pcMkknsTyA5JdYDzvgRQkq4WmPdz99TcAWeezAQYh7Tjh64HN/rpc',
      testnet: '/ext/bc/2HejgoXvUEDYUYoJLUhQYYadtDSE5qpBLTJKxzYr1AcvkRT9fE/rpc',
      devnet: '/ext/bc/9caEYTT7d1g57qfh78WfmrnCc8TYVUfWKLPrrrgZnPv11NisX/rpc',
    },
    chainId: { mainnet: 200200, testnet: 200201, devnet: 200202 },
  },
  hanzo: {
    name: 'Hanzo',
    path: {
      mainnet: '/ext/bc/2ktB8JknYFzLTNWPFk5QHstmmbSx97vAFv5zJUD4BtgU59tZD5/rpc',
      testnet: '/ext/bc/dU2HC7MkYX56vMDgrtur8CkzTtD1C4MMTqi1MFc6413t2aFAz/rpc',
      devnet: '/ext/bc/5jTMMEPbJG2xuQzYgUhRsQE9gRm8jvayHsvzQ8xH35HAv6UHC/rpc',
    },
    chainId: { mainnet: 36963, testnet: 36964, devnet: 36964 },
  },
  spc: {
    name: 'SPC',
    path: {
      mainnet: '/ext/bc/2jomRDDNY9c4eLS47m7gNUMnf6fNYdmCBHSGX6JHTqzP1W1FgE/rpc',
      testnet: '/ext/bc/eoMnXFewgFM22caQi35FU4i4hyFdLrPFwNVT54yFzc2WPGnNY/rpc',
      devnet: '/ext/bc/2PydmLj14vqDhaZgtdb8nVBYc2Z3TUkmqmAwmasiatjEcdhzSk/rpc',
    },
    chainId: { mainnet: 36911, testnet: 36910, devnet: 36912 },
  },
  pars: {
    name: 'Pars',
    path: {
      mainnet: '/ext/bc/2ZPGRSPzvUfr8nSYigsUj1FYC68U6rcKoePhMSkHSYS4V9UmnS/rpc',
      testnet: '/ext/bc/2GAZhS1vSrkDKNo2txEY4MvBRcsMvUc7nQAUXPbtLFMBrB87ct/rpc',
      devnet: '/ext/bc/2m3UV9zVPKMZJYQyrQWhr49eiQbkhxULVmsTpYTmb11hC1MmQA/rpc',
    },
    chainId: { mainnet: 494949, testnet: 494950, devnet: 494951 },
  },
}

const SERVICES = [
  { name: 'Explorer (Mainnet)', url: 'https://explore.lux.network' },
  { name: 'Explorer (Testnet)', url: 'https://explore-test.lux.network' },
  { name: 'Explorer (Devnet)', url: 'https://explore-dev.lux.network' },
  { name: 'Exchange', url: 'https://lux.exchange' },
  { name: 'Bridge', url: 'https://bridge.lux.network/api/networks' },
  { name: 'API (Mainnet)', url: 'https://api.lux.network/ext/health' },
  { name: 'API (Testnet)', url: 'https://api.lux-test.network/ext/health' },
  { name: 'API (Devnet)', url: 'https://api.lux-dev.network/ext/health' },
]

const CONTRACTS: Record<string, Record<string, { address: string; name: string }[]>> = {
  'C-Chain Testnet': {
    'Bridge Infrastructure': [
      { address: '0x134c6d62745bAaeb5591EA213e6096B7793D068f', name: 'Bridge' },
      { address: '0x3212fEb0EdC8346548B8D794bf5566796357d5f5', name: 'LuxVault' },
      { address: '0x8D9cD23FFD626C50AD9C9aB69Dbd439174a6CFD2', name: 'LBTC' },
      { address: '0x606B585428D68450e3D10511e4d7eb170E136E13', name: 'LETH' },
      { address: '0x4E77Cb2d5227Bfdf039d0B972E5f59467a444C0A', name: 'LUSD' },
      { address: '0x81c76F35F3c7580384b17F52FFcec3a29dCf3f8b', name: 'LBNB' },
      { address: '0x015b845982e82153D1debDFC2B0EC089E4c29b47', name: 'LPOL' },
      { address: '0x8B515632dC7c7403ad2990d38ba8851892E95D11', name: 'LCELO' },
      { address: '0x54e123C8755AE44D7279fe3D959735547a19AE3f', name: 'LFTM' },
      { address: '0xAbbc9a75b40Dd3A8eE7BCF6Cb7Be41E67fD5DbA3', name: 'LXDAI' },
      { address: '0xD1DF647F8b646e32A999457e9B5912c408607CCe', name: 'LSOL' },
      { address: '0x6FdC02698B84276C4f66023B0924E3a9fd30d5cC', name: 'LTON' },
    ],
  },
  'C-Chain Devnet': {
    'Bridge Infrastructure': [
      { address: '0x8B515632dC7c7403ad2990d38ba8851892E95D11', name: 'Bridge' },
      { address: '0x54e123C8755AE44D7279fe3D959735547a19AE3f', name: 'LuxVault' },
      { address: '0x6AAB89551e94e393185E77537F89C7D3834aFAE1', name: 'LBTC' },
      { address: '0xEC2e57Af48ee1c51b6898451F08D11b8933b26e2', name: 'LETH' },
      { address: '0x3dE84d92A21cd384Ab3e0380Dd6c339bfb59d8e3', name: 'LUSD' },
      { address: '0xe3eA61c1c7f3fF5aB265cDA64167CCBD45F8872d', name: 'LBNB' },
      { address: '0x3cCC022443d66aaDde31Bd2ffE374F6BFeA794Cb', name: 'LPOL' },
      { address: '0x8D9cD23FFD626C50AD9C9aB69Dbd439174a6CFD2', name: 'LCELO' },
      { address: '0x606B585428D68450e3D10511e4d7eb170E136E13', name: 'LFTM' },
      { address: '0x4E77Cb2d5227Bfdf039d0B972E5f59467a444C0A', name: 'LXDAI' },
      { address: '0x81c76F35F3c7580384b17F52FFcec3a29dCf3f8b', name: 'LSOL' },
      { address: '0x015b845982e82153D1debDFC2B0EC089E4c29b47', name: 'LTON' },
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
