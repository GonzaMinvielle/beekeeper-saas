export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrgRole = 'owner' | 'admin' | 'member'
export type HiveType = 'langstroth' | 'dadant' | 'warre' | 'top_bar' | 'flow_hive' | 'layens' | 'other'
export type HiveStatus = 'active' | 'inactive' | 'dead' | 'sold'
export type QueenStatus = 'active' | 'superseded' | 'dead' | 'removed'
export type MarkingColor = 'white' | 'yellow' | 'red' | 'green' | 'blue'
export type ObservationCategory =
  | 'queen_sighting'
  | 'brood'
  | 'honey'
  | 'population'
  | 'disease'
  | 'pest'
  | 'behavior'
  | 'feeding'
  | 'treatment'
  | 'other'
export type OrgPlan = 'free' | 'basic' | 'pro'
export type SubPlan = 'free' | 'basic' | 'pro'
export type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
export type ForumCategory = 'disease' | 'harvest' | 'equipment' | 'general'
export type DiseaseSeverity = 'low' | 'medium' | 'high'
export type InspectionLevel = 'hive' | 'apiary'
export type WeatherCondition = 'soleado' | 'nublado' | 'lluvioso' | 'viento'
export type FloweringStatus = 'activa' | 'escasa' | 'nula'
export type InspectionDetailPriority = 'low' | 'medium' | 'high'
export type FoodType = 'azucar' | 'jarabe' | 'candy' | 'proteico' | 'polen' | 'otro'
export type RemovalReason = 'harvest' | 'other'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          plan: OrgPlan
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          plan?: OrgPlan
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          plan?: OrgPlan
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: OrgRole
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: OrgRole
          joined_at?: string
        }
        Update: {
          role?: OrgRole
        }
      }
      apiaries: {
        Row: {
          id: string
          organization_id: string
          name: string
          location: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          caretaker_name: string | null
          caretaker_phone: string | null
          field_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          caretaker_name?: string | null
          caretaker_phone?: string | null
          field_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          caretaker_name?: string | null
          caretaker_phone?: string | null
          field_name?: string | null
          updated_at?: string
        }
      }
      hives: {
        Row: {
          id: string
          organization_id: string
          apiary_id: string
          name: string
          code: string | null
          type: HiveType
          status: HiveStatus
          color: string | null
          installation_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          apiary_id: string
          name: string
          code?: string | null
          type?: HiveType
          status?: HiveStatus
          color?: string | null
          installation_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          code?: string | null
          type?: HiveType
          status?: HiveStatus
          color?: string | null
          installation_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      queens: {
        Row: {
          id: string
          organization_id: string
          hive_id: string
          marking_color: MarkingColor | null
          year_born: number | null
          breed: string | null
          status: QueenStatus
          notes: string | null
          installed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          hive_id: string
          marking_color?: MarkingColor | null
          year_born?: number | null
          breed?: string | null
          status?: QueenStatus
          notes?: string | null
          installed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          marking_color?: MarkingColor | null
          year_born?: number | null
          breed?: string | null
          status?: QueenStatus
          notes?: string | null
          installed_at?: string | null
          updated_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          organization_id: string
          hive_id: string | null
          inspector_id: string
          inspected_at: string
          weather: string | null
          temperature_c: number | null
          duration_min: number | null
          overall_health: number | null
          notes: string | null
          inspection_level: InspectionLevel
          apiary_id: string | null
          general_notes: string | null
          weather_conditions: WeatherCondition | null
          flowering_status: FloweringStatus | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          hive_id?: string | null
          inspector_id: string
          inspected_at?: string
          weather?: string | null
          temperature_c?: number | null
          duration_min?: number | null
          overall_health?: number | null
          notes?: string | null
          inspection_level?: InspectionLevel
          apiary_id?: string | null
          general_notes?: string | null
          weather_conditions?: WeatherCondition | null
          flowering_status?: FloweringStatus | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          hive_id?: string | null
          inspected_at?: string
          weather?: string | null
          temperature_c?: number | null
          duration_min?: number | null
          overall_health?: number | null
          notes?: string | null
          inspection_level?: InspectionLevel
          apiary_id?: string | null
          general_notes?: string | null
          weather_conditions?: WeatherCondition | null
          flowering_status?: FloweringStatus | null
          updated_at?: string
        }
      }
      apiary_inspection_details: {
        Row: {
          id: string
          inspection_id: string
          hive_id: string
          observation: string | null
          requires_attention: boolean
          priority: InspectionDetailPriority
          org_id: string
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          hive_id: string
          observation?: string | null
          requires_attention?: boolean
          priority?: InspectionDetailPriority
          org_id: string
          created_at?: string
        }
        Update: {
          observation?: string | null
          requires_attention?: boolean
          priority?: InspectionDetailPriority
        }
      }
      rainfall_records: {
        Row: {
          id: string
          org_id: string
          apiary_id: string
          date: string
          mm_recorded: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          apiary_id: string
          date: string
          mm_recorded: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          mm_recorded?: number
          notes?: string | null
        }
      }
      hive_supers: {
        Row: {
          id: string
          org_id: string
          hive_id: string
          placed_at: string
          removed_at: string | null
          removal_reason: RemovalReason | null
          harvest_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          hive_id: string
          placed_at: string
          removed_at?: string | null
          removal_reason?: RemovalReason | null
          harvest_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          removed_at?: string | null
          removal_reason?: RemovalReason | null
          harvest_id?: string | null
          notes?: string | null
        }
      }
      feedings: {
        Row: {
          id: string
          org_id: string
          hive_id: string | null
          apiary_id: string | null
          food_type: FoodType
          quantity_kg: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          hive_id?: string | null
          apiary_id?: string | null
          food_type: FoodType
          quantity_kg: number
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          hive_id?: string | null
          apiary_id?: string | null
          food_type?: FoodType
          quantity_kg?: number
          date?: string
          notes?: string | null
        }
      }
      observations: {
        Row: {
          id: string
          organization_id: string
          inspection_id: string
          category: ObservationCategory
          value: string | null
          numeric_value: number | null
          unit: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          inspection_id: string
          category: ObservationCategory
          value?: string | null
          numeric_value?: number | null
          unit?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          category?: ObservationCategory
          value?: string | null
          numeric_value?: number | null
          unit?: string | null
          notes?: string | null
        }
      }
      inspection_photos: {
        Row: {
          id: string
          organization_id: string
          inspection_id: string
          storage_path: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          caption: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          inspection_id: string
          storage_path: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          caption?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          caption?: string | null
        }
      }
      harvests: {
        Row: {
          id: string
          organization_id: string
          hive_id: string
          harvested_at: string
          weight_kg: number
          honey_type: string
          quality_notes: string | null
          batch_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          hive_id: string
          harvested_at?: string
          weight_kg: number
          honey_type?: string
          quality_notes?: string | null
          batch_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          hive_id?: string
          harvested_at?: string
          weight_kg?: number
          honey_type?: string
          quality_notes?: string | null
          batch_code?: string | null
          updated_at?: string
        }
      }
      honey_stock: {
        Row: {
          id: string
          organization_id: string
          honey_type: string
          quantity_kg: number
          last_updated: string
        }
        Insert: {
          id?: string
          organization_id: string
          honey_type: string
          quantity_kg?: number
          last_updated?: string
        }
        Update: {
          quantity_kg?: number
          last_updated?: string
        }
      }
      treatments: {
        Row: {
          id: string
          organization_id: string
          hive_id: string
          product_name: string
          dose: string | null
          applied_at: string
          applied_by: string | null
          next_check_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          hive_id: string
          product_name: string
          dose?: string | null
          applied_at?: string
          applied_by?: string | null
          next_check_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          hive_id?: string
          product_name?: string
          dose?: string | null
          applied_at?: string
          next_check_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      medications_stock: {
        Row: {
          id: string
          organization_id: string
          product_name: string
          quantity: number
          unit: string
          expiry_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          product_name: string
          quantity?: number
          unit?: string
          expiry_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          product_name?: string
          quantity?: number
          unit?: string
          expiry_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          organization_id: string
          hive_id: string | null
          title: string
          description: string | null
          due_date: string | null
          assigned_to: string | null
          status: string
          priority: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          hive_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          assigned_to?: string | null
          status?: string
          priority?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          hive_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          assigned_to?: string | null
          status?: string
          priority?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          type: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          type: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }
      expenses: {
        Row: {
          id: string
          organization_id: string
          hive_id: string | null
          category: string
          amount: number
          currency: string
          expense_date: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          hive_id?: string | null
          category?: string
          amount: number
          currency?: string
          expense_date?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          hive_id?: string | null
          category?: string
          amount?: number
          currency?: string
          expense_date?: string
          description?: string | null
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          organization_id: string
          honey_type: string
          quantity_kg: number
          price_per_kg: number
          total: number
          buyer_name: string | null
          sale_date: string
          batch_ref: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          honey_type?: string
          quantity_kg: number
          price_per_kg: number
          buyer_name?: string | null
          sale_date?: string
          batch_ref?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          honey_type?: string
          quantity_kg?: number
          price_per_kg?: number
          buyer_name?: string | null
          sale_date?: string
          batch_ref?: string | null
          notes?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: SubPlan
          status: SubStatus
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: SubPlan
          status?: SubStatus
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: SubPlan
          status?: SubStatus
          current_period_end?: string | null
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          content: string
          category: ForumCategory
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          content: string
          category?: ForumCategory
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          category?: ForumCategory
          likes?: number
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          likes?: number
          updated_at?: string
        }
      }
      disease_library: {
        Row: {
          id: string
          name: string
          description: string
          symptoms: string
          treatment: string
          severity: DiseaseSeverity
          photos: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          symptoms: string
          treatment: string
          severity?: DiseaseSeverity
          photos?: string[]
          created_at?: string
        }
        Update: {
          name?: string
          description?: string
          symptoms?: string
          treatment?: string
          severity?: DiseaseSeverity
          photos?: string[]
        }
      }
      flowering_calendar: {
        Row: {
          id: string
          organization_id: string
          plant_name: string
          start_month: number
          end_month: number
          region: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plant_name: string
          start_month: number
          end_month: number
          region?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          plant_name?: string
          start_month?: number
          end_month?: number
          region?: string | null
          notes?: string | null
        }
      }
    }
    Functions: {
      get_user_org_ids: {
        Args: Record<never, never>
        Returns: string[]
      }
      user_has_role: {
        Args: { p_org_id: string; p_roles: string[] }
        Returns: boolean
      }
      generate_inspection_tasks: {
        Args: { p_org_id: string }
        Returns: number
      }
    }
    Enums: Record<never, never>
  }
}

// Tipos de conveniencia — Etapa 1
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrgMember = Database['public']['Tables']['org_members']['Row']
export type Apiary = Database['public']['Tables']['apiaries']['Row']
export type Hive = Database['public']['Tables']['hives']['Row']
export type Queen = Database['public']['Tables']['queens']['Row']
export type Inspection = Database['public']['Tables']['inspections']['Row']
export type Observation = Database['public']['Tables']['observations']['Row']
export type InspectionPhoto = Database['public']['Tables']['inspection_photos']['Row']

// Tipos de conveniencia — Etapa 2
export type Harvest = Database['public']['Tables']['harvests']['Row']
export type HoneyStock = Database['public']['Tables']['honey_stock']['Row']
export type Treatment = Database['public']['Tables']['treatments']['Row']
export type MedicationStock = Database['public']['Tables']['medications_stock']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// Tipos de conveniencia — Etapa 3
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type FloweringEntry = Database['public']['Tables']['flowering_calendar']['Row']

export type ExpenseCategory = 'equipment' | 'medication' | 'feeding' | 'transport' | 'other'

// Tipos de conveniencia — Etapa 4
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type ForumPost = Database['public']['Tables']['forum_posts']['Row']
export type ForumReply = Database['public']['Tables']['forum_replies']['Row']
export type DiseaseEntry = Database['public']['Tables']['disease_library']['Row']

// Tipos de conveniencia — Etapa 5 (inspecciones de apiario + alimentación + alzas)
export type ApiaryInspectionDetail = Database['public']['Tables']['apiary_inspection_details']['Row']
export type Feeding = Database['public']['Tables']['feedings']['Row']
export type HiveSuper = Database['public']['Tables']['hive_supers']['Row']
export type RainfallRecord = Database['public']['Tables']['rainfall_records']['Row']

// Tipos de conveniencia — Equipo
export type OrgInvitation = {
  id: string
  organization_id: string
  invited_by: string
  role: OrgRole
  token: string
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}

export type OrgMemberWithEmail = {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  joined_at: string
  display_name: string | null
  email?: string
}

export const foodTypes: { value: FoodType; label: string }[] = [
  { value: 'azucar',    label: 'Azúcar' },
  { value: 'jarabe',    label: 'Jarabe' },
  { value: 'candy',     label: 'Candy' },
  { value: 'proteico',  label: 'Proteico' },
  { value: 'polen',     label: 'Polen' },
  { value: 'otro',      label: 'Otro' },
]

export const honeyTypes = [
  { value: 'multifloral',  label: 'Multifloral' },
  { value: 'monofloral',   label: 'Monofloral' },
  { value: 'acacia',       label: 'Acacia' },
  { value: 'eucalipto',    label: 'Eucalipto' },
  { value: 'citrus',       label: 'Citrus' },
  { value: 'trebol',       label: 'Trébol' },
  { value: 'girasol',      label: 'Girasol' },
  { value: 'other',        label: 'Otro' },
] as const
export type HoneyType = typeof honeyTypes[number]['value']
