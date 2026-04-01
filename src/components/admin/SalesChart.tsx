import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { analyticsService, type SalesData } from "@/services/analyticsService";
import { TrendingUp, DollarSign } from "lucide-react";

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, [timeRange]);

  const loadSalesData = async () => {
    setLoading(true);
    const data = await analyticsService.getSalesOverTime(Number(timeRange));
    setSalesData(data);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const totalRevenue = salesData.reduce((sum, d) => sum + d.total_revenue, 0);
  const totalSales = salesData.reduce((sum, d) => sum + d.total_sales, 0);

  return (
    <Card className="border-gold/20 shadow-lg">
      <CardHeader className="border-b border-gold/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-gold" />
              Évolution des ventes
            </CardTitle>
            <CardDescription>Analyse des revenus sur la période sélectionnée</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-gold/10 to-gold/5 p-4 rounded-xl border border-gold/20">
                <p className="text-sm text-muted-foreground mb-1">Revenus totaux</p>
                <p className="text-2xl font-bold text-gold">{totalRevenue.toLocaleString()} CFA</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                <p className="text-sm text-muted-foreground mb-1">Nombre de ventes</p>
                <p className="text-2xl font-bold text-blue-500">{totalSales}</p>
              </div>
            </div>

            {salesData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée de vente pour cette période
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "total_revenue") return [`${value.toLocaleString()} CFA`, "Revenus commission"];
                      if (name === "total_sales") return [`${value.toLocaleString()} CFA`, "Ventes totales"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => formatDate(label)}
                    contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #D4AF37" }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="total_sales" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorSales)"
                    name="Ventes totales"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_revenue" 
                    stroke="#D4AF37" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    name="Revenus commission"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}