import { supabase } from "@/integrations/supabase/client";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class BannerService {
  async getAllBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from("homepage_banners")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
      return [];
    }

    return data || [];
  }

  async getActiveBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from("homepage_banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching active banners:", error);
      return [];
    }

    return data || [];
  }

  async createBanner(banner: Omit<Banner, "id" | "created_at" | "updated_at">): Promise<Banner | null> {
    const { data, error } = await supabase
      .from("homepage_banners")
      .insert([banner])
      .select()
      .single();

    if (error) {
      console.error("Error creating banner:", error);
      return null;
    }

    return data;
  }

  async updateBanner(id: string, updates: Partial<Banner>): Promise<boolean> {
    const { error } = await supabase
      .from("homepage_banners")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating banner:", error);
      return false;
    }

    return true;
  }

  async deleteBanner(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("homepage_banners")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting banner:", error);
      return false;
    }

    return true;
  }

  async toggleBannerStatus(id: string, isActive: boolean): Promise<boolean> {
    return this.updateBanner(id, { is_active: isActive });
  }

  async reorderBanners(bannerIds: string[]): Promise<boolean> {
    try {
      const promises = bannerIds.map((id, index) =>
        this.updateBanner(id, { display_order: index + 1 })
      );
      
      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error("Error reordering banners:", error);
      return false;
    }
  }
}

export const bannerService = new BannerService();