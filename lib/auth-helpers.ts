// lib/auth-helpers.ts
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

// Funzione per generare lo 'state' e salvarlo in un cookie
export async function generateStateAndSetCookie(): Promise<string> {
  const state = randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('shopify_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10, // 10 minuti
  });
  return state;
}

// Funzione per validare lo 'state' al momento del callback
export async function validateState(request: NextRequest): Promise<boolean> {
  const stateFromUrl = request.nextUrl.searchParams.get('state');
  const stateFromCookie = request.cookies.get('shopify_oauth_state')?.value;

  // Puliamo il cookie dopo averlo letto
  if (stateFromCookie) {
    const cookieStore = await cookies();
    cookieStore.delete('shopify_oauth_state');
  }

  if (!stateFromUrl || !stateFromCookie || stateFromUrl !== stateFromCookie) {
    return false;
  }
  return true;
}

// Funzione per creare l'header di autorizzazione per client confidential
export function getAuthorizationHeader(): string {
  const clientId = process.env.SHOPIFY_HEADLESS_CLIENT_ID!;
  const clientSecret = process.env.SHOPIFY_HEADLESS_CLIENT_SECRET!;
  const credentials = btoa(`${clientId}:${clientSecret}`);
  return `Basic ${credentials}`;
}