import { config } from '@/config'

export default function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id

  return (
    <div style={{ minHeight: '100vh', background: config.theme.bg, color: config.theme.text, fontFamily: "'Instrument Sans', sans-serif" }}>

      <header style={{ background: '#3A1E0E', padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Italiana', serif", fontSize: '1.7rem', color: '#E2B87E', letterSpacing: '0.05em' }}>
          {config.business.name}
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>

        {/* Icône succès */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(196,135,74,0.15)', border: `2px solid ${config.theme.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '1.8rem' }}>
          ✓
        </div>

        <h1 style={{ fontFamily: "'Italiana', serif", fontSize: '2rem', color: config.theme.text, fontWeight: 400, marginBottom: 12 }}>
          Réservation confirmée
        </h1>

        <p style={{ color: config.theme.textLight, lineHeight: 1.8, fontSize: '0.95rem', marginBottom: 32 }}>
          Votre paiement a bien été reçu. Un email de confirmation vous a été envoyé.<br />
          {config.business.name} vous contactera si nécessaire.
        </p>

        <div style={{ background: '#FBF4E4', border: `1px solid ${config.theme.border}`, borderRadius: 4, padding: '20px 28px', textAlign: 'left', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ color: config.theme.primary, fontSize: '1.2rem', marginTop: 2 }}>◆</div>
            <div>
              <div style={{ fontFamily: "'Italiana', serif", fontSize: '1.05rem', color: config.theme.text, marginBottom: 6 }}>
                Préparer votre séance
              </div>
              <div style={{ fontSize: '0.82rem', color: config.theme.textLight, lineHeight: 1.8 }}>
                · Venez en tenue légère et confortable<br />
                · Évitez les parfums forts avant la séance<br />
                · Prévenez en cas d'empêchement, merci ♥
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={config.business.websiteUrl}
            style={{ padding: '12px 24px', background: config.theme.primaryDark, color: '#F0E6CC', borderRadius: 4, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
            Retour au site
          </a>
          <a href={`https://wa.me/${config.business.phone.replace(/\s/g, '').replace(/^0/, '33')}?text=Bonjour%20Ella%2C%20je%20viens%20de%20réserver%20en%20ligne.`}
            style={{ padding: '12px 24px', background: 'transparent', color: config.theme.primaryDark, border: `1.5px solid ${config.theme.primary}`, borderRadius: 4, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
            Contacter Ella sur WhatsApp
          </a>
        </div>
      </main>
    </div>
  )
}
