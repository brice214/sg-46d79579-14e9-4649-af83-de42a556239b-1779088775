import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, DollarSign, Upload, Eye, Download, FileText, Settings, User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  
  // Statistiques
  const [totalViews, setTotalViews] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      // Charger le profil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      setProfile(profileData);

      // Charger les documents de l'auteur
      if (profileData?.role === "author" || profileData?.role === "admin") {
        const { data: docs } = await supabase
          .from("documents")
          .select("*")
          .eq("author_id", session.user.id)
          .order("created_at", { ascending: false });
          
        if (docs) {
          setMyDocuments(docs);
          
          // Calculer les stats
          const views = docs.reduce((acc, doc) => acc + (doc.view_count || 0), 0);
          const downloads = docs.reduce((acc, doc) => acc + (doc.download_count || 0), 0);
          setTotalViews(views);
          setTotalDownloads(downloads);
        }

        // Charger les revenus
        const { data: transactions } = await supabase
          .from("transactions")
          .select("author_earnings")
          .eq("author_id", session.user.id)
          .eq("status", "completed");
          
        if (transactions) {
          const earnings = transactions.reduce((acc, tx) => acc + Number(tx.author_earnings), 0);
          setTotalEarnings(earnings);
        }
      }

      // Charger les achats
      const { data: purchases } = await supabase
        .from("purchases")
        .select(`
          id,
          access_granted_at,
          documents (
            id,
            title,
            slug,
            cover_image_url,
            author_id,
            profiles:author_id (full_name)
          )
        `)
        .eq("user_id", session.user.id)
        .order("access_granted_at", { ascending: false });

      if (purchases) {
        setMyPurchases(purchases);
      }

    } catch (error) {
      console.error("Dashboard error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-earth border-r-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAuthor = profile?.role === "author" || profile?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="relative pt-16 pb-12 border-b border-gold/20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background"></div>
        </div>
        <div className="container max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-4xl font-bold text-white drop-shadow-lg mb-2">Tableau de bord</h1>
              <p className="text-gold/90 text-lg drop-shadow-md">
                Bienvenue, {profile?.full_name || "Utilisateur"}
              </p>
            </div>
            {isAuthor && (
              <Button asChild className="bg-gradient-to-r from-earth to-gold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-none">
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Publier un document
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 bg-gradient-to-b from-earth/5 via-background to-gold/5">
        <div className="container max-w-6xl">
          {/* Statistiques (Auteurs uniquement) */}
          {isAuthor && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenus Totaux
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-earth" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {totalEarnings.toLocaleString()} XOF
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Vues Totales
                  </CardTitle>
                  <Eye className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {totalViews.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Téléchargements
                  </CardTitle>
                  <Download className="h-4 w-4 text-forest" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {totalDownloads.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue={isAuthor ? "mes-documents" : "mes-achats"} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              {isAuthor && (
                <TabsTrigger value="mes-documents" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Mes Publications
                </TabsTrigger>
              )}
              <TabsTrigger value="mes-achats" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Ma Bibliothèque
              </TabsTrigger>
              <TabsTrigger value="profil" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
            </TabsList>

            {/* Onglet: Mes Documents (Auteurs) */}
            {isAuthor && (
              <TabsContent value="mes-documents">
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle>Documents publiés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myDocuments.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun document publié</h3>
                        <p className="text-muted-foreground mb-4">Commencez à partager votre savoir avec la communauté.</p>
                        <Button asChild variant="outline">
                          <Link href="/upload">Publier mon premier document</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/40">
                        {myDocuments.map((doc) => (
                          <div key={doc.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="h-16 w-12 bg-muted rounded overflow-hidden shrink-0">
                                {doc.cover_image_url ? (
                                  <img src={doc.cover_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="h-6 w-6 m-auto mt-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <Link href={`/documents/${doc.slug}`} className="font-semibold hover:text-gold transition-colors line-clamp-1">
                                  {doc.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={doc.is_approved ? "default" : "secondary"} className="text-xs">
                                    {doc.is_approved ? "Approuvé" : "En attente"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {doc.price === 0 ? "Gratuit" : `${doc.price} XOF`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> {doc.view_count || 0}</span>
                                  <span className="flex items-center"><Download className="h-3 w-3 mr-1" /> {doc.download_count || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                              <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none">
                                <Link href={`/documents/${doc.slug}`}>Voir</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Onglet: Ma Bibliothèque (Achats/Accès gratuits) */}
            <TabsContent value="mes-achats">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle>Documents accessibles</CardTitle>
                </CardHeader>
                <CardContent>
                  {myPurchases.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Votre bibliothèque est vide</h3>
                      <p className="text-muted-foreground mb-4">Explorez le catalogue pour trouver des documents intéressants.</p>
                      <Button asChild variant="outline">
                        <Link href="/catalogue">Explorer le catalogue</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myPurchases.map((purchase) => {
                        const doc = purchase.documents;
                        if (!doc) return null;
                        
                        return (
                          <div key={purchase.id} className="flex gap-4 p-4 border border-border/40 rounded-lg hover:border-gold/30 transition-colors">
                            <div className="h-20 w-16 bg-muted rounded overflow-hidden shrink-0">
                              {doc.cover_image_url ? (
                                <img src={doc.cover_image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="h-8 w-8 m-auto mt-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <h4 className="font-semibold text-sm line-clamp-2 mb-1" title={doc.title}>
                                {doc.title}
                              </h4>
                              {doc.profiles?.full_name && (
                                <p className="text-xs text-muted-foreground truncate mb-auto">
                                  Par {doc.profiles.full_name}
                                </p>
                              )}
                              <Button variant="ghost" size="sm" asChild className="mt-2 h-8 w-full justify-center bg-muted/50 hover:bg-gold/10 hover:text-gold transition-colors">
                                <Link href={`/documents/${doc.slug}`}>
                                  Lire
                                </Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet: Profil */}
            <TabsContent value="profil">
              <Card className="border-border/40 max-w-2xl">
                <CardHeader>
                  <CardTitle>Informations du profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <div className="font-medium">Nom complet</div>
                    <div className="text-muted-foreground bg-muted/30 p-2 rounded">{profile?.full_name || "Non défini"}</div>
                  </div>
                  <div className="grid gap-2">
                    <div className="font-medium">Rôle</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{profile?.role}</Badge>
                      {profile?.role === "visitor" && (
                        <span className="text-xs text-muted-foreground">Contactez le support pour devenir auteur.</span>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="font-medium">Pays</div>
                    <div className="text-muted-foreground bg-muted/30 p-2 rounded">{profile?.country || "Non défini"}</div>
                  </div>
                  <div className="grid gap-2">
                    <div className="font-medium">Biographie</div>
                    <div className="text-muted-foreground bg-muted/30 p-2 rounded min-h-[100px] whitespace-pre-wrap">
                      {profile?.bio || "Aucune biographie."}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/40">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Modifier le profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}