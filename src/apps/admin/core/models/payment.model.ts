export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type PaymentType = 'monthly_dues' | 'annual_affiliation' | 'refund'

export interface AdminPaymentUserSummary {
  id: string
  full_name: string
  email?: string
  phone?: string
}

export interface AdminPayment {
  id: string
  reference: string
  user: AdminPaymentUserSummary
  type: PaymentType
  method?: string
  amount: number
  status: PaymentStatus
  period_year?: number
  period_month?: number
  created_at: string
}

export interface AdminPaymentListData {
  total: number
  page: number
  pages: number
  payments: AdminPayment[]
}

export interface AdminPaymentListParams {
  page?: number
  limit?: number
  status?: PaymentStatus
  type?: PaymentType
}

export interface ActivatePaymentRequest {
  reference: string
}

export interface RevenueDayItem {
  day: string
  value: number
}

export interface PaymentMethodBreakdown {
  method: string
  percent: number
  count: number
  color: string
}

export interface PaymentOverview {
  total_payments: number
  total_revenue_ghs: number
  successful_count: number
  pending_count: number
  failed_count: number
  dues_collected_ghs: number
  affiliation_collected_ghs: number
  weekly_revenue: RevenueDayItem[]
  payment_methods: PaymentMethodBreakdown[]
}

export interface PaymentConfig {
  monthly_dues_amount_ghs: number
  annual_affiliation_amount_ghs: number
  annual_total_ghs?: number
  currency: string
  default_provider: string
  combined_monthly?: boolean
  paystack_enabled: boolean
  moolre_enabled: boolean
}
