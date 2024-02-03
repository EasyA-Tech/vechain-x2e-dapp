import React, { useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSigner } from '../state/signerContext';
import useWalletConnex from './useWalletConnex';


const DepositComponent = () => {
    const [twitterHandle, setTwitterHandle] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [transactionSuccessful, setTransactionSuccessful] = useState(false);
    const { connex, vendor } = useWalletConnex();
    const { signer } = useSigner();


    const { handleConnectWallet, walletConnected } = useWalletConnex();

    const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setTwitterHandle(event.target.value);
    };

    const encodeFunctionCall = (cleanedTwitterHandle: string) => {
        if (connex) {
            const depositABI = {
                "constant": false,
                "inputs": [{ "name": "twitterUsername", "type": "string" }],
                "name": "depositAndSubmitUsername",
                "outputs": [],
                "payable": true,
                "stateMutability": "payable",
                "type": "function"
            };

            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

            if (!contractAddress) {
                throw new Error('CONTRACT_ADDRESS is not defined');
            }

            console.log(`contractAddress: `, contractAddress);

            const contractAccount = connex.thor.account(contractAddress);
            const depositMethod = contractAccount.method(depositABI);
            const depositClause = depositMethod.asClause(cleanedTwitterHandle);

            depositClause.value = "10000000000000000000"; // 10 VET in wei

            return depositClause;
        }
        return null;
    };

    const signTx = () => {
        console.log(`twitterHandle: `, twitterHandle);

        if (!twitterHandle) {
            alert("Please enter a Twitter handle.");
            return;
        }

        // Remove the '@' symbol if it exists
        const cleanedTwitterHandle = twitterHandle.trim().toLowerCase().replace('@', '');

        const twitterHandleRegex = /^@?(\w){1,15}$/;


        if (!twitterHandleRegex.test(cleanedTwitterHandle)) {
            alert("Please enter a valid Twitter handle.");
            return;
        }

        if (vendor && signer && connex) {
            const depositClause = encodeFunctionCall(cleanedTwitterHandle);

            if (depositClause) {
                vendor.sign("tx", [depositClause])
                    .signer(signer)
                    .comment("Make deposit to fund Twitter boost on your target account")
                    .request()
                    .then((r) => {
                        console.log(r);
                        setTransactionSuccessful(true);
                    })
                    .catch((e) => {
                        console.log("Error:" + e.message);
                        setTransactionSuccessful(false);
                    });
            }
        } else {
            alert("Please connect wallet first.");
        }
    };



    const steps = ['Connect Wallet', 'Enter Twitter Handle', 'Send VET'];

    const handleNext = () => {
        switch (activeStep) {
            case 0:
                if (!walletConnected) {
                    alert("Please connect your wallet first.");
                    return;
                }
                break;
            case 1:
                if (!twitterHandle) {
                    alert("Please enter a Twitter handle.");
                    return;
                }
                break;
            case 2:
                if (!transactionSuccessful) {
                    alert("Please send VET first.");
                    return;
                }
                break;
            default:
                break;
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <div>
                        <Button
                            variant="contained"
                            onClick={handleConnectWallet}
                            disabled={walletConnected}
                        >
                            {walletConnected ? 'WALLET CONNECTED' : 'Connect wallet'}
                        </Button>
                        <Typography>
                            {walletConnected ? "Proceed to next step" : ""}
                        </Typography>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Twitter Handle"
                            value={twitterHandle}
                            onChange={handleInputChange}
                        />
                        <Typography>
                            Enter Twitter Handle to boost
                        </Typography>
                    </div>
                );
            case 2:
                return (
                    <Button
                        variant="contained"
                        onClick={signTx}
                        disabled={transactionSuccessful}
                    >
                        {transactionSuccessful ? 'CAMPAIGN SUCCESSFULLY ENABLED' : 'Send VET to smart contract'}
                    </Button>
                );
            default:
                return 'Unknown Step';
        }
    };


    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });


    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: '50%', maxWidth: 600, p: 2, border: '1px solid gray', borderRadius: '4px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', bgcolor: 'background.paper' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Deposit funds </Typography>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <div>
                        {activeStep === steps.length ? (
                            <React.Fragment>
                                <Typography sx={{ mt: 2, mb: 1 }}>
                                    All steps completed. Congrats! Your campaign is now live.
                                </Typography>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Typography sx={{ mt: 2, mb: 1 }}>
                                    {getStepContent(activeStep)}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                    <Button
                                        color="inherit"
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        sx={{ mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                    <Box sx={{ flex: '1 1 auto' }} />
                                    <Button onClick={handleNext}>
                                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </Box>
                            </React.Fragment>
                        )}
                    </div>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default DepositComponent;
