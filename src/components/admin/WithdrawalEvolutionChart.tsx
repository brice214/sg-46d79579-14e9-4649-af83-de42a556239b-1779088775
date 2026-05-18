import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, Wallet } from "lucide-react";

interface WithdrawalData {
  period: string;
  approved: number;
  pending: number;
  rejected: number;
}

export function WithdrawalEvolutionChart() {
  const [data, setData] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  useEffect(() => {
    loadWithdrawalData();
  }, [viewMode]);

  const loadWithdrawalData = async () => {
    setLoading(true);
    try {
      const { data: withdrawals } = await supabase
        .from("withdrawal_requests")
        .select("amount, status, created_at")
        .order("created_at", { ascending: true });

      if (!withdrawals) {
        setData([]);
        return;
      }

      const groupedData: Record<string, { approved: number; pending: number; rejected: number }> = {};

      withdrawals.forEach((withdrawal) => {
        const date = new Date(withdrawal.created_at);
        let period: string;

        if (viewMode === "month") {
          period = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
        } else {
          period = date.getFullYear().toString();
        }

        if (!groupedData[period]) {
          groupedData[period] = { approved: 0, pending: 0, rejected: 0 };
        }

        const amount = Number(withdrawal.amount);

        if (withdrawal.status === "approved") {
          groupedData[period].approved += amount;
        } else if (withdrawal.status === "pending") {
          groupedData[period].pending += amount;
        } else if (withdrawal.status === "rejected") {
          groupedData[period].rejected += amount;
        }
      });

      const chartData = Object.entries(groupedData).map(([period, values]) => ({
        period,
        approved: Math.round(values.approved),
        pending: Math.round(values.pending),
        rejected: Math.round(values.rejected),
      }));

      setData(chartData);
    } catch (error) {
      console.error("Error loading withdrawal data:", error);
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
              <Wallet className="h-6 w-6 text-purple-500" />
              Évolution des retraits
            </CardTitle>
            <CardDescription>Suivi des demandes de retrait des auteurs</CardDescription>
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
              <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
                  border: '1px solid #8B5CF6',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approved" 
                name="Approuvés" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                name="En attente" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                name="Rejetés" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}