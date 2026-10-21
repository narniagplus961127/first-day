import Link from 'next/link';
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="FirstDay home">
      <span className="brand-mark">f</span>
      <span>FirstDay</span>
    </Link>
  );
}
