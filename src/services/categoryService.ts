import { supabase } from "@/integrations/supabase/client";

export const categoryService = {
  async getAllCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    console.log("getAllCategories:", { data, error });

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return data || [];
  },

  async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    console.log("getCategoryBySlug:", { data, error });

    if (error) {
      console.error("Error fetching category:", error);
      throw error;
    }

    return data;
  }
};