export default function LogoutButton() {
  // Tag <a> nativo: navigazione completa così il browser invia tutti i cookie.
  // Con <Link> Next.js può fare una fetch lato client che a volte non include i cookie.
  return (
    <a href="/api/auth/logout">Esegui il Logout</a>
  );
}
