export default function LoginButton() {
  // Link nativo: navigazione completa. Con router.push() Next.js fa una fetch,
  // la route risponde con 302 a Shopify e la fetch segue il redirect → CORS (shopify.com non invia Access-Control-Allow-Origin).
  return (
    <a href="/api/auth/start">Accedi o Registrati</a>
  );
}