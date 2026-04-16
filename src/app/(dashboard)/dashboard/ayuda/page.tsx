import Link from 'next/link'

const sections = [
  {
    id: 'resumen',
    icon: '🏠',
    title: 'Panel de Control',
    href: '/dashboard',
    content: [
      {
        subtitle: '¿Qué muestra?',
        text: 'La pantalla principal te da una vista rápida de toda tu actividad apícola: cantidad de apiarios, colmenas activas, inspecciones realizadas, kilos cosechados, tareas pendientes e ingresos del año.',
      },
      {
        subtitle: 'Alertas automáticas',
        text: 'Si tenés medicamentos que vencen en los próximos 30 días, aparece un aviso naranja con el nombre del producto y los días restantes. Hacé click para ir directamente a Tratamientos.',
      },
      {
        subtitle: 'Últimas inspecciones',
        text: 'Muestra las 5 inspecciones más recientes con la colmena, fecha y estado de salud (Crítico / Malo / Regular / Bueno / Excelente).',
      },
      {
        subtitle: 'Tareas pendientes',
        text: 'Lista las 5 tareas más urgentes ordenadas por prioridad y fecha límite. Las tareas vencidas aparecen en rojo.',
      },
    ],
  },
  {
    id: 'apiarios',
    icon: '📍',
    title: 'Apiarios',
    href: '/dashboard/apiaries',
    content: [
      {
        subtitle: '¿Qué es un apiario?',
        text: 'Un apiario es una ubicación geográfica donde tenés colmenas. Podés tener varios apiarios en distintos campos o provincias.',
      },
      {
        subtitle: 'Crear un apiario',
        text: 'Completá nombre, dirección o referencia, y marcá la ubicación en el mapa (hacé click en el mapa para fijar el punto). También podés ingresar los datos del puestero: nombre, teléfono y nombre del campo.',
      },
      {
        subtitle: 'Pronóstico de lluvia',
        text: 'En la ficha de cada apiario con coordenadas cargadas, se muestra el pronóstico de las próximas 6 horas con íconos de clima y probabilidad de precipitación. Si hay lluvia en las próximas 2 horas, aparece una alerta azul.',
      },
      {
        subtitle: 'Datos del puestero',
        text: 'Guardá el nombre y teléfono del encargado del campo para tenerlo siempre a mano. También podés registrar el nombre del establecimiento.',
      },
      {
        subtitle: 'Colmenas del apiario',
        text: 'Desde la ficha del apiario podés ver todas las colmenas que tiene asignadas, con su estado actual (Activa / Inactiva / Muerta / Vendida).',
      },
    ],
  },
  {
    id: 'colmenas',
    icon: '🏡',
    title: 'Colmenas',
    href: '/dashboard/hives',
    content: [
      {
        subtitle: 'Crear una colmena',
        text: 'Cada colmena tiene un nombre, un código alfanumérico (opcional), tipo de colmena (Langstroth, Dadant, Warré, Top Bar, Flow Hive, Layens u Otro), y se asocia a un apiario.',
      },
      {
        subtitle: 'Estados de colmena',
        text: 'Activa: en producción normal. Inactiva: temporalmente sin actividad. Muerta: colonia perdida. Vendida: la colmena ya no está en el apiario.',
      },
      {
        subtitle: 'Reina',
        text: 'Podés registrar la reina de cada colmena con su color de marcado (blanco, amarillo, rojo, verde, azul según el año), raza, año de nacimiento y estado.',
      },
      {
        subtitle: 'Historial',
        text: 'Desde la ficha de cada colmena podés ver todas las inspecciones, cosechas y tratamientos realizados, ordenados cronológicamente.',
      },
    ],
  },
  {
    id: 'inspecciones',
    icon: '📋',
    title: 'Inspecciones',
    href: '/dashboard/inspections',
    content: [
      {
        subtitle: 'Registrar una inspección',
        text: 'Seleccioná la colmena, la fecha y hora, y completá los datos: condición climática, temperatura, duración en minutos y salud general (1 a 5, donde 5 es excelente).',
      },
      {
        subtitle: 'Observaciones',
        text: 'Podés agregar observaciones detalladas por categoría: avistamiento de reina, estado de cría, miel, población, enfermedades, plagas, comportamiento, alimentación, tratamientos y otras notas.',
      },
      {
        subtitle: 'Fotos',
        text: 'Podés adjuntar fotos a la inspección para documentar visualmente el estado de las colmenas.',
      },
      {
        subtitle: 'Uso sin conexión (offline)',
        text: 'Las inspecciones funcionan sin internet. Si salís al campo sin señal, podés registrar inspecciones normalmente. Cuando vuelvas a tener conexión, los datos se sincronizan automáticamente con la base de datos.',
      },
    ],
  },
  {
    id: 'cosechas',
    icon: '🍯',
    title: 'Cosechas',
    href: '/dashboard/harvests',
    content: [
      {
        subtitle: 'Registrar una cosecha',
        text: 'Asociá la cosecha a una colmena, ingresá el peso en kg, el tipo de miel (multifloral, monofloral, acacia, eucalipto, citrus, trébol, girasol u otro), código de lote y notas de calidad.',
      },
      {
        subtitle: 'Stock de miel',
        text: 'El sistema mantiene automáticamente el stock por tipo de miel. Cuando registrás una venta, el stock se reduce. También podés ajustar el stock manualmente si procesás miel fuera del sistema.',
      },
      {
        subtitle: 'Trazabilidad',
        text: 'Cada cosecha queda vinculada a la colmena de origen, lo que te permite saber exactamente de dónde viene cada lote de miel.',
      },
    ],
  },
  {
    id: 'tratamientos',
    icon: '💊',
    title: 'Tratamientos',
    href: '/dashboard/treatments',
    content: [
      {
        subtitle: 'Stock de medicamentos',
        text: 'Registrá todos tus medicamentos con nombre, cantidad, unidad y fecha de vencimiento. El sistema te avisa automáticamente cuando alguno vence en los próximos 30 días.',
      },
      {
        subtitle: 'Registrar un tratamiento',
        text: 'Cuando aplicás un tratamiento, registrá: producto, dosis, colmena tratada, fecha de aplicación, quién lo aplicó, fecha de próxima revisión y notas.',
      },
      {
        subtitle: 'Alertas de seguimiento',
        text: 'Si la fecha de próxima revisión está dentro de 7 días, el tratamiento aparece destacado para que no se te pase.',
      },
    ],
  },
  {
    id: 'tareas',
    icon: '✅',
    title: 'Tareas',
    href: '/dashboard/tasks',
    content: [
      {
        subtitle: 'Crear una tarea',
        text: 'Cada tarea tiene título, descripción, prioridad (Urgente / Alta / Media / Baja), fecha límite y puede estar asociada a una colmena específica.',
      },
      {
        subtitle: 'Estados de tarea',
        text: 'Pendiente → En progreso → Terminada. Podés mover las tareas entre estados con un click. Las tareas terminadas quedan en el historial y se pueden reabrir.',
      },
      {
        subtitle: 'Tareas automáticas',
        text: 'El sistema genera automáticamente recordatorios de inspección para colmenas que no fueron revisadas recientemente. Estas aparecen como tareas pendientes.',
      },
      {
        subtitle: 'Tareas vencidas',
        text: 'Las tareas con fecha límite pasada aparecen en rojo con un contador de cuántas están vencidas.',
      },
    ],
  },
  {
    id: 'finanzas',
    icon: '💰',
    title: 'Finanzas',
    href: '/dashboard/finances',
    content: [
      {
        subtitle: 'Ventas',
        text: 'Registrá cada venta con: tipo de miel, kilos vendidos, precio por kilo, nombre del comprador, fecha y referencia de lote. El total se calcula automáticamente.',
      },
      {
        subtitle: 'Gastos',
        text: 'Registrá todos tus gastos con categoría (Equipamiento / Medicamentos / Alimentación / Transporte / Otros), monto, fecha, descripción y colmena asociada (opcional).',
      },
      {
        subtitle: 'Resumen financiero',
        text: 'En la parte superior ves el total de ingresos, total de gastos y margen neto del período. El margen se muestra en verde si es positivo y en rojo si es negativo.',
      },
    ],
  },
  {
    id: 'informes',
    icon: '📊',
    title: 'Informes',
    href: '/dashboard/reports',
    content: [
      {
        subtitle: '¿Qué muestra?',
        text: 'Estadísticas anuales: total cosechado en kg, ingresos, gastos y margen neto. Gráficos de producción mensual y finanzas mensuales (ingresos vs. gastos).',
      },
      {
        subtitle: 'Ranking de colmenas',
        text: 'Lista las 10 colmenas más productivas del año con el porcentaje que representa cada una sobre el total cosechado.',
      },
      {
        subtitle: 'Tabla mensual',
        text: 'Desglose mes a mes de kg cosechados, ingresos, gastos y margen. Útil para detectar estacionalidad y comparar rendimientos.',
      },
      {
        subtitle: 'Imprimir',
        text: 'Podés imprimir el informe completo con el botón de impresión. El layout está optimizado para impresión en papel.',
      },
    ],
  },
  {
    id: 'clima',
    icon: '🌤️',
    title: 'Clima',
    href: '/dashboard/weather',
    content: [
      {
        subtitle: 'Clima por apiario',
        text: 'Muestra las condiciones meteorológicas actuales para cada apiario con coordenadas cargadas: temperatura, humedad, viento y descripción del cielo.',
      },
      {
        subtitle: 'Calendario de floración',
        text: 'Registrá las plantas que florecen en tu zona con sus meses de inicio y fin. En la vista mensual podés ver qué está floreciendo ahora para planificar mejor tus cosechas.',
      },
      {
        subtitle: 'Agregar entrada de floración',
        text: 'Nombre de la planta, mes de inicio, mes de fin, región y notas opcionales. Las entradas activas (mes actual dentro del rango) aparecen destacadas con 🌸.',
      },
    ],
  },
  {
    id: 'foro',
    icon: '💬',
    title: 'Foro Comunitario',
    href: '/dashboard/community',
    content: [
      {
        subtitle: '¿Para qué sirve?',
        text: 'Espacio para compartir experiencias, hacer preguntas y conectar con otros apicultores de tu organización. Podés filtrar publicaciones por categoría: Enfermedades, Cosechas, Equipamiento o General.',
      },
      {
        subtitle: 'Crear una publicación',
        text: 'Hacé click en "Nueva publicación", escribí el título, el contenido y elegí la categoría. Tu nombre aparecerá como autor.',
      },
      {
        subtitle: 'Responder',
        text: 'Entrá a cualquier publicación y escribí tu respuesta al final. El autor original recibe una notificación automática cuando alguien comenta.',
      },
      {
        subtitle: 'Eliminar',
        text: 'Solo podés eliminar tus propias publicaciones y respuestas.',
      },
    ],
  },
  {
    id: 'enfermedades',
    icon: '🔬',
    title: 'Biblioteca de Enfermedades',
    href: '/dashboard/community/diseases',
    content: [
      {
        subtitle: '¿Qué contiene?',
        text: 'Referencia completa de las principales enfermedades y plagas de las abejas: Varroa, Nosema, Loque Americana, Loque Europea, Sacbrood, Ascosferosis, Acariosis, Pequeño escarabajo, Polilla de cera, CBPV y más.',
      },
      {
        subtitle: 'Información por enfermedad',
        text: 'Cada entrada incluye: descripción de la enfermedad, síntomas para identificarla en el campo, tratamiento recomendado y nivel de severidad (Alto / Medio / Bajo).',
      },
      {
        subtitle: 'Búsqueda',
        text: 'Usá el buscador para encontrar rápidamente una enfermedad por nombre o síntoma.',
      },
    ],
  },
  {
    id: 'notificaciones',
    icon: '🔔',
    title: 'Notificaciones',
    content: [
      {
        subtitle: 'Notificaciones push',
        text: 'Podés activar notificaciones push para recibir alertas en tu dispositivo incluso cuando no tenés la app abierta. El botón de activación aparece en el dashboard.',
      },
      {
        subtitle: 'Tipos de notificaciones',
        text: 'Respuestas al foro: cuando alguien comenta en una publicación tuya. Alertas de lluvia: cuando se esperan lluvias en un apiario en las próximas 2 horas.',
      },
      {
        subtitle: 'Alertas de lluvia',
        text: 'El sistema consulta el pronóstico meteorológico cada hora para todos tus apiarios con coordenadas. Si la probabilidad de lluvia supera el 70% en las próximas 2 horas, recibís una notificación para que puedas tomar precauciones.',
      },
    ],
  },
  {
    id: 'offline',
    icon: '📶',
    title: 'Uso Sin Conexión (Offline)',
    content: [
      {
        subtitle: 'Cómo funciona',
        text: 'Appicultor Pro es una Progressive Web App (PWA). Esto significa que, una vez que abriste la app con conexión, los recursos quedan guardados en tu dispositivo y podés usarla sin internet.',
      },
      {
        subtitle: 'Inspecciones offline',
        text: 'Cuando estás en el campo sin señal, podés registrar inspecciones normalmente. Los datos se guardan localmente en tu dispositivo. Cuando vuelvas a tener conexión, se sincronizan automáticamente con el servidor.',
      },
      {
        subtitle: 'Instalar en el celular',
        text: 'En Android: abrí la app en Chrome y tocá "Agregar a pantalla de inicio". En iOS (Safari): tocá el ícono de compartir y luego "Agregar a pantalla de inicio". La app se instala como si fuera nativa.',
      },
      {
        subtitle: 'Banner offline',
        text: 'Cuando perdés la conexión aparece un banner naranja en la parte superior avisándote que estás en modo offline. Desaparece automáticamente cuando volvés a conectarte.',
      },
    ],
  },
  {
    id: 'planes',
    icon: '⭐',
    title: 'Planes y Suscripción',
    href: '/pricing',
    content: [
      {
        subtitle: 'Plan Gratuito',
        text: 'Hasta 5 colmenas, 1 apiario, 1 usuario. Incluye inspecciones básicas y acceso a la biblioteca de enfermedades. Sin costo, sin tarjeta de crédito.',
      },
      {
        subtitle: 'Plan Básico',
        text: 'Hasta 20 colmenas, 3 apiarios, 3 usuarios. Incluye cosechas, tratamientos, alertas de lluvia y soporte por email.',
      },
      {
        subtitle: 'Plan Profesional',
        text: 'Colmenas y apiarios ilimitados, usuarios ilimitados, finanzas avanzadas, informes exportables y soporte prioritario.',
      },
      {
        subtitle: 'Cambiar plan',
        text: 'Podés cambiar tu plan en cualquier momento desde la sección Planes en el menú. Los cambios se aplican inmediatamente.',
      },
    ],
  },
]

