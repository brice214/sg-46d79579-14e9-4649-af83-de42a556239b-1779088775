/**
 * Service Frontend pour eBilling
 * Gestion des paiements de documents via Mobile Money (Gabon)
 * 
 * Ce service fait uniquement des appels fetch vers l'API backend.
 * Toute la logique métier et les vérifications se font côté serveur.
 */

import { 
  TransactionEbilling, 
  EbillingCheckoutRequest, 
  EbillingCheckoutResponse 
} from "@/types/ebilling";

const BASE_URL = "/api/payments/ebilling";

/**
 * Initie un paiement de document via eBilling
 * Cette fonction envoie les données au backend qui:
 * 1. Crée une transaction en DB
 * 2. Appelle l'API E-Billing pour obtenir un bill_id (555...)
 * 3. Retourne une page HTML avec formulaire POST auto-submit
 * 4. Redirige automatiquement vers le portail E-Billing
 * 
 * @param data - Informations du paiement (montant, client, document)
 * @returns Promise qui se résout avec la réponse HTML (redirection automatique)
 */
export async function initiateDocumentCheckout(
  data: EbillingCheckoutRequest
): Promise<EbillingCheckoutResponse> {
  console.log("🌐 Appel API /checkout...");
  console.log("URL:", `${BASE_URL}/checkout`);
  console.log("Payload:", JSON.stringify(data, null, 2));

  const response = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("📥 Réponse API reçue:");
  console.log("  - Status:", response.status);
  console.log("  - Status Text:", response.statusText);
  console.log("  - Headers:", Object.fromEntries(response.headers.entries()));

  // Lire la réponse brute
  const responseText = await response.text();
  console.log("  - Body (raw):", responseText.substring(0, 500)); // Premiers 500 caractères

  if (!response.ok) {
    console.error("❌ Erreur HTTP:", response.status);
    
    let errorData;
    try {
      errorData = JSON.parse(responseText);
      console.error("  - Error data (parsed):", errorData);
    } catch (e) {
      console.error("  - Error data (raw):", responseText);
      errorData = { error: "Erreur serveur" };
    }

    throw new Error(
      errorData.error || 
      errorData.message || 
      "Erreur lors de l'initialisation du paiement"
    );
  }

  // Parser le JSON si succès
  let jsonData;
  try {
    jsonData = JSON.parse(responseText);
    console.log("✅ Response parsed:", jsonData);
  } catch (e) {
    console.error("❌ Impossible de parser JSON:", e);
    throw new Error("Réponse invalide du serveur");
  }

  return jsonData;
}

/**
 * Helper : URL du portail eBilling selon l'environnement
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