import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];

export const reportService = {
  async createReport(report: ReportInsert) {
    const { data, error } = await supabase
      .from("reports")
      .insert(report)
      .select()
      .single();

    console.log("createReport:", { data, error });

    if (error) {
      console.error("Error creating report:", error);
      throw error;
    }

    return data;
  },

  async getUserReports(userId: string) {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        documents(id, title, slug)
      `)
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false });

    console.log("getUserReports:", { data, error });

    if (error) {
      console.error("Error fetching user reports:", error);
      throw error;
    }

    return data || [];
  },

  async getAllReports() {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        documents(id, title, slug),
        profiles!reports_reporter_id_fkey(id, full_name, avatar_url)
      `)
      .order("created_at", { ascending: false });

    console.log("getAllReports:", { data, error });

    if (error) {
      console.error("Error fetching all reports:", error);
      throw error;
    }

    return data || [];
  }
};