import type { NextApiRequest, NextApiResponse } from "next";

/**
 * ENDPOINT DE TEST - Simule un callback eBilling
 * 
 * Usage:
 * POST /api/payments/ebilling/test-callback
 * Body: { "reference": "REF-1780923725908-611" }
 * 
 * Cet endpoint récupère la dernière transaction pending et simule un callback
 * eBilling réussi pour tester le workflow complet.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        error: "Référence requise",
        usage: "POST { reference: 'REF-xxx' }"
      });
    }

    // Simuler le callback eBilling
    const callbackPayload = {
      reference: reference,
      amount: "1000", // Sera vérifié contre la transaction
      transactionid: "TEST-" + Date.now(),
      paymentsystem: "Test-Money",
      state: "paid",
      billingid: "TEST-BILLING"
    };

    console.log("🧪 TEST CALLBACK - Simulation d'un callback eBilling");
    console.log("Payload simulé:", callbackPayload);

    // Appeler le vrai endpoint callback
    const callbackUrl = `${req.headers.host}/api/payments/ebilling/callback`;
    const protocol = req.headers.host?.includes("localhost") ? "http" : "https";
    
    const response = await fetch(`${protocol}://${callbackUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callbackPayload),
    });

    const result = await response.json();

    return res.status(200).json({
      success: true,
      message: "Test callback exécuté",
      callbackResponse: result,
      callbackStatus: response.status
    });

  } catch (error: any) {
    console.error("❌ Erreur test callback:", error);
    return res.status(500).json({
      error: "Erreur lors du test",
      message: error.message
    });
  }
}