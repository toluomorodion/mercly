import Link from 'next/link';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Mercly</h1>
      <p className={styles.subtitle}>
        Sell anything in seconds using just a link.
      </p>
      <p className={styles.description}>
        Upload a product, share the link, and get paid instantly.
      </p>
      <div className={styles.actions}>
        <Link href="/auth?mode=signup">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </main>
  );
}
