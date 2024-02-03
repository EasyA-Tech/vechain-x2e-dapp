import { TwitterApi, TwitterApiTokens, UserV2FollowResult } from 'twitter-api-v2';

import { Transaction, secp256k1, abi, mnemonic, address } from 'thor-devkit';
import axios from 'axios';

import { networkConfig, currentNetwork } from '../../consts/networkconfigs';


interface CustomResponse {
    response?: string | UserV2FollowResult;
    error?: any;
    message: string;
}


export default async function rewardFunction(
    req: { body: { signer: any; accessToken: any; accessSecret: any; } },
    res: { status: (arg0: number) => { (): any; new(): any; json: (arg0: CustomResponse) => void; new(): any; }; }
) {
    console.log("Request received with body:", req.body);

    const signer = req.body.signer;

    // Twitter app credentials
    const consumerKey = process.env.TWITTER_ID;
    const consumerSecret = process.env.TWITTER_SECRET;

    const accessToken = req.body.accessToken;
    const accessSecret = req.body.accessSecret;


    const client: TwitterApi = new TwitterApi({
        appKey: consumerKey as string,
        appSecret: consumerSecret as string,
        accessToken: accessToken,
        accessSecret: accessSecret,
    });


    try {
        const me = await client.v2.me();
        const userId = me.data.id;

        const response = await client.v2.follow(userId, '1245666034763337728');

        if (response.data.following === true) {
            const transactionId = await sendReward(signer);
            // Use network-specific explorer URL
            const explorerLink = networkConfig[currentNetwork].explorerUrl + transactionId;
            res.status(200).json({
                response,
                message: `Airdrop claimed. ${explorerLink} If you've already claimed your airdrop with this Twitter account, you will not receive another. `
            });

            res.status(200).json({
                response,
                message: "You've been rewarded! Check your wallet."
            });

        } else {
            res.status(200).json({
                response,
                message: "You aren't following. Try again once you've followed."
            });
        }
    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).json({
            error: error.message,
            message: "An error occurred while processing your request. Please try again later"
        });
    }
}




async function sendReward(signer: any) {

    const mnemonicWords = process.env.MNEMONIC_WORDS;

    if (!mnemonicWords) {
        console.error("MNEMONIC_WORDS is not set in the environment.");
        return;
    }

    const privateKey = await getPrivateKeyFromMnemonic(mnemonicWords);
    console.log(`privateKey processed: `, privateKey);

    if (!privateKey) {
        console.error("Failed to derive a private key.");
        return;
    }
    console.log(`Derived Private Key: ${privateKey.toString('hex')}`);


    // Define the ABI for the 'rewardUser' function
    const rewardUserAbi = {
        constant: false,
        inputs: [
            {
                name: "user",
                type: "address"
            },
            {
                name: "twitterUsername",
                type: "string"
            },
            {
                name: "rewardAmount",
                type: "uint256"
            }
        ],
        name: "rewardUser",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable" as "nonpayable",
        type: "function" as const
    };



    // Create a new function object using the ABI
    const rewardUserFunction = new abi.Function(rewardUserAbi);


    // Validate the signer address format
    if (!signer || typeof signer !== 'string' || !signer.startsWith('0x') || signer.length !== 42) {
        console.error('Invalid signer address:', signer, ` Make sure your wallet's connected!`);
        return;
    }


    const rewardAmount = BigInt(10) * BigInt(10 ** 18); // 10 VET in Wei as BigInt

    console.log(`rewardAmount: `, rewardAmount);

    // Encode the function call with parameters
    const encodedFunctionCall = rewardUserFunction.encode(signer, 'easya_app', rewardAmount.toString());

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    console.log(`contractAddress: `, contractAddress);

    if (!contractAddress) {
        throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not defined');
    }


    const clauses = [{
        to: contractAddress,
        value: '0x0', // Don't need to send anything in the value field since the VET's already in the smart contract
        data: encodedFunctionCall
    }];


    const gasEstimate = Transaction.intrinsicGas(clauses);
    const gasBuffer = 200000; // Adjust this buffer value as needed

    const blockRef = await getLatestBlockRef();

    // Use network-specific URLs and chainTag
    const nodeUrl = networkConfig[currentNetwork].transactionsUrl;
    const chainTag = networkConfig[currentNetwork].chainTag;

    let body = {
        chainTag: chainTag,
        blockRef: blockRef,
        expiration: 720,
        clauses: clauses,
        gasPriceCoef: 128,
        gas: gasEstimate + gasBuffer,
        dependsOn: null,
        nonce: '0x' + Math.floor(Math.random() * 100000000).toString(16)
    };

    const tx = new Transaction(body);
    const signingHash = tx.signingHash();
    tx.signature = secp256k1.sign(signingHash, privateKey);

    const raw = tx.encode();


    try {
        // Send the encoded and signed transaction to the Thor node's REST API
        const nodeUrl = networkConfig[currentNetwork].transactionsUrl;
        const response = await axios.post(nodeUrl, {
            raw: '0x' + raw.toString('hex') // Ensure the raw transaction is in the correct format
        });
        console.log('Transaction Response:', response.data);
        return response.data.id; // Return the transaction ID
    } catch (error) {
        console.error('Error with transaction in rewarding func:', error);
    }

}


async function getPrivateKeyFromMnemonic(mnemonicWords: string): Promise<Buffer | undefined> {
    try {
        // Split mnemonic words into an array
        const wordsArray = mnemonicWords.split(' ');

        // Validate the mnemonic
        const isValid = mnemonic.validate(wordsArray);
        if (!isValid) {
            throw new Error("Invalid mnemonic phrase.");
        }

        // Derive private key from mnemonic words according to BIP32
        const derivedPrivateKey = mnemonic.derivePrivateKey(wordsArray);
        if (!derivedPrivateKey) {
            throw new Error("Failed to derive a private key from the mnemonic.");
        }

        console.log(`Private Key:`, derivedPrivateKey.toString('hex'));

        const publicKey = secp256k1.derivePublicKey(derivedPrivateKey)
        const userAddress = address.fromPublicKey(publicKey)
        console.log('User address:', userAddress)

        return derivedPrivateKey;
    } catch (err) {
        console.error(`Error:`, (err as any).message);
        return undefined;
    }
}


async function getLatestBlockRef() {
    try {
        // Use network-specific URL for blocks
        const response = await axios.get(networkConfig[currentNetwork].blocksUrl);
        const blockRef = response.data.id.slice(0, 18);
        return blockRef;
    } catch (error) {
        console.error('Error fetching the latest block:', error);
        return '0x0000000000000000';
    }
}

