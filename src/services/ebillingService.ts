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
    const errorData = await response.json().catch(() => ({ error: "Erreur serveur" }));
    throw new Error(errorData.error || errorData.message || "Erreur lors de l'initialisation du paiement");
  }

  return response.json();
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