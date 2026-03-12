import { NextResponse } from 'next/server';
import { generateStateAndSetCookie } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
    const clientId = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // 1. Scoperta dinamica dell'endpoint di autorizzazione
    const discoveryResponse = await fetch(`https://${shopDomain}/.well-known/openid-configuration`);
    const authConfig = await discoveryResponse.json();
    const authorizationEndpoint = authConfig.authorization_endpoint;

    if (!authorizationEndpoint) {
      throw new Error("Impossibile trovare l'endpoint di autorizzazione.");
    }
    
    // 2. Generazione dello 'state' per la sicurezza CSRF
    const state = await generateStateAndSetCookie();

    // 3. Costruzione dell'URL di autorizzazione come da documentazione
    const authUrl = new URL(authorizationEndpoint);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', 'openid email'); // Aggiungeremo gli altri scope dopo
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', `${appUrl}/api/auth/callback`);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('login_hint', 'grepdirect@gmail.com')

    // 4. Reindirizzamento dell'utente
    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    console.error("Errore durante l'avvio dell'autenticazione:", error);
    return NextResponse.redirect(new URL('/?error=start_failed', process.env.NEXT_PUBLIC_APP_URL!));
  }
}
