import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '5rem' }}>
       <h1>App Headless con Autenticazione Ufficiale Shopify</h1>
      <LoginButton />
    </main>
  );
}