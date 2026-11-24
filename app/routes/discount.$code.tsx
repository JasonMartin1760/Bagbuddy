import {redirect} from 'react-router';
import type {Route} from './+types/discount.$code';

/**
 * Discount links (/discount/CODE) are turned off for Bag Buddy (Jason's
 * call: no discount codes). The link still works as a redirect so old URLs
 * don't 404, but no code is applied to the cart.
 */
export function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  let redirectParam =
    searchParams.get('redirect') || searchParams.get('return_to') || '/';

  if (redirectParam.includes('//')) {
    // Avoid redirecting to external URLs to prevent phishing attacks
    redirectParam = '/';
  }

  return redirect(redirectParam);
}
