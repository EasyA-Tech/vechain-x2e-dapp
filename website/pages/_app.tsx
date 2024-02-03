import type { AppProps } from "next/app";
import { Navbar } from "../components/Navbar/Navbar";
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react"
import { SignerProvider } from "../state/signerContext";

function MyApp({ Component, pageProps: { session, ...pageProps }, }: AppProps) {

  return (
    <SessionProvider session={session}>
      <Navbar />
      <SignerProvider>
        <Component {...pageProps} />
      </SignerProvider>
    </SessionProvider>
  );
}

export default MyApp;
