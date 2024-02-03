import React, { useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { Button, Stepper, Step, StepLabel, Typography, Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import styles from "../styles/Home.module.css";

import { useSigner } from "../state/signerContext";
import useWalletConnex from './useWalletConnex';


const EarnComponent = () => {
    const { data: session } = useSession();
    const [activeStep, setActiveStep] = useState(0);
    const [friendshipStatus, setFriendshipStatus] = useState<null | boolean>(null);

    const [airdropMessage, setAirdropMessage] = useState<React.ReactNode>('');



    const { signer, setSigner } = useSigner();

    const { handleConnectWallet, walletConnected } = useWalletConnex();

    const steps = ['Sign In', 'Connect Wallet', 'Claim Airdrop'];



    const handleNext = () => {
        switch (activeStep) {
            case 0:
                if (!session) {
                    alert("Please sign in first.");
                    return;
                }
                break;
            case 1:
                if (!walletConnected) {
                    alert("Please connect your wallet first.");
                    return;
                }
                break;
            case 2:
                if (friendshipStatus === null) {
                    alert("Please check your following status first.");
                    return;
                }
                if (!friendshipStatus) {
                    alert("You are not following the target account.");
                    return;
                }
                break;
            // No condition needed for the final step as it's a completion step
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };


    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleTwitterAPIRequest = async () => {
        if (!session) {
            alert("You are not signed in!");
            return;
        }
        const extendedSession = session as any;

        try {
            const response = await fetch('/api/reward', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken: extendedSession.accessToken,
                    accessSecret: extendedSession.refreshToken,
                    signer: signer,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setFriendshipStatus(data.response.data.following);

                // Regular expression to match URLs
                const urlRegex = /https?:\/\/[^\s]+/g;
                const urlMatch = data.message.match(urlRegex);

                if (urlMatch && urlMatch.length > 0) {
                    const url = urlMatch[0];
                    const messageWithLink = data.message.replace(url, '');

                    setAirdropMessage(
                        <>
                            {messageWithLink}
                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                                Here's the transaction
                            </a>
                        </>
                    );
                } else {
                    setAirdropMessage(data.message);
                }
            } else {
                console.error("Error fetching data from Twitter.");
                setFriendshipStatus(false);
                setAirdropMessage(data.message || "Failed to claim airdrop. Please try again."); // Fallback message if no message is provided
            }
        } catch (error) {
            console.error('Error making fetch request:', error);
            setAirdropMessage("Error occurred while communicating with the server.");
        }
    };


    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return session ? (
                    <>
                        Signed in as: {session.user?.name}.
                        <br />
                        <Button variant="contained" onClick={() => signOut()}>Sign out</Button>
                    </>
                ) : (
                    <>
                        Not signed in <br />
                        <Button variant="contained" onClick={() => signIn("twitter")}>Sign in</Button>
                    </>
                );
            case 1:
                return (
                    <div>
                        <Button
                            variant="contained"
                            onClick={handleConnectWallet}
                            disabled={walletConnected}
                        >
                            {walletConnected ? 'WALLET CONNECTED' : 'CONNECT WALLET'}
                        </Button>
                        <Typography>
                            {walletConnected ? "Proceed to next step" : ""}
                        </Typography>
                    </div>
                );
            case 2:
                return (
                    <>
                        <Button
                            variant="contained"
                            onClick={handleTwitterAPIRequest}
                            disabled={!session || !!friendshipStatus}
                        >
                            {friendshipStatus ? 'AIRDROP CLAIMED' : 'CLAIM AIRDROP'}
                        </Button>
                        <div>{airdropMessage}</div>
                    </>
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
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Earn 100 VET for following @EasyA_App</Typography>
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
                                    All steps completed. Congrats!
                                </Typography>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Typography sx={{ mt: 2, mb: 1 }}>
                                    {getStepContent(activeStep)}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                    <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                                        Back
                                    </Button>
                                    <Box sx={{ flex: '1 1 auto' }} />
                                    <Button onClick={handleNext} className={styles.buttonStyle}>
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

export default EarnComponent;
