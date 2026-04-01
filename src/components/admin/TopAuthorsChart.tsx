import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { analyticsService, type TopAuthor } from "@/services/analyticsService";
import { PenTool, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopAuthorsChart() {
  const [topAuthors, setTopAuthors] = useState<TopAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopAuthors();
  }, []);

  const loadTopAuthors = async () => {
    setLoading(true);
    const data = await analyticsService.getTopAuthors(10);
    setTopAuthors(data);
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return String(name).split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <Card className="border-gold/20 shadow-lg">
      <CardHeader className="border-b border-gold/10">
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <PenTool className="h-6 w-6 text-purple-500" />
          Top 10 Auteurs
        </CardTitle>
        <CardDescription>Les auteurs les plus performants de la plateforme</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        ) : topAuthors.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Aucun auteur avec des ventes
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topAuthors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tickFormatter={(value) => String(value).length > 15 ? String(value).substring(0, 15) + "..." : String(value)}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    const numValue = Number(value || 0);
                    if (name === "total_revenue") return [`${numValue.toLocaleString()} CFA`, "Revenus"];
                    if (name === "total_documents") return [numValue, "Documents"];
                    return [numValue, String(name)];
                  }}
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #D4AF37" }}
                />
                <Legend />
                <Bar dataKey="total_revenue" fill="#D4AF37" name="Revenus" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {topAuthors.slice(0, 6).map((author, index) => (
                <div key={author.id} className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/0 rounded-lg border border-purple-500/20">
                  <Avatar className="h-12 w-12 border-2 border-gold">
                    <AvatarFallback className="bg-gradient-to-br from-gold to-earth text-white font-bold">
                      {getInitials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{author.name}</p>
                      {index < 3 && (
                        <Badge className="bg-gold text-white border-none">Top {index + 1}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{author.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="text-muted-foreground">{Number(author.total_documents || 0)} docs</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-muted-foreground">{Number(author.total_sales || 0)} ventes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold text-lg">{Number(author.total_revenue || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">CFA</p>
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