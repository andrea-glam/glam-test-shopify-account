import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get('customer_id_token')?.value;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  let redirectUrl = new URL('/', appUrl);

  if (idToken) {
    try {
      const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
      const discoveryResponse = await fetch(`https://${shopDomain}/.well-known/openid-configuration`);
      const authConfig = await discoveryResponse.json();
      const endSessionEndpoint = authConfig.end_session_endpoint;

      if (endSessionEndpoint) {
        const logoutUrl = new URL(endSessionEndpoint);
        logoutUrl.searchParams.set('id_token_hint', idToken);
        logoutUrl.searchParams.set('post_logout_redirect_uri', appUrl);
        redirectUrl = logoutUrl;

      }
    } catch (error) {
      console.error("Errore durante la scoperta dell'endpoint di logout. Eseguo solo il logout locale.", error);
    }
  } else {
    console.log("ID Token non trovato. Eseguo solo il logout locale.");
  }

  // Cancellazione cookie: stessi path/options usati in callback, così il browser li rimuove.
  const response = NextResponse.redirect(redirectUrl);
  const cookieOptions = { path: '/', secure: true, sameSite: 'lax' as const };
  response.cookies.set('customer_access_token', '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set('customer_refresh_token', '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set('customer_id_token', '', { ...cookieOptions, maxAge: 0 });
  return response;
}
