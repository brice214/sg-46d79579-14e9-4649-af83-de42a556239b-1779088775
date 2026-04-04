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
    // Créer le client Supabase admin à l'intérieur du handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Variables d'environnement Supabase manquantes");
      return res.status(500).json({
        error: "Configuration Supabase manquante",
        message: "Les variables d'environnement Supabase ne sont pas configurées"
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
      expiry_period = 30 // 30 minutes par défaut
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

    // URLs selon documentation officielle
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
    // ÉTAPE 5 : APPELER API eBILLING (avec expiry_period)
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 5: Appel API eBilling");
    const ebillingPayload = {
      amount: parseFloat(amount),
      short_description: short_description || `Achat: ${document_title}`,
      payer_email: client_email,
      payer_msisdn: client_phone,
      payer_name: client_name,
      external_reference: reference,
      expiry_period: parseInt(expiry_period) || 30 // Paramètre requis selon doc officielle
    };

    console.log("Payload eBilling:", JSON.stringify(ebillingPayload, null, 2));

    // Basic Auth : username:shared_key encodé en base64
    const authString = `${username}:${sharedKey}`;
    const base64Auth = Buffer.from(authString).toString("base64");
    console.log("Auth string (masked):", `${username}:***`);

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
    // ÉTAPE 7 : REDIRECTION POST SELON DOC OFFICIELLE
    // ═════════════════════════════════════════════════════════
    console.log("\n📋 ÉTAPE 7: Génération formulaire de redirection POST");
    
    // Selon la doc officielle (section 4.2.4), il faut rediriger avec un formulaire POST
    // contenant invoice_number et merchant_redirect_url
    const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Redirection vers E-Billing...</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      color: #333;
      margin-bottom: 10px;
    }
    p {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Redirection vers le portail de paiement...</h2>
    <p>Veuillez patienter, vous allez être redirigé automatiquement.</p>
  </div>
  
  <form id="ebilling-redirect-form" method="POST" action="${portalUrl}">
    <input type="hidden" name="invoice_number" value="${billId}">
    <input type="hidden" name="merchant_redirect_url" value="${successUrl}">
  </form>
  
  <script>
    // Auto-submit le formulaire selon la documentation officielle E-Billing
    document.getElementById('ebilling-redirect-form').submit();
  </script>
</body>
</html>`;

    console.log("✅ Formulaire de redirection POST généré");
    console.log("Paramètres de redirection:", {
      action: portalUrl,
      invoice_number: billId,
      merchant_redirect_url: successUrl
    });
    console.log("═══════════════════════════════════════════════════════");

    // Retourner la page HTML avec le formulaire auto-submit
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(redirectHtml);

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