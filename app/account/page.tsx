import LogoutButton from '@/components/LogoutButton';

// Questa pagina ora può essere un Server Component puro e semplice.
// Per recuperare i dati, dovremmo fare un'altra chiamata API dal server
// usando il token che possiamo leggere dai cookie. Per semplicità,
// mostriamo solo un messaggio di benvenuto.

export default async function AccountPage() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Benvenuto nella tua Area Personale!</h1>
      <p>Se vedi questa pagina, il login ha funzionato correttamente.</p>
      <p>Il flusso OAuth 2.0 con Discovery Endpoint è stato completato.</p>
      <hr style={{ margin: '2rem 0' }} />
      <LogoutButton />
    </main>
  );
}