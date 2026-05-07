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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("═══════════════════════════════════════");
    console.log("🔔 eBilling Callback reçu");
    console.log("═══════════════════════════════════════");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 1 : EXTRACTION DES DONNÉES
    // ═════════════════════════════════════════════════════════
    const {
      reference,
      amount,
      transactionid,
      paymentsystem,
      state,
      billingid
    } = req.body;

    if (!reference) {
      console.error("❌ Référence manquante dans le callback");
      return res.status(400).json({ error: "Référence manquante" });
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 2 : RÉCUPÉRER LA TRANSACTION
    // ═════════════════════════════════════════════════════════
    const { data: transactions, error: findError } = await supabase
      .from("ebilling_transactions")
      .select("*")
      .eq("reference", reference);

    if (findError || !transactions || transactions.length === 0) {
      console.error("❌ Transaction non trouvée:", reference);
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    const transaction = transactions[0];
    console.log("✅ Transaction trouvée:", transaction.id, transaction.status);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 3 : IDEMPOTENCE - Vérifier si déjà traité
    // ═════════════════════════════════════════════════════════
    if (transaction.status === "paid" || transaction.status === "processed") {
      console.log("ℹ️ Transaction déjà traitée:", transaction.status);
      return res.status(200).json({
        success: true,
        message: "Already processed"
      });
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 4 : PARSER LE MONTANT (peut être array)
    // ═════════════════════════════════════════════════════════
    let paidAmount: number;
    if (Array.isArray(amount)) {
      paidAmount = parseFloat(amount[0]);
    } else {
      paidAmount = parseFloat(amount);
    }

    console.log("💰 Montant reçu:", paidAmount, "FCFA");

    // Vérifier le montant (tolérance de 1 FCFA pour les arrondis)
    if (Math.abs(paidAmount - transaction.amount) > 1) {
      console.error("❌ Montant incorrect:", paidAmount, "vs", transaction.amount);
      return res.status(400).json({ error: "Montant incorrect" });
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 5 : DÉTERMINER LE NOUVEAU STATUT
    // ═════════════════════════════════════════════════════════
    const isPaid = state === "paid" || 
                   state === "success" || 
                   state === "completed" || 
                   state === "processed" ||
                   !state; // eBilling peut ne pas envoyer state
    
    const newStatus = isPaid ? "processed" : "failed";
    console.log("📊 Nouveau statut:", newStatus);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 6 : MISE À JOUR TRANSACTION
    // ═════════════════════════════════════════════════════════
    const { error: updateError } = await supabase
      .from("ebilling_transactions")
      .update({
        status: newStatus,
        transaction_id: transactionid || null,
        operator: paymentsystem || null,
        paid_at: new Date().toISOString()
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("❌ Erreur mise à jour transaction:", updateError);
      return res.status(500).json({ error: "Erreur mise à jour" });
    }

    console.log("✅ Transaction mise à jour:", newStatus);

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 7 : CRÉER L'ACHAT (si paiement validé)
    // ═════════════════════════════════════════════════════════
    if (newStatus === "processed") {
      console.log("🔄 Création de l'achat...");
      console.log("🔍 DIAGNOSTIC PURCHASE:");
      console.log("  - Transaction ID:", transaction.id);
      console.log("  - Transaction user_id:", transaction.user_id || "NULL");
      console.log("  - Transaction document_id:", transaction.document_id);
      console.log("  - Transaction amount:", transaction.amount);
      console.log("  - Transaction reference:", transaction.reference);
      console.log("  - Transaction metadata:", JSON.stringify(transaction.metadata, null, 2));

      // Vérifier que user_id existe
      if (!transaction.user_id) {
        console.error("❌❌❌ PROBLÈME CRITIQUE ❌❌❌");
        console.error("❌ Impossible de créer purchase: user_id manquant dans la transaction");
        console.log("Transaction complète:", JSON.stringify(transaction, null, 2));
        console.error("⚠️ Le client a PAYÉ mais ne recevra PAS son document!");
        console.error("⚠️ Action requise: Investigation manuelle nécessaire");
        return res.status(200).json({
          success: true,
          message: "Payment processed but no user_id - MANUAL INTERVENTION REQUIRED",
          status: newStatus,
          transactionId: transaction.id,
          reference: transaction.reference
        });
      }

      console.log("✅ user_id présent, création du purchase...");

      // Créer l'entrée dans la table purchases (colonnes existantes uniquement)
      const { error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          user_id: transaction.user_id,
          document_id: transaction.document_id,
          transaction_id: null  // Pas de transaction dans la table transactions pour eBilling
        });

      if (purchaseError) {
        console.error("❌❌❌ ERREUR CRÉATION PURCHASE ❌❌❌");
        console.error("❌ Erreur création achat:", purchaseError);
        console.error("Détails:", JSON.stringify(purchaseError, null, 2));
        console.error("⚠️ Le client a PAYÉ mais ne peut PAS accéder au document!");
      } else {
        console.log("✅✅✅ ACHAT CRÉÉ AVEC SUCCÈS ✅✅✅");
        console.log("  - user_id:", transaction.user_id);
        console.log("  - document_id:", transaction.document_id);
      }

      // Récupérer les infos du document pour le log
      const { data: document } = await supabase
        .from("documents")
        .select("title")
        .eq("id", transaction.document_id)
        .single();

      if (document) {
        console.log("📄 Document acheté:", document.title);
      }
    }

    // ═════════════════════════════════════════════════════════
    // ÉTAPE 8 : RETOURNER HTTP 200 (OBLIGATOIRE)
    // ═════════════════════════════════════════════════════════
    console.log("═══════════════════════════════════════");
    console.log("✅ Callback traité avec succès");
    console.log("═══════════════════════════════════════");

    return res.status(200).json({
      success: true,
      message: "Callback traité",
      status: newStatus
    });

  } catch (error: any) {
    console.error("═══════════════════════════════════════");
    console.error("❌ Exception callback:", error);
    console.error("═══════════════════════════════════════");
    
    // Même en cas d'erreur, retourner 200 pour éviter les retry eBilling
    return res.status(200).json({
      success: false,
      message: "Erreur traitée"
    });
  }
}