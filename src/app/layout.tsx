import type { Metadata } from 'next';
import './globals.css';
import './design.css';
export const metadata: Metadata = {
  title: 'FirstDay',
  description: 'A warmer welcome to work.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
