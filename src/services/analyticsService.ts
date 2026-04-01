import { supabase } from "@/integrations/supabase/client";

export interface SalesData {
  date: string;
  total_sales: number;
  total_revenue: number;
  count: number;
}

export interface TopDocument {
  id: string;
  title: string;
  author_name: string;
  total_sales: number;
  total_revenue: number;
}

export interface TopAuthor {
  id: string;
  name: string;
  email: string;
  total_documents: number;
  total_sales: number;
  total_revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  total_revenue: number;
  commission_revenue: number;
  author_revenue: number;
}

class AnalyticsService {
  async getSalesOverTime(days: number = 30): Promise<SalesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, commission_amount, created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching sales data:", error);
      return [];
    }

    // Group by date
    const salesByDate: { [key: string]: SalesData } = {};
    
    data?.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split("T")[0];
      
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          total_sales: 0,
          total_revenue: 0,
          count: 0
        };
      }
      
      salesByDate[date].total_sales += transaction.amount;
      salesByDate[date].total_revenue += transaction.commission_amount;
      salesByDate[date].count += 1;
    });

    return Object.values(salesByDate);
  }

  async getTopDocuments(limit: number = 10): Promise<TopDocument[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        document_id,
        amount,
        documents (
          id,
          title,
          profiles (
            full_name
          )
        )
      `)
      .not("document_id", "is", null);

    if (error) {
      console.error("Error fetching top documents:", error);
      return [];
    }

    // Group by document
    const docStats: { [key: string]: TopDocument } = {};
    
    data?.forEach((transaction: any) => {
      const docId = transaction.document_id;
      const doc = transaction.documents;
      
      if (!doc) return;
      
      if (!docStats[docId]) {
        docStats[docId] = {
          id: docId,
          title: doc.title,
          author_name: doc.profiles?.full_name || "Inconnu",
          total_sales: 0,
          total_revenue: 0
        };
      }
      
      docStats[docId].total_sales += 1;
      docStats[docId].total_revenue += transaction.amount;
    });

    return Object.values(docStats)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);
  }

  async getTopAuthors(limit: number = 10): Promise<TopAuthor[]> {
    const { data: authors, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "author");

    if (error) {
      console.error("Error fetching authors:", error);
      return [];
    }

    const authorStats: TopAuthor[] = [];

    for (const author of authors || []) {
      // Get documents count
      const { data: docs } = await supabase
        .from("documents")
        .select("id", { count: "exact" })
        .eq("author_id", author.id);

      // Get total sales and revenue
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount")
        .in("document_id", docs?.map(d => d.id) || []);

      const totalSales = transactions?.length || 0;
      const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      authorStats.push({
        id: author.id,
        name: author.full_name || "Inconnu",
        email: author.email || "",
        total_documents: docs?.length || 0,
        total_sales: totalSales,
        total_revenue: totalRevenue
      });
    }

    return authorStats
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);
  }

  async getMonthlyRevenue(months: number = 12): Promise<MonthlyRevenue[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, commission_amount, created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching monthly revenue:", error);
      return [];
    }

    // Group by month
    const revenueByMonth: { [key: string]: MonthlyRevenue } = {};
    
    data?.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = {
          month,
          total_revenue: 0,
          commission_revenue: 0,
          author_revenue: 0
        };
      }
      
      revenueByMonth[month].total_revenue += transaction.amount;
      revenueByMonth[month].commission_revenue += transaction.commission_amount;
      revenueByMonth[month].author_revenue += (transaction.amount - transaction.commission_amount);
    });

    return Object.values(revenueByMonth);
  }

  async getConversionRate(): Promise<number> {
    // Total visitors (all profiles with role visitor)
    const { count: totalVisitors } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "visitor");

    // Unique buyers (visitors who made at least one purchase)
    const { data: buyers } = await supabase
      .from("transactions")
      .select("buyer_id")
      .not("buyer_id", "is", null);

    const uniqueBuyers = new Set(buyers?.map(b => b.buyer_id) || []).size;

    if (!totalVisitors || totalVisitors === 0) return 0;
    
    return (uniqueBuyers / totalVisitors) * 100;
  }
}

export const analyticsService = new AnalyticsService();