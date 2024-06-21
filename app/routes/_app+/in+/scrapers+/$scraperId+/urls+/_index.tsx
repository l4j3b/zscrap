import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { $params, $path } from 'remix-routes';

export async function loader({ params }: LoaderFunctionArgs) {
  const { scraperId } = $params('/in/scrapers/:scraperId', params);

  return redirect($path('/in/scrapers/:scraperId', { scraperId }));
}
