import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";

export function Navbar() {

  return (
    <div className={styles.navContainer}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={`${styles.homeLink} ${styles.navLeft}`}>
            <Image
              src="/logo-2.png"
              width={48}
              height={48}
              alt="NFT marketplace sample logo"
            />
          </Link>
          <div className={styles.navMiddle}>
            <Link href="/deposit" className={styles.link}>
              Deposit
            </Link>
            <Link href="/earn" className={styles.link}>
              Earn
            </Link>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.navConnect}>
          </div>
        </div>
      </nav>
    </div>
  );
}
