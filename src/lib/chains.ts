export const NETWORKS = ['mainnet', 'testnet', 'devnet'] as const
export type Network = (typeof NETWORKS)[number]

// The network is chosen by host, never by a path segment, and every EVM
// answers on the same path: /v1/bc/C/rpc. See lux.network/docs/api-reference.
const RPC = '/v1/bc/C/rpc'
const hosts = (org: string): Record<Network, string> => ({
  mainnet: `https://api.${org}.network${RPC}`,
  testnet: `https://api.${org}-test.network${RPC}`,
  devnet: `https://api.${org}-dev.network${RPC}`,
})

export interface ChainDef {
  id: string
  name: string
  url: Record<Network, string>
  chainId: Record<Network, number>
}

export const CHAINS: ChainDef[] = [
  {
    id: 'cchain',
    name: 'C-Chain (LUX)',
    url: hosts('lux'),
    chainId: { mainnet: 96369, testnet: 96368, devnet: 96367 },
  },
  {
    id: 'zoo',
    name: 'Zoo',
    url: hosts('zoo'),
    chainId: { mainnet: 200200, testnet: 200201, devnet: 200202 },
  },
  {
    id: 'hanzo',
    name: 'Hanzo',
    url: hosts('hanzo'),
    chainId: { mainnet: 36963, testnet: 36964, devnet: 36965 },
  },
  {
    id: 'spc',
    name: 'SPC',
    url: hosts('spc'),
    chainId: { mainnet: 36911, testnet: 36910, devnet: 36912 },
  },
]

export interface ServiceDef {
  name: string
  url: string
}

export const SERVICES: ServiceDef[] = [
  { name: 'Explorer (Mainnet)', url: 'https://explore.lux.network' },
  { name: 'Explorer Hanzo', url: 'https://explore-hanzo.lux.network' },
  { name: 'Explorer SPC', url: 'https://explore-spc.lux.network' },
  { name: 'Exchange', url: 'https://lux.exchange' },
  { name: 'Bridge', url: 'https://bridge.lux.network' },
  { name: 'MPC Wallet', url: 'https://mpc.lux.network' },
  { name: 'API (Mainnet)', url: 'https://api.lux.network/v1/health' },
  { name: 'API (Testnet)', url: 'https://api.lux-test.network/v1/health' },
  { name: 'API (Devnet)', url: 'https://api.lux-dev.network/v1/health' },
]

export interface ContractDef {
  address: string
  name: string
}

// Deployed contracts (v5, 2026-03-01 re-genesis)
// Subnet chains all share same addresses (deployer nonce=0 on fresh chains)
// C-Chain pending redeploy from nonce=5
export const CONTRACTS: Record<string, Record<string, ContractDef[]>> = {
  'Mainnet Subnets (Hanzo/SPC)': {
    'Core Tokens': [
      { address: '0x548f54dfb32ea6ce4fa3515236696cf3d1b7d26a', name: 'WLUX' },
      { address: '0xe0f7e9a0cb1688cca453995fd6e19ae4fbd9cbfd', name: 'LETH' },
      { address: '0x7d7cc8d05bb0f38d80b5ce44b4b069a6fb769468', name: 'LBTC' },
      { address: '0xc5e4a6f54be469551a342872c1ab83ab46f61b22', name: 'LUSDC' },
      { address: '0xab95c8b59f68ce922f2f334dfc8bb8f5b0525326', name: 'StakedLUX (sLUX)' },
    ],
    AMM: [
      { address: '0x84cf0a13db1be8e1f0676405cfcbc8b09692fd1c', name: 'AMMV2Factory' },
      { address: '0x2382f7a49fa48e1f91bec466c32e1d7f13ec8206', name: 'AMMV2Router' },
    ],
    'NFT AMM': [
      { address: '0xd13ab81f02449b1630ecd940be5fb9cd367225b4', name: 'LinearCurve' },
      { address: '0xbc92f4e290f8ad03f5348f81a27fb2af3b37ec47', name: 'ExponentialCurve' },
      { address: '0xb43db9af0c5cacb99f783e30398ee0aee6744212', name: 'LSSVMPairFactory' },
    ],
    DeFi: [{ address: '0xd984fed38c98c1eab66e577fd1ddc8dcd88ea799', name: 'Perp' }],
  },
  'C-Chain Mainnet (96369)': {
    Status: [
      { address: '0xEAbCC110fAcBfebabC66Ad6f9E7B67288e720B59', name: 'Deployer (nonce=5, contracts pending)' },
    ],
  },
}
