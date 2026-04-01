import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  created_at: string;
}

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching category:", error);
      return null;
    }

    return data;
  }

  async createCategory(category: Omit<Category, "id" | "created_at">): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return null;
    }

    return data;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    const { error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      return false;
    }

    return true;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }

    return true;
  }

  async reorderCategories(categoryIds: string[]): Promise<boolean> {
    try {
      const promises = categoryIds.map((id, index) =>
        this.updateCategory(id, { display_order: index + 1 })
      );
      
      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error("Error reordering categories:", error);
      return false;
    }
  }

  async getCategoryDocumentCount(categoryId: string): Promise<number> {
    const { count, error } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("status", "published");

    if (error) {
      console.error("Error counting documents:", error);
      return 0;
    }

    return count || 0;
  }
}

export const categoryService = new CategoryService();