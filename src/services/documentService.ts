import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

export const documentService = {
  async getPublishedDocuments(filters?: {
    category?: string;
    search?: string;
    isFree?: boolean;
    sortBy?: "recent" | "popular" | "price_asc" | "price_desc";
  }) {
    let query = supabase
      .from("documents")
      .select(`
        *,
        profiles!documents_author_id_fkey(id, full_name, avatar_url, bio),
        categories(id, name, slug, icon)
      `)
      .eq("is_published", true)
      .eq("is_approved", true);

    if (filters?.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.isFree !== undefined) {
      if (filters.isFree) {
        query = query.eq("price", 0);
      } else {
        query = query.gt("price", 0);
      }
    }

    switch (filters?.sortBy) {
      case "popular":
        query = query.order("download_count", { ascending: false });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    console.log("getPublishedDocuments:", { data, error });

    if (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }

    return data || [];
  },

  async getDocumentBySlug(slug: string) {
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        profiles!documents_author_id_fkey(id, full_name, avatar_url, bio, country),
        categories(id, name, slug, icon)
      `)
      .eq("slug", slug)
      .single();

    console.log("getDocumentBySlug:", { data, error });

    if (error) {
      console.error("Error fetching document:", error);
      throw error;
    }

    return data;
  },

  async getDocumentById(id: string) {
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        profiles!documents_author_id_fkey(id, full_name, avatar_url, bio),
        categories(id, name, slug, icon)
      `)
      .eq("id", id)
      .single();

    console.log("getDocumentById:", { data, error });

    if (error) {
      console.error("Error fetching document:", error);
      throw error;
    }

    return data;
  },

  async getAuthorDocuments(authorId: string) {
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        categories(id, name, slug, icon)
      `)
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });

    console.log("getAuthorDocuments:", { data, error });

    if (error) {
      console.error("Error fetching author documents:", error);
      throw error;
    }

    return data || [];
  },

  async getLatestPaidDocuments(limit: number = 10) {
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        profiles!documents_author_id_fkey(full_name),
        categories(name)
      `)
      .eq("is_published", true)
      .eq("is_approved", true)
      .gt("price", 0)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest paid documents:", error);
      throw error;
    }

    return data || [];
  },

  async createDocument(document: DocumentInsert) {
    const { data, error } = await supabase
      .from("documents")
      .insert(document)
      .select()
      .single();

    console.log("createDocument:", { data, error });

    if (error) {
      console.error("Error creating document:", error);
      throw error;
    }

    return data;
  },

  async updateDocument(id: string, updates: DocumentUpdate) {
    const { data, error } = await supabase
      .from("documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    console.log("updateDocument:", { data, error });

    if (error) {
      console.error("Error updating document:", error);
      throw error;
    }

    return data;
  },

  async deleteDocument(id: string) {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    console.log("deleteDocument:", { error });

    if (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  async incrementViewCount(id: string) {
    const { error } = await supabase.rpc("increment_view_count", {
      document_id: id
    });

    if (error) {
      console.error("Error incrementing view count:", error);
    }
  },

  async incrementDownloadCount(id: string) {
    const { error } = await supabase.rpc("increment_download_count", {
      document_id: id
    });

    if (error) {
      console.error("Error incrementing download count:", error);
    }
  },

  async checkUserAccess(documentId: string, userId: string) {
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", userId)
      .maybeSingle();

    console.log("checkUserAccess:", { data, error });

    return !!data;
  }
};