const tips = [
  { icon: '💡', text: 'Cargá las coordenadas de tus apiarios para activar el pronóstico de lluvia y las alertas automáticas.' },
  { icon: '📱', text: 'Instalá la app en tu celular para usarla en el campo sin internet.' },
  { icon: '🔔', text: 'Activá las notificaciones push para recibir alertas de lluvia y respuestas del foro.' },
  { icon: '📸', text: 'Adjuntá fotos en las inspecciones para documentar el estado de las colmenas a lo largo del tiempo.' },
  { icon: '📅', text: 'Usá las tareas automáticas para que el sistema te recuerde qué colmenas necesitan inspección.' },
  { icon: '💰', text: 'Registrá todos los gastos y ventas para ver tu rentabilidad real en los Informes.' },
]

export default function AyudaPage() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manual de usuario</h1>
        <p className="text-gray-500 text-sm mt-1">Guía completa para usar Appicultor Pro</p>
      </div>

      {/* Índice */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Contenido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1D9E75] transition-colors py-1"
            >
              <span>{s.icon}</span>
              <span>{s.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Tips rápidos */}
      <div className="bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] rounded-2xl p-6 text-white">
        <h2 className="font-bold text-lg mb-4">⚡ Consejos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">{tip.icon}</span>
              <p className="text-sm text-green-50 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secciones */}
      {sections.map((section) => (
        <div
          key={section.id}
          id={section.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-6"
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="font-bold text-gray-900 text-lg">{section.title}</h2>
            </div>
            {section.href && (
              <Link
                href={section.href}
                className="text-xs font-semibold text-[#1D9E75] hover:text-[#0F6E56] transition-colors"
              >
                Ir al módulo →
              </Link>
            )}
          </div>

          {/* Section content */}
          <div className="p-6 space-y-5">
            {section.content.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1 shrink-0 bg-[#1D9E75]/20 rounded-full mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{item.subtitle}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="text-center py-6 text-sm text-gray-400">
        ¿Necesitás más ayuda? Usá el{' '}
        <Link href="/dashboard/community" className="text-[#1D9E75] hover:underline font-medium">
          Foro comunitario
        </Link>{' '}
        para consultar a otros apicultores.
      </div>
    </div>
  )
}
