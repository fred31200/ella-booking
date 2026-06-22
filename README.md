# Application de réservation & paiement

Application Next.js réutilisable pour la prise de rendez-vous en ligne avec paiement sécurisé via Stripe.

---

## Déploiement en 4 étapes

### 1. Créer un compte Stripe (gratuit)

1. Va sur https://stripe.com et crée un compte
2. Dans le dashboard Stripe → **Développeurs → Clés API**
3. Copie la **Clé secrète** (`sk_test_...`) et la **Clé publiable** (`pk_test_...`)

---

### 2. Déployer sur Vercel (gratuit)

1. Va sur https://vercel.com et connecte-toi avec GitHub
2. **"Add New Project"** → importe le dossier `booking-app` depuis ton repo GitHub
3. Dans les **Variables d'environnement**, ajoute :

| Variable | Valeur |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (depuis Stripe) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (depuis Stripe) |
| `NEXT_PUBLIC_BASE_URL` | `https://ton-app.vercel.app` |
| `STRIPE_WEBHOOK_SECRET` | Rempli à l'étape 4 |

4. Clique **Deploy** — l'app est en ligne en 2 minutes

---

### 3. Connecter la base de données (Vercel KV)

1. Dans ton projet Vercel → onglet **Storage**
2. **"Create Database"** → choisir **KV**
3. Clique **Connect** sur ton projet
4. Les variables `KV_REST_API_URL` et `KV_REST_API_TOKEN` sont ajoutées automatiquement

---

### 4. Configurer le webhook Stripe

1. Dans Stripe → **Développeurs → Webhooks**
2. **"Ajouter un endpoint"**
3. URL : `https://ton-app.vercel.app/api/webhook`
4. Événement à écouter : `checkout.session.completed`
5. Copie le **Signing secret** (`whsec_...`)
6. Dans Vercel → Variables d'environnement → ajoute `STRIPE_WEBHOOK_SECRET`
7. **Redéploie** (1 clic dans Vercel)

---

### 5. (Optionnel) Activer les emails de notification

Pour recevoir un email à chaque réservation :
1. Crée un compte sur https://resend.com (gratuit jusqu'à 3000 emails/mois)
2. Ajoute `RESEND_API_KEY` dans les variables Vercel
3. Dans `src/app/api/webhook/route.js`, décommente le bloc `sendNotificationToElla`

---

## Réutiliser pour un autre projet

Modifier uniquement le fichier **`src/config/index.js`** :
- Nom, email, téléphone du praticien
- Couleurs du thème
- Horaires de travail
- Liste des services (nom, prix, durée)

Tout le reste s'adapte automatiquement.

---

## Passer en mode production Stripe

Quand tu es prêL à encaisser de vrais paiements :
1. Dans Stripe, bascule de **"Test"** à **"Live"**
2. Remplace les clés `sk_test_...` par les clés live `sk_live_...`
3. Recrée le webhook avec les clés live
4. Mets à jour les variables dans Vercel et redéploie

---

## Structure du projet

```
src/
├── config/index.js        ← Configuration (à modifier par projet)
├── lib/
│   ├── slots.js           ← Logique de génération des créneaux
│   └── bookings.js        ← Stockage des réservations (Vercel KV)
└── app/
    ├── page.js            ← Wizard de réservation (5 étapes)
    ├── success/page.js    ← Page de confirmation
    └── api/
        ├── slots/         ← GET  créneaux disponibles
        ├── checkout/      ← POST session Stripe
        └── webhook/       ← POST événements Stripe
```
