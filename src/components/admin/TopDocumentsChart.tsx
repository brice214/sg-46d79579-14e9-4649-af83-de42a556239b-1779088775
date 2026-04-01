import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { analyticsService, type TopDocument } from "@/services/analyticsService";
import { FileText, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TopDocumentsChart() {
  const [topDocuments, setTopDocuments] = useState<TopDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopDocuments();
  }, []);

  const loadTopDocuments = async () => {
    setLoading(true);
    const data = await analyticsService.getTopDocuments(10);
    setTopDocuments(data);
    setLoading(false);
  };

  const COLORS = ["#D4AF37", "#C19A2E", "#B08B28", "#9F7C23", "#8E6D1F", "#7D5E1B", "#6C4F17", "#5B4013", "#4A310F", "#39220B"];

  return (
    <Card className="border-gold/20 shadow-lg">
      <CardHeader className="border-b border-gold/10">
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <Award className="h-6 w-6 text-gold" />
          Top 10 Documents
        </CardTitle>
        <CardDescription>Les documents les plus vendus de la plateforme</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        ) : topDocuments.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Aucune vente enregistrée
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topDocuments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  type="category" 
                  dataKey="title" 
                  width={200}
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => String(value).length > 25 ? String(value).substring(0, 25) + "..." : String(value)}
                />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value || 0).toLocaleString()} CFA`, "Revenus"]}
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #D4AF37" }}
                />
                <Bar dataKey="total_revenue" radius={[0, 8, 8, 0]}>
                  {topDocuments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              {topDocuments.slice(0, 5).map((doc, index) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-gold/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gold to-earth text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">Par {doc.author_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{Number(doc.total_sales || 0)} ventes</Badge>
                    <p className="font-bold text-gold">{Number(doc.total_revenue || 0).toLocaleString()} CFA</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}