// ─────────────────────────────────────────────────────────────
// FICHIER DE CONFIGURATION — à modifier pour chaque projet
// ─────────────────────────────────────────────────────────────

export const config = {

  // ── Informations du praticien ──────────────────────────────
  business: {
    name: 'Ella Anglade',
    tagline: 'Massages Traditionnels Indiens',
    phone: '06 58 89 31 64',
    notificationEmail: 'lesmassagesdefred@gmail.com', // reçoit les notifs de réservation
    location: 'Mas Saint Laurent · Argelès-sur-Mer',
    websiteUrl: 'https://fred31200.github.io/ella-anglade/',
  },

  // ── Couleurs (adapter pour chaque projet) ─────────────────
  theme: {
    primary:     '#C4874A',
    primaryDark: '#8B4A2A',
    bg:          '#F0E6CC',
    bgCard:      '#EAD9B8',
    text:        '#3A1E0E',
    textLight:   '#6B4C35',
    border:      'rgba(196,135,74,0.3)',
  },

  // ── Planning ───────────────────────────────────────────────
  schedule: {
    timezone:      'Europe/Paris',
    days:          [1, 2, 3, 4, 5, 6], // 0=Dim, 1=Lun ... 6=Sam
    startHour:     9,
    endHour:       20,
    bufferMinutes: 15, // temps de préparation entre 2 séances
    daysAhead:     60, // combien de jours à l'avance on peut réserver
  },

  // ── Services ───────────────────────────────────────────────
  // Pour réutiliser pour un autre projet : modifier uniquement ce tableau
  services: [
    {
      id:          'abhyanga',
      name:        'Abhyanga',
      subtitle:    'Soin Signature',
      description: 'Massage corps complet personnalisé. Plus de 10 protocoles maîtrisés, adapté à votre état du moment.',
      duration:    75,   // minutes
      price:       70,   // euros
    },
    {
      id:          'abhyanga-pro',
      name:        'Abhyanga Prolongé',
      subtitle:    'Version approfondie',
      description: 'Immersion prolongée pour un travail en profondeur des tissus et une détente totale.',
      duration:    115,
      price:       90,
    },
    {
      id:          'shirobhyanga',
      name:        'Shirobhyanga',
      subtitle:    'Crâne · nuque · épaules',
      description: 'Le massage de la tête, le plus précieux de l\'Ayurvéda. Apaise le système nerveux et favorise le sommeil.',
      duration:    40,
      price:       45,
    },
    {
      id:          'pada',
      name:        'Pada Abhyanga',
      subtitle:    'Réflexologie · pieds & jambes',
      description: 'Les pieds, carte du corps entier. Huiles essentielles réchauffantes. Idéal pour les jambes lourdes.',
      duration:    45,
      price:       45,
    },
    {
      id:          'integral',
      name:        'Soin Intégral',
      subtitle:    'Abhyanga + Shirobhyanga',
      description: 'Une immersion totale dans l\'univers ayurvédique. Corps et tête. Reconnexion profonde.',
      duration:    120,
      price:       120,
    },
    {
      id:          'udvartana',
      name:        'Udvartana',
      subtitle:    'Massage détox aux poudres',
      description: 'Massage aux poudres de farine de pois chiches et épices. Active la circulation, élimine les toxines.',
      duration:    60,
      price:       70,
    },
    {
      id:          'udvartana-legs',
      name:        'Udvartana Jambes',
      subtitle:    'Ciblé jambes & circulation',
      description: 'Version ciblée sur les jambes pour une sensation de légèreté et une meilleure circulation.',
      duration:    30,
      price:       40,
    },
  ],
}
