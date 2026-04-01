import { supabase } from "@/integrations/supabase/client";

export interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformConfig {
  commission_rate: number;
  mobile_money_enabled: boolean;
  card_payment_enabled: boolean;
  platform_name: string;
  primary_color: string;
  logo_url: string;
  terms_of_service: string;
  privacy_policy: string;
}

class PlatformSettingsService {
  async getSetting(key: string): Promise<any> {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error) {
      console.error("Error fetching setting:", error);
      return null;
    }

    return data?.value;
  }

  async getAllSettings(): Promise<PlatformSetting[]> {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching settings:", error);
      return [];
    }

    return data as any[] || [];
  }

  async getSettingsByCategory(category: string): Promise<PlatformSetting[]> {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("category", category)
      .order("key", { ascending: true });

    if (error) {
      console.error("Error fetching settings by category:", error);
      return [];
    }

    return data as any[] || [];
  }

  async updateSetting(key: string, value: any): Promise<boolean> {
    const { error } = await supabase
      .from("platform_settings")
      .update({ 
        value: value,
        updated_at: new Date().toISOString()
      })
      .eq("key", key);

    if (error) {
      console.error("Error updating setting:", error);
      return false;
    }

    return true;
  }

  async updateMultipleSettings(settings: { key: string; value: any }[]): Promise<boolean> {
    try {
      const promises = settings.map(({ key, value }) => 
        this.updateSetting(key, value)
      );
      
      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error("Error updating multiple settings:", error);
      return false;
    }
  }

  async getConfig(): Promise<PlatformConfig> {
    const settings = await this.getAllSettings();
    
    const config: PlatformConfig = {
      commission_rate: 15,
      mobile_money_enabled: true,
      card_payment_enabled: true,
      platform_name: "AfriLitt",
      primary_color: "#D4AF37",
      logo_url: "/afrilitt-background.jpg",
      terms_of_service: "",
      privacy_policy: ""
    };

    settings.forEach(setting => {
      if (setting.key in config) {
        config[setting.key as keyof PlatformConfig] = setting.value;
      }
    });

    return config;
  }
}

export const platformSettingsService = new PlatformSettingsService();