import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WithdrawalRequest = Database["public"]["Tables"]["withdrawal_requests"]["Row"];
type WithdrawalInsert = Database["public"]["Tables"]["withdrawal_requests"]["Insert"];
type WithdrawalUpdate = Database["public"]["Tables"]["withdrawal_requests"]["Update"];

interface WithdrawalSettings {
  minimum_amount: number;
  currency: string;
  transaction_fee: {
    type: "percentage" | "fixed";
    value: number;
    minimum?: number;
  };
  methods: {
    mobile_money: boolean;
    bank_transfer: boolean;
  };
}

export const withdrawalService = {
  /**
   * Get withdrawal settings from platform_settings
   */
  async getWithdrawalSettings(): Promise<WithdrawalSettings | null> {
    try {
      const { data: settings, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["withdrawal_minimum_amount", "withdrawal_transaction_fee", "withdrawal_methods"]);

      if (error) {
        console.error("Error fetching withdrawal settings:", error);
        return null;
      }

      const minAmount = settings?.find((s) => s.key === "withdrawal_minimum_amount")?.value as any;
      const fee = settings?.find((s) => s.key === "withdrawal_transaction_fee")?.value as any;
      const methods = settings?.find((s) => s.key === "withdrawal_methods")?.value as any;

      return {
        minimum_amount: minAmount?.amount || 10000,
        currency: minAmount?.currency || "XAF",
        transaction_fee: fee || { type: "percentage", value: 2.5, minimum: 500 },
        methods: methods || { mobile_money: true, bank_transfer: true },
      };
    } catch (error) {
      console.error("Error in getWithdrawalSettings:", error);
      return null;
    }
  },

  /**
   * Update withdrawal settings
   */
  async updateWithdrawalSettings(settings: Partial<WithdrawalSettings>): Promise<boolean> {
    try {
      const updates = [];

      if (settings.minimum_amount !== undefined) {
        updates.push({
          key: "withdrawal_minimum_amount",
          value: { amount: settings.minimum_amount, currency: settings.currency || "XAF" },
          description: "Montant minimum pour demander un retrait",
          category: "withdrawal"
        });
      }

      if (settings.transaction_fee) {
        updates.push({
          key: "withdrawal_transaction_fee",
          value: settings.transaction_fee,
          description: "Frais de transaction pour les retraits",
          category: "withdrawal"
        });
      }

      if (settings.methods) {
        updates.push({
          key: "withdrawal_methods",
          value: settings.methods,
          description: "Méthodes de retrait disponibles",
          category: "withdrawal"
        });
      }

      for (const update of updates) {
        const { error } = await supabase
          .from("platform_settings")
          .upsert({
            key: update.key,
            value: update.value,
            description: update.description,
            category: update.category,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          });

        if (error) {
          console.error(`Error updating ${update.key}:`, error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating withdrawal settings:", error);
      return false;
    }
  },

  /**
   * Get all withdrawal requests (admin)
   */
  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select(`
          *,
          profiles!withdrawal_requests_author_id_fkey(full_name, email, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching withdrawal requests:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllWithdrawalRequests:", error);
      return [];
    }
  },

  /**
   * Get author's withdrawal requests
   */
  async getAuthorWithdrawalRequests(authorId: string): Promise<WithdrawalRequest[]> {
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("author_id", authorId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching author withdrawal requests:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAuthorWithdrawalRequests:", error);
      return [];
    }
  },

  /**
   * Calculate author's available balance
   */
  async getAuthorBalance(authorId: string): Promise<number> {
    try {
      // Get total earnings from completed transactions
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("author_earnings")
        .eq("author_id", authorId)
        .eq("status", "completed");

      if (txError) {
        console.error("Error fetching transactions:", txError);
        return 0;
      }

      const totalEarnings = transactions?.reduce((sum, tx) => sum + Number(tx.author_earnings), 0) || 0;

      // Get total withdrawn amount (approved + completed withdrawals)
      const { data: withdrawals, error: wdError } = await supabase
        .from("withdrawal_requests")
        .select("amount")
        .eq("author_id", authorId)
        .in("status", ["approved", "completed"]);

      if (wdError) {
        console.error("Error fetching withdrawals:", wdError);
        return 0;
      }

      const totalWithdrawn = withdrawals?.reduce((sum, wd) => sum + Number(wd.amount), 0) || 0;

      return totalEarnings - totalWithdrawn;
    } catch (error) {
      console.error("Error in getAuthorBalance:", error);
      return 0;
    }
  },

  /**
   * Create a withdrawal request
   */
  async createWithdrawalRequest(data: WithdrawalInsert): Promise<WithdrawalRequest | null> {
    try {
      const { data: withdrawal, error } = await supabase
        .from("withdrawal_requests")
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error("Error creating withdrawal request:", error);
        return null;
      }

      return withdrawal;
    } catch (error) {
      console.error("Error in createWithdrawalRequest:", error);
      return null;
    }
  },

  /**
   * Update withdrawal request status (admin)
   */
  async updateWithdrawalStatus(
    id: string,
    status: "approved" | "rejected" | "completed",
    adminNotes?: string
  ): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      const update: WithdrawalUpdate = {
        status,
        admin_notes: adminNotes,
        processed_at: new Date().toISOString(),
        processed_by: userId,
      };

      const { error } = await supabase
        .from("withdrawal_requests")
        .update(update)
        .eq("id", id);

      if (error) {
        console.error("Error updating withdrawal status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateWithdrawalStatus:", error);
      return false;
    }
  },

  /**
   * Get withdrawal statistics
   */
  async getWithdrawalStats() {
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("status, amount");

      if (error) {
        console.error("Error fetching withdrawal stats:", error);
        return null;
      }

      const stats = {
        total: data.length,
        pending: data.filter((w) => w.status === "pending").length,
        approved: data.filter((w) => w.status === "approved").length,
        rejected: data.filter((w) => w.status === "rejected").length,
        completed: data.filter((w) => w.status === "completed").length,
        totalAmount: data
          .filter((w) => w.status === "completed")
          .reduce((sum, w) => sum + Number(w.amount), 0),
      };

      return stats;
    } catch (error) {
      console.error("Error in getWithdrawalStats:", error);
      return null;
    }
  },
};