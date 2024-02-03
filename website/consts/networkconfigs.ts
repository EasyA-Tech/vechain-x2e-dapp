// Define a union type for the expected network names by Connex
type NetworkName = 'main' | 'test';

// Define a type for the network configuration
type NetworkConfigType = {
    mainnet: {
        chainTag: number;
        blocksUrl: string;
        transactionsUrl: string;
        explorerUrl: string;
        nodeUrl: string;
        networkName: NetworkName;
    };
    testnet: {
        chainTag: number;
        blocksUrl: string;
        transactionsUrl: string;
        explorerUrl: string;
        nodeUrl: string;
        networkName: NetworkName;
    };
};

const currentNetwork: keyof NetworkConfigType = process.env.NEXT_PUBLIC_CURRENT_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

const networkConfig: NetworkConfigType = {
    mainnet: {
        chainTag: 0x4a,
        blocksUrl: 'https://mainnet.veblocks.net/blocks/best',
        transactionsUrl: 'https://mainnet.veblocks.net/transactions',
        explorerUrl: 'https://explore.vechain.org/transactions/',
        nodeUrl: 'https://mainnet.veblocks.net/',
        networkName: 'main',
    },
    testnet: {
        chainTag: 0x27,
        blocksUrl: 'https://testnet.veblocks.net/blocks/best',
        transactionsUrl: 'https://testnet.veblocks.net/transactions',
        explorerUrl: 'https://explore-testnet.vechain.org/transactions/',
        nodeUrl: 'https://testnet.veblocks.net/',
        networkName: 'test',
    }
};

export { networkConfig, currentNetwork };
