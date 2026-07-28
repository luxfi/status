import { CHAINS, NETWORKS, SERVICES } from './chains'
import type { Network } from './chains'

export interface ChainNetworkStatus {
  block: number | null
  chainId: number
  status: 'operational' | 'down'
}

export interface ChainStatus {
  id: string
  name: string
  networks: Record<Network, ChainNetworkStatus>
}

export interface ServiceStatus {
  name: string
  url: string
  status: 'up' | 'degraded' | 'down'
  latency: number
}

export interface StatusSnapshot {
  overall: 'operational' | 'degraded'
  timestamp: string
  chains: ChainStatus[]
  services: ServiceStatus[]
}

async function rpcBlockNumber(url: string, timeoutMs = 10000): Promise<number | null> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { result?: string }
    return data.result ? parseInt(data.result, 16) : null
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

async function checkService(url: string, timeoutMs = 8000): Promise<{ status: ServiceStatus['status']; latency: number }> {
  const start = Date.now()
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    // no-cors: we can't read the response, but a successful fetch (no network error)
    // indicates the service is reachable. This avoids CORS preflight issues with
    // third-party service URLs.
    await fetch(url, { mode: 'no-cors', signal: controller.signal, redirect: 'follow' })
    return { status: 'up', latency: Date.now() - start }
  } catch {
    return { status: 'down', latency: Date.now() - start }
  } finally {
    clearTimeout(t)
  }
}

export async function fetchStatus(): Promise<StatusSnapshot> {
  const chainStatuses: ChainStatus[] = CHAINS.map((c) => ({
    id: c.id,
    name: c.name,
    networks: {
      mainnet: { block: null, chainId: c.chainId.mainnet, status: 'down' },
      testnet: { block: null, chainId: c.chainId.testnet, status: 'down' },
      devnet: { block: null, chainId: c.chainId.devnet, status: 'down' },
    },
  }))

  const serviceStatuses: ServiceStatus[] = SERVICES.map((s) => ({
    name: s.name,
    url: s.url,
    status: 'down',
    latency: 0,
  }))

  const tasks: Promise<void>[] = []

  CHAINS.forEach((chain, ci) => {
    for (const net of NETWORKS) {
      const url = chain.url[net]
      tasks.push(
        rpcBlockNumber(url).then((block) => {
          chainStatuses[ci].networks[net] = {
            block,
            chainId: chain.chainId[net],
            status: block !== null ? 'operational' : 'down',
          }
        }),
      )
    }
  })

  SERVICES.forEach((svc, si) => {
    tasks.push(
      checkService(svc.url).then((r) => {
        serviceStatuses[si] = { name: svc.name, url: svc.url, ...r }
      }),
    )
  })

  await Promise.all(tasks)

  const allOperational = chainStatuses.every((c) =>
    NETWORKS.every((n) => c.networks[n].status === 'operational'),
  )
  const allServicesUp = serviceStatuses.every((s) => s.status === 'up')

  return {
    overall: allOperational && allServicesUp ? 'operational' : 'degraded',
    timestamp: new Date().toISOString(),
    chains: chainStatuses,
    services: serviceStatuses,
  }
}
