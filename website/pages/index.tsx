import type { NextPage } from "next";
import dynamic from 'next/dynamic';
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import "firebase/compat/auth";
import React from "react";

const ConnexComponent = dynamic(() => import('../components/DepositComponent'), {
  ssr: false,
});

const StepperComponent = dynamic(() => import('../components/EarnComponent'), { ssr: false });


const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.heroBackground}>
            <div className={styles.heroBackgroundInner}>
              <Image
                src="/hero-gradient.png"
                width={1390}
                height={1390}
                alt="Background gradient from red to blue"
                quality={100}
                className={styles.gradient}
              />
            </div>
          </div>
          <div className={styles.heroAssetFrame}>
            <Image
              src="/hero-asset-3.png"
              width={860}
              height={540}
              alt="Hero asset, X to Earn dApp"
              quality={100}
              className={styles.heroAsset}
            />
          </div>
          <div className={styles.heroBodyContainer}>
            <div className={styles.heroBody}>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleGradient}>
                  X to Earn dApp
                </span>
                <br />
                Grow your following at warp speed.
              </h1>
              <p className={styles.heroSubtitle}>
                <Link
                  className={styles.link}
                  href="https://easya.io"
                  target="_blank"
                >
                  EasyA
                </Link>{" "}
                empowers you to learn about Web3 in <b>minutes</b>, <i>not years or even months</i>.
              </p>

              <div className={styles.heroCtaContainer}>
                <Link className={styles.heroCta} href="/earn">
                  Earn
                </Link>
                <Link
                  className={styles.secondaryCta}
                  href="/deposit"
                >
                  Deposit
                </Link>
              </div>
            </div>
          </div>
        </div>
        <ConnexComponent />
        <p></p>
        <StepperComponent />
      </div>
    </div>
  );
};

export default Home;
