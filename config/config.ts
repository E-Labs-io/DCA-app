export const config = {
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
  appName: 'DCA Protocol',
  appDescription: 'Decentralized Dollar Cost Average Protocol',
  appUrl: 'https://ation.capital/app',
  appIcon: 'https://dca-protocol.com/icon.png',
} as const;