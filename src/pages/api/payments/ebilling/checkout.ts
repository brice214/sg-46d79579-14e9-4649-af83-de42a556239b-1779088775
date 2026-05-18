import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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
    // Créer le client Supabase admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Variables d'environnement Supabase manquantes");
      return res.status(500).json({
        error: "Configuration Supabase manquante"
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Client Supabase admin créé");

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
      document_title,
      expiry_period = 30
    } = req.body;

    if (!document_id || !amount || !client_name || !client_email || !client_phone) {
      console.log("❌ Données manquantes");
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

    const { data: usernameData } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ebilling_username")
      .single();

    const { data: sharedKeyData } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ebilling_sharedkey")
      .single();

    const { data: modeData } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ebilling_mode")
      .single();

    const username = usernameData?.value;
    const sharedKey = sharedKeyData?.value;
    const environment = modeData?.value || "LAB";

    console.log("Configuration:", { 
      username: username ? "***" : "MANQUANT", 
      sharedKey: sharedKey ? "***" : "MANQUANT", 
      environment 
    });

    if (!username || !sharedKey) {
      console.log("❌ Configuration eBilling manquante");
      return res.status(500).json({
        error: "Configuration eBilling manquante"
      });
    }
    console.log("✅ Configuration OK");

    // URLs selon environnement
    const apiUrl = environment === "PROD"
      ? "https://www.billing-easy.com/api/v1/merchant/e_bills"
      : "https://lab.billing-easy.net/api/v1/merchant/e_bills";
    
    // Portails selon environnement
    // LAB: test.billing-easy.net (sans /payment, juste ?invoice=...)
    // PROD: www.billing-easy.com/payment
    const portalBaseUrl = environment === "PROD"
      ? "https://www.billing-easy.com"
      : "https://test.billing-easy.net";

    const origin = req.headers.origin || `https://${req.headers.host}`;
    
    // Force www.afrilitt.com en production
    const productionOrigin = origin.includes('afrilitt.com') && !origin.includes('www.') 
      ? origin.replace('afrilitt.com', 'www.afrilitt.com')
      : origin;
    
    const successUrl = `${productionOrigin}/paiement/success`;
    const callbackUrl = `${productionOrigin}/api/payments/ebilling/callback`;

    console.log("URLs:", { apiUrl, portalBaseUrl, successUrl, callbackUrl });

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 2.5 : RÉCUPÉRER L'UTILISATEUR CONNECTÉ
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 2.5: Récupération utilisateur");
    
    // Récupérer le token d'authentification depuis les headers
    const authHeader = req.headers.authorization;
    let userId = null;

    console.log("🔍 AUTH DIAGNOSTIC:");
    console.log("  - Authorization Header présent?", !!authHeader);
    console.log("  - Authorization Header value:", authHeader ? `${authHeader.substring(0, 20)}...` : "NONE");

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log("  - Token extrait (30 premiers chars):", token.substring(0, 30));
      
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      console.log("  - Supabase.auth.getUser() result:");
      console.log("    • User ID:", user?.id || "NULL");
      console.log("    • User Email:", user?.email || "NULL");
      console.log("    • Error:", userError?.message || "NONE");
      
      if (user && !userError) {
        userId = user.id;
        console.log("✅ Utilisateur connecté:", userId);
      } else {
        console.log("❌ Échec authentification:");
        console.log("  - Error:", JSON.stringify(userError, null, 2));
      }
    } else {
      console.log("ℹ️ Pas de token d'authentification (paiement anonyme)");
      console.log("  - Headers disponibles:", Object.keys(req.headers));
    }

    console.log("🎯 RÉSULTAT FINAL: user_id =", userId || "NULL");

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 3 : GÉNÉRER RÉFÉRENCE UNIQUE
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 3: Génération référence");
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const reference = `REF-${timestamp}-${random}`;
    console.log("Référence:", reference);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 4 : CRÉER TRANSACTION EN DB
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 4: Création transaction");
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
      user_id: userId,  // Utilisateur connecté ou null si anonyme
      metadata: {
        document_slug,
        document_title,
        created_at: new Date().toISOString()
      }
    };

    console.log("Transaction data:", { ...transactionData, user_id: userId ? "***" : null });

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
      expiry_period: parseInt(expiry_period)
    };

    console.log("Payload:", JSON.stringify(ebillingPayload, null, 2));
    console.log("Appel vers:", apiUrl);

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

    console.log("Response status:", ebillingResponse.status);
    console.log("Response headers:", Object.fromEntries(ebillingResponse.headers.entries()));

    const responseText = await ebillingResponse.text();
    console.log("Response body (raw):", responseText);

    if (!ebillingResponse.ok) {
      console.error("❌ API eBilling error - Status:", ebillingResponse.status);
      console.error("❌ Response body:", responseText);
      
      await supabase
        .from("ebilling_transactions")
        .delete()
        .eq("id", transaction.id);
      
      return res.status(500).json({
        error: "Erreur API eBilling",
        details: responseText,
        status: ebillingResponse.status
      });
    }

    let ebillingData;
    try {
      ebillingData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError);
      console.error("Response reçue:", responseText);
      return res.status(500).json({
        error: "Réponse eBilling invalide",
        details: responseText
      });
    }

    console.log("✅ Réponse eBilling (parsed):", JSON.stringify(ebillingData, null, 2));

    // Extraction du bill_id - eBilling peut retourner dans différents formats
    const billId = ebillingData?.e_bill?.bill_id || 
                   ebillingData?.bill_id || 
                   ebillingData?.data?.bill_id ||
                   ebillingData?.id;

    if (!billId) {
      console.error("❌ Bill ID manquant dans la réponse");
      console.error("Réponse complète:", JSON.stringify(ebillingData, null, 2));
      return res.status(500).json({
        error: "Bill ID non reçu",
        response: ebillingData
      });
    }

    console.log("✅ Bill ID extrait:", billId);
    console.log("Type:", typeof billId);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 6 : MISE À JOUR TRANSACTION
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
    // ÉTAPE 7 : RETOURNER DONNÉES POUR REDIRECTION POST
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 7: Préparation redirection");
    
    console.log("URL portail:", portalBaseUrl);
    console.log("Bill ID:", billId);
    console.log("Success URL:", successUrl);
    console.log("═══════════════════════════════════════════════════════");

    return res.status(200).json({
      success: true,
      billId,
      redirectUrl: portalBaseUrl,  // Utilisation de la variable déjà définie
      successUrl,
      reference,
      transactionId: transaction.id
    });

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