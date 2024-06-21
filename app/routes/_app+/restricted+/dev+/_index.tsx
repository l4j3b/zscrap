import { redirect } from '@remix-run/react';
import { $path } from 'remix-routes';

export function loader() {
  return redirect($path('/restricted/dev/ui'));
}
