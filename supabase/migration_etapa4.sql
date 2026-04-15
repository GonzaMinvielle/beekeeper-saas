-- ============================================================
-- ETAPA 4 — Suscripciones, Comunidad, Biblioteca de Enfermedades
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. SUBSCRIPTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free','basic','pro')),
  status                  text NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','trialing','past_due','canceled','incomplete')),
  current_period_end      timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_org" ON subscriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Insertar suscripción gratuita para organizaciones existentes
INSERT INTO subscriptions (organization_id, plan, status)
SELECT id, 'free', 'active' FROM organizations
ON CONFLICT (organization_id) DO NOTHING;

-- ── 2. FORUM_POSTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  content         text NOT NULL,
  category        text NOT NULL DEFAULT 'general'
                    CHECK (category IN ('disease','harvest','equipment','general')),
  likes           integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_posts_org" ON forum_posts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- ── 3. FORUM_REPLIES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_replies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL,
  likes      integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_replies_visible" ON forum_replies
  FOR ALL USING (
    post_id IN (
      SELECT fp.id FROM forum_posts fp
      WHERE fp.organization_id IN (
        SELECT organization_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );

-- ── 4. DISEASE_LIBRARY ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disease_library (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text NOT NULL,
  symptoms    text NOT NULL,
  treatment   text NOT NULL,
  severity    text NOT NULL DEFAULT 'medium'
                CHECK (severity IN ('low','medium','high')),
  photos      text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE disease_library ENABLE ROW LEVEL SECURITY;

-- Solo lectura para usuarios autenticados; sin escritura desde la app
CREATE POLICY "disease_library_read" ON disease_library
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── 5. SEED: Biblioteca de enfermedades ───────────────────────
INSERT INTO disease_library (name, description, symptoms, treatment, severity) VALUES
(
  'Varroa',
  'Ácaro parásito Varroa destructor que se alimenta de la hemolinfa de las abejas adultas y sus larvas, debilitando progresivamente la colonia.',
  'Abejas adultas con alas deformadas o truncadas (DWV), abdomen reducido. Presencia visible de ácaros de color marrón rojizo adheridos a adultos y pupas. Larvas y pupas muertas en celdillas.',
  'Ácido oxálico (goteo o vaporización), ácido fórmico, timol o acaricidas sintéticos (amitraz, fluvalinate). Aplicar preferentemente en ausencia de cría operculada para mayor eficacia. Rotar principios activos para evitar resistencias.',
  'high'
),
(
  'Nosema',
  'Infección por microsporidios Nosema apis o Nosema ceranae que parasita el intestino medio de abejas adultas, afectando su capacidad de digestión y longevidad.',
  'Abejas incapaces de volar, abdomen distendido, diarrea (manchas amarillo-marrón en piquera y paredes). Disminución gradual de la población, debilidad general de la colonia. N. ceranae puede no mostrar síntomas visibles evidentes.',
  'Fumagilina (donde esté permitida por regulación). Renovación de reinas con genética resistente. Sustitución de panales viejos. Alimentación proteica de refuerzo en primavera. Mantener colmenas ventiladas y sin estrés hídrico.',
  'medium'
),
(
  'Loque americana',
  'Enfermedad bacteriana altamente contagiosa causada por Paenibacillus larvae. Destruye larvas antes de que completen la pupación. Sus esporas pueden sobrevivir décadas en el material apícola.',
  'Larvas muertas de color marrón oscuro con olor fétido similar a pegamento o cola. Opérculos hundidos, oscuros y perforados. Prueba del palillo: la masa necrótica se estira más de 10 mm como hilo pegajoso. Costras difíciles de desprender.',
  'Notificación obligatoria a autoridades sanitarias. Quema o esterilización del material infectado. Tratamiento con oxitetraciclina o lincomicina (según normativa local). No mover material entre colmenas. La desinfección del equipo es fundamental.',
  'high'
),
(
  'Loque europea',
  'Enfermedad bacteriana causada por Melissococcus plutonius que afecta larvas jóvenes de 3 a 5 días antes de la operculación.',
  'Larvas muertas o moribundas de color amarillo a marrón, derretidas y sin forma en las celdillas, con olor agrio pero menos intenso que la loque americana. Los opérculos generalmente no están afectados. La colonia puede recuperarse espontáneamente en temporada fuerte.',
  'Mejorar condiciones de la colmena y alimentación proteica. Antibióticos (oxitetraciclina) donde estén autorizados y bajo prescripción veterinaria. Reemplazar reinas. Retirar panales muy afectados. Menor riesgo que la loque americana.',
  'medium'
),
(
  'Sacbrood (Cría ensacada)',
  'Enfermedad viral causada por el virus Sacbrood (SBV) que impide a la larva realizar la muda final, convirtiéndola en un saco lleno de líquido.',
  'Larvas muertas de color amarillo a negro con aspecto de bolsa o saco acuoso, cabeza erguida. Sin olor intenso. Opérculos ocasionalmente hundidos o perforados. Las abejas higiénicas suelen eliminar las larvas afectadas sin que la enfermedad se extienda.',
  'No existe tratamiento específico ni aprobado. Reemplazar la reina para romper el ciclo. Mantener colonias fuertes con buena alimentación. Retirar panales muy afectados. Generalmente la colonia se recupera sola en primavera-verano.',
  'low'
),
(
  'Cría yesificada (Ascosferosis)',
  'Enfermedad fúngica causada por Ascosphaera apis que momifica las larvas de obrera y zángano, convirtiéndolas en masas calcáreas duras.',
  'Larvas muertas endurecidas de aspecto calcáreo, blancas (fase vegetativa) o gris/negras (esporuladas), en celdillas o expulsadas en la piquera. Alta humedad y estrés favorecen su aparición.',
  'Mejorar la ventilación de la colmena y reducir la humedad. Reemplazar reinas con genética de comportamiento higiénico. Retirar y destruir panales muy afectados. No existe tratamiento químico eficaz autorizado en la mayoría de países.',
  'medium'
),
(
  'Acariosis (Acarapisosis)',
  'Infestación por el ácaro microscópico Acarapis woodi que parasita las tráqueas del primer par torácico de las abejas adultas, dificultando su respiración y vuelo.',
  'Abejas incapaces de volar, arrastrándose frente a la piquera (síndrome K), alas asimétricas o en posición anormal en forma de K. Disminución progresiva de la población adulta, especialmente en primavera.',
  'Mentol en cristales (15-50 g por colmena en clima cálido ≥18°C). Aceite de wintergreen en jarabe. Ácido fórmico. Los tratamientos son más efectivos en otoño o en ausencia de cría de zánganos.',
  'medium'
),
(
  'Pequeño escarabajo de la colmena',
  'Coleóptero Aethina tumida originario de África subsahariana, plaga invasora establecida en América, Australia y partes de Europa. Las larvas devoran miel, cera y crías.',
  'Presencia de escarabajos adultos pequeños (5-7 mm), ovalados, de color castaño a negro. Larvas blancas con filas de espinas en el dorso que destruyen panales y fermentan la miel. Olor a putrefacción característico. Colonias débiles son especialmente vulnerables.',
  'Trampas con aceite vegetal dentro de la colmena. Mantener colonias fuertes con suficientes abejas para defender el espacio. Tratamiento del suelo con coumaphos cerca de la colmena. Inspección y cuarentena estricta del material. Notificación a autoridades en zonas donde sea enfermedad de declaración obligatoria.',
  'high'
),
(
  'Polilla de la cera',
  'Lepidóptero Galleria mellonella (polilla grande) o Achroia grisella (polilla pequeña) cuyas larvas se alimentan de cera, proteínas y desechos de la colmena.',
  'Galerías y telas sedosas sobre los panales, larvas blanquecinas de hasta 28 mm que perforan y destruyen la cera. Excrementos oscuros en los panales. Daña principalmente colmenas débiles o material almacenado sin protección.',
  'Mantener colonias fuertes con buena población. Congelar panales a -15°C durante 24 horas para destruir huevos y larvas. Para material almacenado: SO₂, cristales de timol o paradichlorobenceno (según normativa). Limpiar y ventilar el material entre temporadas.',
  'low'
),
(
  'Parálisis crónica de las abejas (CBPV)',
  'Enfermedad viral causada por el virus de la parálisis crónica de las abejas (CBPV) que afecta abejas adultas, con dos síndromes clínicos distintos.',
  'Tipo 1: abejas temblorosas, incapaces de volar, abdomen hinchado, alas en posición abierta en V. Tipo 2: abejas pequeñas, negras y lustrosas, sin pelo (aspecto de "abejas negras lampiñas"), expulsadas agresivamente por las nodrizas. Alta mortalidad en piquera.',
  'No existe tratamiento específico. Reemplazar reina por una de estirpe resistente. Evitar hacinamiento y estrés nutricional. Mantener colonias bien alimentadas. La enfermedad tiende a ser autolimitante pero puede causar pérdidas importantes si se desencadena en colmenas débiles.',
  'medium'
);
