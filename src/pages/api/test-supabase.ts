import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("=== TEST SUPABASE ===");
    
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Définie" : "❌ Manquante");
    console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ Définie" : "❌ Manquante");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        error: "Variables d'environnement manquantes",
        details: {
          url: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey
        }
      });
    }
    
    // Créer le client Supabase
    console.log("Création du client Supabase...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Client créé");
    
    // Tester une requête simple
    console.log("Test de requête vers platform_settings...");
    const { data, error } = await supabase
      .from("platform_settings")
      .select("key, value")
      .eq("key", "ebilling_username")
      .single();
    
    console.log("Résultat:", { data, error });
    
    if (error) {
      return res.status(500).json({
        error: "Erreur requête Supabase",
        details: error
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Supabase fonctionne correctement",
      ebilling_username: data?.value
    });
    
  } catch (error: any) {
    console.error("EXCEPTION:", error);
    return res.status(500).json({
      error: "Exception",
      message: error.message,
      stack: error.stack
    });
  }
}