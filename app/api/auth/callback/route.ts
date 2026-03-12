import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthorizationHeader, validateState } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  if (!(await validateState(request))) {
    return NextResponse.redirect(new URL('/?error=invalid_state', process.env.NEXT_PUBLIC_APP_URL!));
  }

  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', process.env.NEXT_PUBLIC_APP_URL!));
  }

  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const discoveryResponse = await fetch(`https://${shopDomain}/.well-known/openid-configuration`);
    const authConfig = await discoveryResponse.json();
    const tokenEndpoint = authConfig.token_endpoint;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': getAuthorizationHeader(),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SHOPIFY_HEADLESS_CLIENT_ID!,
        redirect_uri: `${appUrl}/api/auth/callback`,
        code: code,
      }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || 'Scambio del token fallito');
    }

    const { access_token, expires_in, refresh_token, id_token } = data; // Assicurati di avere 'id_token'

    if (!id_token) {
        throw new Error("L'id_token non è stato restituito da Shopify.");
    }

    const cookieStore = await cookies();
    cookieStore.set('customer_access_token', access_token, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax',
      maxAge: expires_in,
    });
    cookieStore.set('customer_refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax',
    });
    // SALVIAMO L'ID TOKEN
    cookieStore.set('customer_id_token', id_token, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax',
      // L'id_token ha la sua scadenza, ma per semplicità lo leghiamo a quella dell'access token
      maxAge: expires_in,
    });

    return NextResponse.redirect(new URL('/account', appUrl));
  } catch (error: unknown) {
    console.error("Errore nel callback:", error);
    const message = error instanceof Error ? error.message : 'unknown';
    return NextResponse.redirect(new URL(`/?error=callback_failed&message=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_APP_URL!));
  }
}