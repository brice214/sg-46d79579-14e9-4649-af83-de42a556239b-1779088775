import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { analyticsService, type MonthlyRevenue } from "@/services/analyticsService";
import { Target, TrendingUp, Users, ShoppingCart } from "lucide-react";

export function ConversionMetrics() {
  const [conversionRate, setConversionRate] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    const [rate, revenue] = await Promise.all([
      analyticsService.getConversionRate(),
      analyticsService.getMonthlyRevenue(6)
    ]);
    setConversionRate(rate);
    setMonthlyRevenue(revenue);
    setLoading(false);
  };

  const pieData = [
    { name: "Visiteurs convertis", value: conversionRate, color: "#D4AF37" },
    { name: "Visiteurs non-convertis", value: 100 - conversionRate, color: "#e5e7eb" }
  ];

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  };

  const latestMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1];
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.total_revenue, 0);
  const avgMonthlyRevenue = monthlyRevenue.length > 0 ? totalRevenue / monthlyRevenue.length : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-gold/20 shadow-lg">
        <CardHeader className="border-b border-gold/10">
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-green-500" />
            Taux de conversion
          </CardTitle>
          <CardDescription>Pourcentage de visiteurs qui effectuent un achat</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx={100}
                        cy={100}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gold">{conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Visiteurs inscrits</span>
                  </div>
                  <span className="font-bold text-blue-500">100%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gold/10 to-gold/5 rounded-lg border border-gold/20">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-gold" />
                    <span className="text-sm font-medium">Acheteurs</span>
                  </div>
                  <span className="font-bold text-gold">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">💡 Insight</p>
                <p className="text-sm">
                  {conversionRate < 5 ? "Le taux de conversion est faible. Envisagez d'améliorer la présentation des documents ou d'offrir des promotions." :
                   conversionRate < 15 ? "Bon taux de conversion ! Continuez à optimiser l'expérience utilisateur." :
                   "Excellent taux de conversion ! Votre plateforme performe très bien."}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-gold/20 shadow-lg">
        <CardHeader className="border-b border-gold/10">
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-gold" />
            Revenus mensuels
          </CardTitle>
          <CardDescription>Vue d'ensemble des 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : monthlyRevenue.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Aucune donnée de revenus disponible
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-gold/10 to-gold/5 p-4 rounded-xl border border-gold/20">
                  <p className="text-xs text-muted-foreground mb-1">Mois actuel</p>
                  <p className="text-2xl font-bold text-gold">
                    {latestMonthRevenue ? latestMonthRevenue.total_revenue.toLocaleString() : 0} CFA
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Moyenne mensuelle</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {avgMonthlyRevenue.toLocaleString()} CFA
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {monthlyRevenue.slice(-6).reverse().map((month, index) => {
                  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total_revenue));
                  const percentage = (month.total_revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={month.month}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{formatMonth(month.month)}</span>
                        <span className="text-sm font-bold text-gold">{month.total_revenue.toLocaleString()} CFA</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-gold to-earth transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Commission: {month.commission_revenue.toLocaleString()} CFA</span>
                        <span>Auteurs: {month.author_revenue.toLocaleString()} CFA</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}