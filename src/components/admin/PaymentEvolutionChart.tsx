import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

interface PaymentData {
  period: string;
  total: number;
  platformFee: number;
  authorRevenue: number;
}

export function PaymentEvolutionChart() {
  const [data, setData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  useEffect(() => {
    loadPaymentData();
  }, [viewMode]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, platform_fee, created_at, status")
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      if (!transactions) {
        setData([]);
        return;
      }

      const groupedData: Record<string, { total: number; platformFee: number; authorRevenue: number }> = {};

      transactions.forEach((tx) => {
        const date = new Date(tx.created_at);
        let period: string;

        if (viewMode === "month") {
          period = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        } else {
          period = date.getFullYear().toString();
        }

        if (!groupedData[period]) {
          groupedData[period] = { total: 0, platformFee: 0, authorRevenue: 0 };
        }

        const amount = Number(tx.amount);
        const fee = Number(tx.platform_fee);
        
        groupedData[period].total += amount;
        groupedData[period].platformFee += fee;
        groupedData[period].authorRevenue += (amount - fee);
      });

      const chartData = Object.entries(groupedData).map(([period, values]) => ({
        period,
        total: Math.round(values.total),
        platformFee: Math.round(values.platformFee),
        authorRevenue: Math.round(values.authorRevenue),
      }));

      setData(chartData);
    } catch (error) {
      console.error("Error loading payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gold/20 shadow-lg">
      <CardHeader className="border-b border-gold/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-gold" />
              Évolution des paiements
            </CardTitle>
            <CardDescription>Analyse des revenus de la plateforme</CardDescription>
          </div>
          <Select value={viewMode} onValueChange={(value: "month" | "year") => setViewMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Par mois</SelectItem>
              <SelectItem value="year">Par année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Chargement des données...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucune donnée disponible</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="period" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toLocaleString()} CFA`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #D4AF37',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total" 
                stroke="#D4AF37" 
                strokeWidth={3}
                dot={{ fill: '#D4AF37', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="platformFee" 
                name="Commission plateforme" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="authorRevenue" 
                name="Revenus auteurs" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}