/**
 * TYPES eBILLING - AFRILITT
 * Définitions TypeScript pour l'intégration eBilling (paiement documents)
 */

// Statuts de transaction
export type EbillingStatus = 
  | "created"      // Transaction créée en DB
  | "pending"      // En attente de paiement (bill_id reçu)
  | "paid"         // Paiement confirmé
  | "processed"    // Traitement terminé (achat créé, accès document débloqué)
  | "failed"       // Échec
  | "expired";     // Expiré

// Opérateurs mobile money
export type EbillingOperator = 
  | "AIRTEL_MONEY" 
  | "MOOV_MONEY";

// Environnement eBilling
export type EbillingEnvironment = "LAB" | "PROD";

// Transaction complète
export interface TransactionEbilling {
  id: string;
  user_id: string | null;
  document_id: string;
  reference: string;
  ebilling_id: string | null;
  transaction_id: string | null;
  amount: number;
  status: EbillingStatus;
  operator: EbillingOperator | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string | null;
  short_description: string | null;
  metadata: {
    document_slug?: string;
    document_title?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

// Requête de checkout
export interface EbillingCheckoutRequest {
  document_id: string;
  amount: number;
  short_description: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address?: string;
  document_slug?: string;
  document_title?: string;
}

// Réponse de checkout
export interface EbillingCheckoutResponse {
  success: true;
  billId: string;           // ID eBilling (555...)
  paymentUrl: string;       // URL complète selon environnement:
                            // LAB: https://test.billing-easy.net?invoice={billId}&redirect_url={encodedUrl}
                            // PROD: https://www.billing-easy.com/payment?invoice={billId}&redirect_url={encodedUrl}
  successUrl: string;       // URL de retour après paiement
  reference: string;        // Référence interne
  transactionId?: string;   // ID transaction en DB
}

// Callback eBilling (webhook)
export interface EbillingCallbackPayload {
  reference: string;        // Référence interne
  amount: string | string[];
  transactionid: string;    // ID opérateur
  paymentsystem: string;    // Nom opérateur
  state?: string;           // Statut eBilling (paid, failed, etc.)
  billingid?: string;       // bill_id
}

// Configuration eBilling
export interface EbillingConfig {
  username: string;
  shared_key: string;
  environment: EbillingEnvironment;
  callback_url: string;
  success_url: string;
}