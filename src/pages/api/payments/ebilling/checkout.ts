import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { platformSettingsService } from "@/services/platformSettingsService";

// Client admin (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ═════════════════════════════════════════════════════════
    // ÉTAPE 1 : VALIDATION DES DONNÉES
    // ═════════════════════════════════════════════════════════
    const {
      document_id,
      amount,
      client_name,
      client_email,
      client_phone,
      client_address,
      short_description,
      document_slug,
      document_title
    } = req.body;

    if (!document_id || !amount || !client_name || !client_email || !client_phone) {
      return res.status(400).json({
        error: "Données manquantes",
        required: ["document_id", "amount", "client_name", "client_email", "client_phone"]
      });
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 2 : CHARGER CONFIGURATION eBILLING
    // ═════════════════════════════════════════════════════════
    const username = await platformSettingsService.getSetting("ebilling_username");
    const sharedKey = await platformSettingsService.getSetting("ebilling_sharedkey");
    const environment = await platformSettingsService.getSetting("ebilling_mode") || "LAB";

    if (!username || !sharedKey) {
      return res.status(500).json({
        error: "Configuration eBilling manquante",
        message: "Configurez eBilling dans Admin → Configuration → Paiement"
      });
    }

    // URLs
    const apiUrl = environment === "PROD"
      ? "https://www.billing-easy.com/api/v1/merchant/e_bills"
      : "https://lab.billing-easy.net/api/v1/merchant/e_bills";
    
    const portalUrl = environment === "PROD"
      ? "https://www.billing-easy.com"
      : "https://test.billing-easy.net";

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const successUrl = `${origin}/paiement/success`;
    const callbackUrl = `${origin}/api/payments/ebilling/callback`;

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 3 : GÉNÉRER RÉFÉRENCE UNIQUE
    // ═════════════════════════════════════════════════════════
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const reference = `AFRILITT-${timestamp}-${random}`;

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 4 : CRÉER TRANSACTION EN DB (status: created)
    // ═════════════════════════════════════════════════════════
    const { data: transaction, error: createError } = await supabase
      .from("ebilling_transactions")
      .insert({
        document_id,
        amount: parseFloat(amount),
        status: "created",
        reference,
        client_name,
        client_email,
        client_phone,
        client_address: client_address || "Libreville, Gabon",
        short_description: short_description || `Achat document: ${document_title || "Document"}`,
        metadata: {
          document_slug,
          document_title,
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (createError) {
      console.error("❌ Erreur création transaction:", createError);
      return res.status(500).json({
        error: "Erreur création transaction",
        details: createError.message
      });
    }

    console.log("✅ Transaction créée:", transaction.id, reference);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 5 : APPELER API eBILLING
    // ═════════════════════════════════════════════════════════
    const ebillingPayload = {
      amount: parseFloat(amount),
      short_description: short_description || `Achat: ${document_title}`,
      payer_email: client_email,
      payer_msisdn: client_phone,
      payer_name: client_name,
      external_reference: reference,
      success_url: successUrl,
      callback_url: callbackUrl
    };

    console.log("📤 Envoi à eBilling:", ebillingPayload);

    // Basic Auth : username:shared_key encodé en base64
    const authString = `${username}:${sharedKey}`;
    const base64Auth = Buffer.from(authString).toString("base64");

    const ebillingResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${base64Auth}`
      },
      body: JSON.stringify(ebillingPayload)
    });

    if (!ebillingResponse.ok) {
      const errorText = await ebillingResponse.text();
      console.error("❌ API eBilling error:", errorText);
      
      // Supprimer la transaction créée
      await supabase
        .from("ebilling_transactions")
        .delete()
        .eq("id", transaction.id);
      
      return res.status(500).json({
        error: "Erreur API eBilling",
        details: errorText
      });
    }

    const ebillingData = await ebillingResponse.json();
    console.log("📥 Réponse eBilling:", ebillingData);

    const billId = ebillingData?.e_bill?.bill_id || ebillingData?.bill_id;

    if (!billId) {
      console.error("❌ Bill ID manquant:", ebillingData);
      
      // Supprimer la transaction créée
      await supabase
        .from("ebilling_transactions")
        .delete()
        .eq("id", transaction.id);
      
      return res.status(500).json({
        error: "Bill ID non reçu",
        response: ebillingData
      });
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 6 : MISE À JOUR TRANSACTION (status: pending)
    // ═════════════════════════════════════════════════════════
    await supabase
      .from("ebilling_transactions")
      .update({
        status: "pending",
        ebilling_id: billId,
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.id);

    console.log("✅ Transaction mise à jour: pending, bill_id:", billId);

    // ═════════════════════════════════════════════════════════
    // SUCCÈS : RETOURNER DONNÉES POUR REDIRECTION
    // ═════════════════════════════════════════════════════════
    return res.status(200).json({
      success: true,
      billId,
      redirectUrl: portalUrl,
      successUrl,
      reference
    });

  } catch (error: any) {
    console.error("❌ Erreur checkout:", error);
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
}