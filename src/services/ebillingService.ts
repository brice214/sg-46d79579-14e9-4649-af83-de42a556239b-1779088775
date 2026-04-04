import { supabase } from "@/integrations/supabase/client";
import { 
  TransactionEbilling, 
  EbillingCheckoutRequest, 
  EbillingCheckoutResponse 
} from "@/types/ebilling";

/**
 * Service Frontend pour eBilling
 * Gestion des paiements de documents via Mobile Money (Gabon)
 */

const BASE_URL = "/api/payments/ebilling";

/**
 * Initie un paiement de document via eBilling
 * @returns {billId, redirectUrl, reference}
 */
export async function initiateDocumentCheckout(
  data: EbillingCheckoutRequest
): Promise<EbillingCheckoutResponse> {
  const response = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'initialisation du paiement");
  }

  return response.json();
}

/**
 * Vérifie le statut d'une transaction
 */
export async function checkTransactionStatus(
  reference: string
): Promise<TransactionEbilling | null> {
  const { data, error } = await supabase
    .from("ebilling_transactions")
    .select("*")
    .eq("reference", reference)
    .single();

  if (error) {
    console.error("Erreur vérification transaction:", error);
    return null;
  }

  return data as TransactionEbilling;
}

/**
 * Récupère l'historique des transactions d'un utilisateur
 */
export async function getUserTransactions(
  userId: string
): Promise<TransactionEbilling[]> {
  const { data, error } = await supabase
    .from("ebilling_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération transactions:", error);
    return [];
  }

  return (data || []) as TransactionEbilling[];
}

/**
 * Helper : URL du portail eBilling
 */
export function getEbillingPortalUrl(env: "LAB" | "PROD"): string {
  return env === "LAB"
    ? "https://test.billing-easy.net"
    : "https://www.billing-easy.com";
}

/**
 * Helper : Vérifier si une transaction a réussi
 */
export function isTransactionSuccessful(status: string): boolean {
  return status === "paid" || status === "processed";
}