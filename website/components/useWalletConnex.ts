import { useState, useMemo } from 'react';
import Connex from '@vechain/connex';
import { useSigner } from "../state/signerContext";

import { networkConfig, currentNetwork } from '../consts/networkconfigs';

const useWalletConnex = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const { setSigner } = useSigner();

    const { connex, vendor } = useMemo(() => {
        const connexInstance = new Connex({
            node: networkConfig[currentNetwork].nodeUrl,
            network: networkConfig[currentNetwork].networkName,
        });
        const vendorInstance = new Connex.Vendor(networkConfig[currentNetwork].networkName);
        return { connex: connexInstance, vendor: vendorInstance };
    }, []);


    const handleConnectWallet = () => {
        if (vendor) {
            vendor.sign("cert", {
                purpose: "identification",
                payload: {
                    type: "text",
                    content: "Connect your wallet to log in"
                }
            })
                .request()
                .then((r) => {
                    setSigner(r.annex.signer);
                    setWalletConnected(true);
                })
                .catch(() => {
                    setSigner('User Canceled');
                    setWalletConnected(false);
                });
        }
    };

    return { connex, vendor, walletConnected, handleConnectWallet };
};

export default useWalletConnex;
