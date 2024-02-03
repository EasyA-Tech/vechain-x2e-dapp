import React, { createContext, useState, useContext } from 'react';

type SignerContextType = {
    signer: string;
    setSigner: React.Dispatch<React.SetStateAction<string>>;
};

export const SignerContext = createContext<SignerContextType>({
    signer: '',
    setSigner: () => { }
});

export const useSigner = () => useContext(SignerContext);

export const SignerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [signer, setSigner] = useState('');

    return (
        <SignerContext.Provider value={{ signer, setSigner }}>
            {children}
        </SignerContext.Provider>
    );
};
