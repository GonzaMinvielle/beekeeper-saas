export type PlanId = 'free' | 'basic' | 'pro'

export const PLANS = {
  free: {
    id: 'free' as PlanId,
    name: 'Gratuito',
    price: 0,
    priceId: null as string | null,
    maxHives: 5,
    maxUsers: 1,
    features: [
      'Hasta 5 colmenas',
      '1 usuario',
      'Inspecciones y tareas',
      'Registro de cosechas',
    ],
    missing: [
      'Exportar PDF',
      'Informes avanzados',
      'Múltiples usuarios',
      'Soporte prioritario',
    ],
  },
  basic: {
    id: 'basic' as PlanId,
    name: 'Básico',
    price: 9,
    priceId: process.env.STRIPE_PRICE_BASIC ?? null,
    maxHives: 20,
    maxUsers: 3,
    features: [
      'Hasta 20 colmenas',
      'Hasta 3 usuarios',
      'Exportar PDF',
      'Informes completos',
      'Gestión financiera',
      'Soporte por email',
    ],
    missing: [
      'Colmenas ilimitadas',
      'Usuarios ilimitados',
      'Soporte prioritario',
    ],
  },
  pro: {
    id: 'pro' as PlanId,
    name: 'Profesional',
    price: 25,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    maxHives: Infinity,
    maxUsers: Infinity,
    features: [
      'Colmenas ilimitadas',
      'Usuarios ilimitados',
      'Todas las funciones incluidas',
      'Exportar PDF y Excel',
      'API de datos',
      'Soporte prioritario 24/7',
    ],
    missing: [] as string[],
  },
} as const
