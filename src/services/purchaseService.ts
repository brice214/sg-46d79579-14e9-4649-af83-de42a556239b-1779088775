import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];

export const purchaseService = {
  async createPurchase(documentId: string, userId: string) {
    try {
      // 1. Get document details
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("price, author_id")
        .eq("id", documentId)
        .single();
        
      if (docError || !doc) {
        return { success: false, error: "Document introuvable" };
      }
      
      // Calculate author earnings (e.g., 80% to author, 20% commission)
      const authorEarnings = Number(doc.price) * 0.8;
      const commission = Number(doc.price) * 0.2;
      
      // 2. Create and complete transaction automatically for this demo
      const transaction = await this.createTransaction({
        document_id: documentId,
        buyer_id: userId,
        author_id: doc.author_id,
        amount: doc.price,
        author_earnings: authorEarnings,
        commission_amount: commission,
        status: "completed",
        payment_method: "mobile_money",
        transaction_reference: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        completed_at: new Date().toISOString()
      });
      
      // 3. Grant access
      await this.grantAccess(documentId, userId, transaction.id);
      
      return { success: true };
    } catch (error: any) {
      console.error("Purchase process error:", error);
      return { success: false, error: error.message || "Erreur lors de l'achat" };
    }
  },

  async createTransaction(transaction: TransactionInsert) {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transaction)
      .select()
      .single();

    console.log("createTransaction:", { data, error });

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }

    return data;
  },

  async completeTransaction(transactionId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", transactionId)
      .select()
      .single();

    console.log("completeTransaction:", { data, error });

    if (error) {
      console.error("Error completing transaction:", error);
      throw error;
    }

    return data;
  },

  async grantAccess(documentId: string, userId: string, transactionId?: string) {
    const { data, error } = await supabase
      .from("purchases")
      .insert({
        document_id: documentId,
        user_id: userId,
        transaction_id: transactionId
      })
      .select()
      .single();

    console.log("grantAccess:", { data, error });

    if (error) {
      console.error("Error granting access:", error);
      throw error;
    }

    return data;
  },

  async getUserPurchases(userId: string) {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        *,
        documents(
          *,
          profiles!documents_author_id_fkey(id, full_name, avatar_url),
          categories(name, slug)
        )
      `)
      .eq("user_id", userId)
      .order("access_granted_at", { ascending: false });

    console.log("getUserPurchases:", { data, error });

    if (error) {
      console.error("Error fetching user purchases:", error);
      throw error;
    }

    return data || [];
  },

  async getAuthorSales(authorId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        documents(id, title, slug, cover_image_url),
        profiles!transactions_buyer_id_fkey(id, full_name, avatar_url)
      `)
      .eq("author_id", authorId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    console.log("getAuthorSales:", { data, error });

    if (error) {
      console.error("Error fetching author sales:", error);
      throw error;
    }

    return data || [];
  },

  async getAuthorEarnings(authorId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("author_earnings")
      .eq("author_id", authorId)
      .eq("status", "completed");

    console.log("getAuthorEarnings:", { data, error });

    if (error) {
      console.error("Error fetching author earnings:", error);
      return 0;
    }

    const total = data?.reduce((sum, t) => sum + Number(t.author_earnings), 0) || 0;
    return total;
  }
};