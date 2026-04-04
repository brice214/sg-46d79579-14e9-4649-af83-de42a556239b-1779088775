import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Client admin (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🔵 eBilling Checkout API - START");
  console.log("═══════════════════════════════════════════════════════");

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ═════════════════════════════════════════════════════════
    // ÉTAPE 1 : VALIDATION DES DONNÉES
    // ═════════════════════════════════════════════════════════
    console.log("📋 ÉTAPE 1: Validation des données");
    console.log("Body reçu:", JSON.stringify(req.body, null, 2));

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
      console.log("❌ Données manquantes:", { document_id, amount, client_name, client_email, client_phone });
      return res.status(400).json({
        error: "Données manquantes",
        required: ["document_id", "amount", "client_name", "client_email", "client_phone"]
      });
    }
    console.log("✅ Validation OK");

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 2 : CHARGER CONFIGURATION eBILLING
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 2: Chargement configuration eBilling");
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: usernameData, error: usernameError } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ebilling_username")
      .single();

    console.log("Username query result:", { data: usernameData, error: usernameError });

    const { data: sharedKeyData, error: sharedKeyError } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ebilling_sharedkey")
      .single();

    console.log("Sharedkey query result:", { data: sharedKeyData, error: sharedKeyError });

    const { data: modeData, error: modeError } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ebilling_mode")
      .single();

    console.log("Mode query result:", { data: modeData, error: modeError });

    const username = usernameData?.value;
    const sharedKey = sharedKeyData?.value;
    const environment = modeData?.value || "LAB";

    console.log("Configuration chargée:", { 
      username: username ? "***" : "MANQUANT", 
      sharedKey: sharedKey ? "***" : "MANQUANT", 
      environment 
    });

    if (!username || !sharedKey) {
      console.log("❌ Configuration eBilling manquante");
      return res.status(500).json({
        error: "Configuration eBilling manquante",
        message: "Configurez eBilling dans Admin → Configuration → Paiement"
      });
    }
    console.log("✅ Configuration OK");

    // URLs
    const apiUrl = environment === "PROD"
      ? "https://www.billing-easy.com/api/v1/merchant/e_bills"
      : "https://lab.billing-easy.net/api/v1/merchant/e_bills";
    
    const portalUrl = environment === "PROD"
      ? "https://www.billing-easy.com"
      : "https://test.billing-easy.net";

    const successUrl = `${req.headers.origin || "http://localhost:3000"}/paiement/success`;
    const callbackUrl = `${req.headers.origin || "http://localhost:3000"}/api/payments/ebilling/callback`;

    console.log("URLs configurées:", { apiUrl, portalUrl, successUrl, callbackUrl });

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 3 : GÉNÉRER RÉFÉRENCE UNIQUE
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 3: Génération référence");
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const reference = `REF-${timestamp}-${random}`;
    console.log("Référence générée:", reference);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 4 : CRÉER TRANSACTION EN DB (status: created)
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 4: Création transaction en DB");
    const transactionData = {
      document_id,
      amount: parseFloat(amount),
      status: "created",
      reference,
      client_name,
      client_email,
      client_phone,
      client_address: client_address || "Libreville, Gabon",
      short_description: short_description || `Achat: ${document_title}`,
      metadata: {
        document_slug,
        document_title,
        created_at: new Date().toISOString()
      }
    };
    console.log("Données transaction:", JSON.stringify(transactionData, null, 2));

    const { data: transaction, error: createError } = await supabase
      .from("ebilling_transactions")
      .insert(transactionData)
      .select()
      .single();

    if (createError) {
      console.error("❌ Erreur création transaction:", createError);
      return res.status(500).json({
        error: "Erreur création transaction",
        details: createError.message
      });
    }

    console.log("✅ Transaction créée:", transaction.id);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 5 : APPELER API eBILLING
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 5: Appel API eBilling");
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

    console.log("Payload eBilling:", JSON.stringify(ebillingPayload, null, 2));

    // Basic Auth : username:shared_key encodé en base64
    const authString = `${username}:${sharedKey}`;
    const base64Auth = Buffer.from(authString).toString("base64");
    console.log("Auth string (masked):", `${username}:***`);
    console.log("Base64 auth (first 20 chars):", base64Auth.substring(0, 20) + "...");

    console.log("Appel fetch vers:", apiUrl);

    const ebillingResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${base64Auth}`
      },
      body: JSON.stringify(ebillingPayload)
    });

    console.log("Response status:", ebillingResponse.status);
    console.log("Response headers:", Object.fromEntries(ebillingResponse.headers.entries()));

    if (!ebillingResponse.ok) {
      const errorText = await ebillingResponse.text();
      console.error("❌ API eBilling error:", errorText);
      
      // Supprimer la transaction créée
      console.log("🗑️ Suppression transaction:", transaction.id);
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
    console.log("✅ Réponse eBilling:", JSON.stringify(ebillingData, null, 2));

    const billId = ebillingData?.e_bill?.bill_id || ebillingData?.bill_id;

    if (!billId) {
      console.error("❌ Bill ID manquant dans la réponse");
      return res.status(500).json({
        error: "Bill ID non reçu",
        response: ebillingData
      });
    }

    console.log("✅ Bill ID reçu:", billId);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 6 : MISE À JOUR TRANSACTION (status: pending)
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 6: Mise à jour transaction");
    await supabase
      .from("ebilling_transactions")
      .update({
        status: "pending",
        ebilling_id: billId,
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.id);

    console.log("✅ Transaction mise à jour: pending");

    // ═════════════════════════════════════════════════════════
    // SUCCÈS : RETOURNER DONNÉES POUR REDIRECTION
    // ═════════════════════════════════════════════════════════
    const successResponse = {
      success: true,
      billId,
      redirectUrl: portalUrl,
      successUrl,
      reference
    };

    console.log("✅ SUCCÈS - Réponse finale:", JSON.stringify(successResponse, null, 2));
    console.log("═══════════════════════════════════════════════════════");

    return res.status(200).json(successResponse);

  } catch (error: any) {
    console.error("❌❌❌ EXCEPTION CRITIQUE ❌❌❌");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    console.error("═══════════════════════════════════════════════════════");
    
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
}