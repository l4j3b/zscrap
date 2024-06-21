import { Link } from '@remix-run/react';
import { $path } from 'remix-routes';

export default function Footer() {
  return (
    <section>
      <div className="flex justify-center gap-8 p-3 align-middle text-sm text-foreground">
        <span>©2024 j3b LLC</span>
        <Link to={$path('/privacy')}>Privacy policy</Link>
        <Link to={$path('/terms-of-use')}>Terms & Conditions</Link>
      </div>
    </section>
  );
}
