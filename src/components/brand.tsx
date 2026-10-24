import Link from 'next/link';
export function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="FirstDay home">
      <span className="brand-mark">f</span>
      <span>FirstDay</span>
    </Link>
  );
}
