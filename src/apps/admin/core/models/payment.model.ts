export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type PaymentType = 'bundle_purchase' | 'delivery_payment' | 'refund'

export interface AdminPaymentCustomerSummary {
  id: string
  full_name: string
  email?: string
  phone?: string
}

export interface AdminPayment {
  id: string
  reference: string
  customer: AdminPaymentCustomerSummary
  type: PaymentType
  method?: string
  amount: number
  status: PaymentStatus
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
