import { useCallback, useEffect, useState } from 'react'
import { CONTRACTS, NETWORKS } from './lib/chains'
import type { Network } from './lib/chains'
import { fetchStatus } from './lib/status'
import type { ChainNetworkStatus, ServiceStatus, StatusSnapshot } from './lib/status'

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  return `${Math.floor(secs / 60)}m ago`
}

function formatBlock(block: number | null): string {
  return block === null ? '--' : block.toLocaleString()
}

function dotClass(status: string): string {
  if (status === 'operational' || status === 'up') return 'ok'
  if (status === 'degraded') return 'warn'
  return 'err'
}

function statusLabel(status: string): string {
  if (status === 'operational' || status === 'up') return 'Operational'
  if (status === 'degraded') return 'Degraded'
  return 'Down'
}

function ChainCell({ n }: { n: ChainNetworkStatus | undefined }) {
  const status = n?.status ?? 'down'
  return (
    <>
      <div className={`block${n?.block == null ? ' empty' : ''}`}>
        <span className={`dot ${dotClass(status)}`} />
        <span>{formatBlock(n?.block ?? null)}</span>
      </div>
      <div className="chain-id">Chain {n?.chainId ?? '--'}</div>
    </>
  )
}

function ServiceCard({ svc }: { svc: ServiceStatus }) {
  const klass = dotClass(svc.status)
  return (
    <div className="card">
      <div className="row">
        <span className="name">{svc.name}</span>
        <span className={`status-label ${klass}`}>
          <span className={`dot ${klass}`} />
          {statusLabel(svc.status)}
        </span>
      </div>
      <div className="meta">
        {svc.latency}ms &middot;{' '}
        <a href={svc.url} target="_blank" rel="noopener noreferrer">
          {svc.url.replace(/^https?:\/\//, '')}
        </a>
      </div>
    </div>
  )
}

export function App() {
  const [data, setData] = useState<StatusSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<string>('')
  const [, setTick] = useState(0)

  const load = useCallback(async () => {
    try {
      const snap = await fetchStatus()
      setData(snap)
      setLastFetch(new Date().toISOString())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [load])

  // re-render every 10s so "updated Ns ago" stays fresh
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(iv)
  }, [])

  if (!data && !error) {
    return (
      <main className="page">
        <div className="loader">Loading status...</div>
      </main>
    )
  }

  const overall = data?.overall ?? 'degraded'

  return (
    <main className="page">
      <header className="status">
        <div>
          <h1>
            Lux <span className="prismatic">Status</span>
          </h1>
          <div className="sub">
            Updated {lastFetch ? timeAgo(lastFetch) : '--'} &middot; Auto-refreshes every 30s
          </div>
        </div>
        <div className={`banner ${overall === 'operational' ? 'ok' : 'warn'}`}>
          <span className={`dot ${overall === 'operational' ? 'ok' : 'warn'}`} />
          {overall === 'operational' ? 'All Systems Operational' : 'Partial Degradation'}
        </div>
      </header>

      {error && <div className="error-banner">Error fetching status: {error}</div>}

      <section>
        <h2>Blockchain Networks</h2>
        <div className="panel">
          <table className="chains">
            <thead>
              <tr>
                <th>Chain</th>
                {NETWORKS.map((net) => (
                  <th key={net} className="n">{net.charAt(0).toUpperCase() + net.slice(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.chains.map((chain) => (
                <tr key={chain.id}>
                  <td className="chain-name">{chain.name}</td>
                  {NETWORKS.map((net: Network) => (
                    <td key={net} className="n">
                      <ChainCell n={chain.networks[net]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Services</h2>
        <div className="cards">
          {data?.services.map((svc) => <ServiceCard key={svc.name} svc={svc} />)}
        </div>
      </section>

      <section>
        <h2>Deployed Contracts</h2>
        <div className="contract-network">
          {Object.entries(CONTRACTS).map(([network, groups]) => (
            <div key={network}>
              <h3 className="network-heading">{network}</h3>
              <div className="panel">
                {Object.entries(groups).map(([group, contracts]) => (
                  <div key={group} className="contract-group">
                    <h3>{group}</h3>
                    <div className="contract-list">
                      {contracts.map((c) => (
                        <div key={c.address} className="contract-item">
                          <span className="c-name">{c.name}</span>
                          <span className="c-addr">
                            {c.address.slice(0, 10)}...{c.address.slice(-6)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        Lux Network &middot; <a href="https://lux.network">lux.network</a>
      </footer>
    </main>
  )
}
