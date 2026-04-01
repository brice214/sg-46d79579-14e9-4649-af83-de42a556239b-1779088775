import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, DollarSign, Upload, Eye, Download, FileText, Settings, User,
  TrendingUp, Clock, CheckCircle, XCircle, Edit, Wallet, BarChart3,
  AlertCircle, ArrowUpRight, ChevronRight, ShoppingCart, Lock, Check
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Autoplay from "embla-carousel-autoplay";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentStats {
  id: string;
  title: string;
  slug: string;
  price: number;
  is_approved: boolean;
  is_published: boolean;
  view_count: number;
  download_count: number;
  cover_image_url: string | null;
  created_at: string;
  sales_count: number;
  total_revenue: number;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myDocuments, setMyDocuments] = useState<DocumentStats[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [latestPaidDocuments, setLatestPaidDocuments] = useState<any[]>([]);
  
  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    country: "",
    bio: ""
  });
  
  // Statistiques enrichies
  const [totalViews, setTotalViews] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [salesThisMonth, setSalesThisMonth] = useState(0);
  const [approvalRate, setApprovalRate] = useState(0);

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

      // Charger les documents de l'auteur avec stats détaillées
      if (profileData?.role === "author" || profileData?.role === "admin") {
        const { data: docs } = await supabase
          .from("documents")
          .select("*")
          .eq("author_id", session.user.id)
          .order("created_at", { ascending: false });
          
        if (docs) {
          // Enrichir avec les stats de ventes
          const docsWithStats = await Promise.all(
            docs.map(async (doc) => {
              const { data: transactions } = await supabase
                .from("transactions")
                .select("amount, author_earnings, status")
                .eq("document_id", doc.id)
                .eq("status", "completed");
              
              const salesCount = transactions?.length || 0;
              const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.author_earnings), 0) || 0;
              
              return {
                ...doc,
                sales_count: salesCount,
                total_revenue: totalRevenue,
              } as DocumentStats;
            })
          );
          
          setMyDocuments(docsWithStats);
          
          // Calculer les stats globales
          const views = docsWithStats.reduce((acc, doc) => acc + (doc.view_count || 0), 0);
          const downloads = docsWithStats.reduce((acc, doc) => acc + (doc.download_count || 0), 0);
          const approved = docsWithStats.filter(d => d.is_approved).length;
          const rate = docs.length > 0 ? (approved / docs.length) * 100 : 0;
          
          setTotalViews(views);
          setTotalDownloads(downloads);
          setApprovalRate(Math.round(rate));
        }

        // Charger les revenus (toutes transactions complétées)
        const { data: allTransactions } = await supabase
          .from("transactions")
          .select("author_earnings, created_at, status")
          .eq("author_id", session.user.id)
          .eq("status", "completed");
          
        if (allTransactions) {
          const total = allTransactions.reduce((sum, tx) => sum + Number(tx.author_earnings), 0);
          setTotalEarnings(total);
          
          // Ventes ce mois
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          const thisMonth = allTransactions.filter(
            tx => new Date(tx.created_at) >= startOfMonth
          ).length;
          setSalesThisMonth(thisMonth);
        }

        // Charger les demandes de retrait
        const { data: withdrawals } = await supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("author_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (withdrawals) {
          setWithdrawalRequests(withdrawals);
        }

        // Calculer solde disponible vs en attente
        const { data: totalWithdrawn } = await supabase
          .from("withdrawal_requests")
          .select("amount")
          .eq("author_id", session.user.id)
          .eq("status", "completed");
        
        const withdrawn = totalWithdrawn?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
        const totalEarned = allTransactions?.reduce((sum, tx) => sum + Number(tx.author_earnings), 0) || 0;
        const available = totalEarned - withdrawn;
        
        const { data: pendingWithdrawals } = await supabase
          .from("withdrawal_requests")
          .select("amount")
          .eq("author_id", session.user.id)
          .eq("status", "pending");
        
        const pending = pendingWithdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
        
        setAvailableBalance(available - pending);
        setPendingBalance(pending);
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

      // Charger les 10 dernières parutions payantes
      const { data: latestPaidDocs } = await supabase
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
        .limit(10);
        
      if (latestPaidDocs) {
        setLatestPaidDocuments(latestPaidDocs);
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

  const handleRequestWithdrawal = async () => {
    if (availableBalance < 5000) {
      toast({
        variant: "destructive",
        title: "Solde insuffisant",
        description: "Le montant minimum de retrait est de 5000 XAF."
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from("withdrawal_requests")
        .insert({
          author_id: session.user.id,
          amount: availableBalance,
          net_amount: availableBalance,
          payment_method: "mobile_money",
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de retrait est en cours de traitement."
      });

      loadDashboardData();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la demande de retrait."
      });
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      full_name: profile?.full_name || "",
      country: profile?.country || "",
      bio: profile?.bio || ""
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          country: editForm.country,
          bio: editForm.bio
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès."
      });

      setIsEditingProfile(false);
      loadDashboardData();
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil."
      });
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
        <div className="container max-w-7xl relative z-10">
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
        <div className="container max-w-7xl">
          {/* Statistiques enrichies (Auteurs uniquement) */}
          {isAuthor && (
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-gold/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Solde disponible
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {availableBalance.toLocaleString()} XAF
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      En attente: {pendingBalance.toLocaleString()} XAF
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Revenus totaux
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-earth" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {totalEarnings.toLocaleString()} XAF
                    </div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {salesThisMonth} ventes ce mois
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Vues totales
                    </CardTitle>
                    <Eye className="h-4 w-4 text-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {totalViews.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {myDocuments.length} documents publiés
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Taux d'approbation
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {approvalRate}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalDownloads} téléchargements
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Alertes rapides */}
              {(availableBalance >= 5000 || myDocuments.some(d => !d.is_approved && d.is_published)) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {availableBalance >= 5000 && (
                    <Card className="border-green-500/30 bg-green-500/5">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Retrait disponible</p>
                            <p className="text-sm text-muted-foreground">
                              {availableBalance.toLocaleString()} XAF disponibles
                            </p>
                          </div>
                        </div>
                        <Button size="sm" onClick={handleRequestWithdrawal}>
                          Demander un retrait
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {myDocuments.some(d => !d.is_approved && d.is_published) && (
                    <Card className="border-orange-500/30 bg-orange-500/5">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">Documents en attente</p>
                            <p className="text-sm text-muted-foreground">
                              {myDocuments.filter(d => !d.is_approved && d.is_published).length} en cours de modération
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue={isAuthor ? "mes-documents" : "mes-achats"} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              {isAuthor && (
                <>
                  <TabsTrigger value="mes-documents" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Mes Publications
                  </TabsTrigger>
                  <TabsTrigger value="retraits" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Wallet className="h-4 w-4 mr-2" />
                    Retraits
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="mes-achats" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Ma Bibliothèque
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
            </TabsList>

            {/* Onglet: Mes Documents (Auteurs) - Version améliorée */}
            {isAuthor && (
              <TabsContent value="mes-documents">
                <Card className="border-border/40">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Documents publiés</CardTitle>
                        <CardDescription>
                          {myDocuments.length} documents · {myDocuments.filter(d => d.is_approved).length} approuvés
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline">
                        <Link href="/upload">
                          <Upload className="h-4 w-4 mr-2" />
                          Nouveau document
                        </Link>
                      </Button>
                    </div>
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
                          <div key={doc.id} className="py-6 flex flex-col lg:flex-row items-start gap-6">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="h-20 w-16 bg-muted rounded overflow-hidden shrink-0 shadow-sm">
                                {doc.cover_image_url ? (
                                  <img src={doc.cover_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="h-8 w-8 m-auto mt-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link href={`/documents/${doc.slug}`} className="font-semibold hover:text-gold transition-colors line-clamp-1 text-lg">
                                  {doc.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-2">
                                  {doc.is_approved ? (
                                    <Badge className="bg-green-600 hover:bg-green-700">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approuvé
                                    </Badge>
                                  ) : doc.is_published ? (
                                    <Badge className="bg-orange-500 hover:bg-orange-600">
                                      <Clock className="h-3 w-3 mr-1" />
                                      En attente
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Brouillon
                                    </Badge>
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {doc.price === 0 ? "Gratuit" : `${doc.price} XAF`}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                  <div className="flex items-center text-sm">
                                    <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="font-medium">{doc.view_count || 0}</span>
                                    <span className="text-muted-foreground ml-1">vues</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="font-medium">{doc.download_count || 0}</span>
                                    <span className="text-muted-foreground ml-1">DL</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <DollarSign className="h-4 w-4 mr-2 text-gold" />
                                    <span className="font-medium">{doc.sales_count || 0}</span>
                                    <span className="text-muted-foreground ml-1">ventes</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                    <span className="font-medium text-green-600">{doc.total_revenue.toLocaleString()} XAF</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full lg:w-auto">
                              <Button variant="outline" size="sm" asChild className="flex-1 lg:flex-none">
                                <Link href={`/documents/${doc.slug}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                                <Edit className="h-4 w-4 mr-2" />
                                Éditer
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

            {/* Onglet: Retraits (Auteurs) */}
            {isAuthor && (
              <TabsContent value="retraits">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle>Demander un retrait</CardTitle>
                      <CardDescription>
                        Minimum de retrait: 5000 XAF
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Solde disponible</span>
                          <span className="text-xl font-bold text-green-600">
                            {availableBalance.toLocaleString()} XAF
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">En attente</span>
                          <span className="font-medium">{pendingBalance.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Total gagné</span>
                          <span className="font-medium">{totalEarnings.toLocaleString()} XAF</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={handleRequestWithdrawal}
                        disabled={availableBalance < 5000}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Demander un retrait
                      </Button>

                      {availableBalance < 5000 && (
                        <p className="text-sm text-muted-foreground text-center">
                          Vous devez avoir au moins 5000 XAF pour demander un retrait.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle>Historique des retraits</CardTitle>
                      <CardDescription>
                        Vos 5 dernières demandes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {withdrawalRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Aucune demande de retrait</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {withdrawalRequests.map((withdrawal) => (
                            <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="font-medium">{withdrawal.amount.toLocaleString()} XAF</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(withdrawal.created_at).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                              <Badge 
                                variant={
                                  withdrawal.status === "completed" ? "default" : 
                                  withdrawal.status === "pending" ? "secondary" : 
                                  "destructive"
                                }
                                className={
                                  withdrawal.status === "completed" ? "bg-green-600" :
                                  withdrawal.status === "pending" ? "bg-orange-500" :
                                  ""
                                }
                              >
                                {withdrawal.status === "completed" ? "Complété" :
                                 withdrawal.status === "pending" ? "En attente" :
                                 withdrawal.status === "rejected" ? "Refusé" :
                                 withdrawal.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* Onglet: Ma Bibliothèque (Achats/Accès gratuits) */}
            <TabsContent value="mes-achats">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle>Documents accessibles</CardTitle>
                  <CardDescription>
                    {myPurchases.length} documents dans votre bibliothèque
                  </CardDescription>
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
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du profil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nom complet</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{profile?.full_name || "Non défini"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{profile?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rôle</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <Badge variant={profile?.role === "author" ? "default" : "secondary"}>
                          {profile?.role === "author" ? "Auteur" : "Lecteur"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Pays</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{profile?.country || "Non défini"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Biographie</Label>
                      <div className="p-3 bg-muted rounded-md min-h-[80px]">
                        <p className="text-sm text-muted-foreground">{profile?.bio || "Aucune biographie."}</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleEditProfile}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Modifier le profil
                    </Button>
                  </CardContent>
                </Card>

                {/* Right: Latest Paid Documents Carousel */}
                <Card className="bg-gradient-to-br from-terre/5 to-orange-50 border-terre/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-noir">
                      <TrendingUp className="h-5 w-5 text-terre" />
                      Dernières parutions payantes
                    </CardTitle>
                    <CardDescription>
                      Découvrez les 10 derniers documents publiés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestPaidDocuments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Aucun document disponible</p>
                      </div>
                    ) : (
                      <Carousel
                        opts={{
                          align: "start",
                          loop: true,
                        }}
                        plugins={[
                          Autoplay({
                            delay: 4000,
                          }) as any,
                        ]}
                        className="w-full"
                      >
                        <CarouselContent>
                          {latestPaidDocuments.map((doc) => {
                            const hasPurchased = myPurchases.some(p => p.documents?.id === doc.id);
                            
                            return (
                              <CarouselItem key={doc.id}>
                                <div className="p-1">
                                  <Card className="border-terre/30 hover:border-terre hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                                    <CardContent className="p-0">
                                      {/* Cover Image */}
                                      <div className="relative h-48 w-full bg-gradient-to-br from-terre/10 to-orange-50 overflow-hidden group">
                                        {doc.cover_image_url ? (
                                          <>
                                            <img
                                              src={doc.cover_image_url}
                                              alt={doc.title}
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent" />
                                          </>
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <FileText className="h-16 w-16 text-terre/30" />
                                          </div>
                                        )}
                                        
                                        {/* Category Badge on Image */}
                                        {doc.categories?.name && (
                                          <div className="absolute top-3 left-3">
                                            <Badge className="bg-gold text-noir font-semibold shadow-lg">
                                              {doc.categories.name}
                                            </Badge>
                                          </div>
                                        )}

                                        {/* Purchase Status Badge */}
                                        {hasPurchased && (
                                          <div className="absolute top-3 right-3">
                                            <Badge className="bg-foret text-white font-semibold shadow-lg">
                                              <Check className="h-3 w-3 mr-1" />
                                              Acheté
                                            </Badge>
                                          </div>
                                        )}

                                        {/* Price Badge */}
                                        <div className="absolute bottom-3 right-3">
                                          <div className="bg-terre text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                            {doc.price} XAF
                                          </div>
                                        </div>
                                      </div>

                                      {/* Content */}
                                      <div className="p-5 space-y-4">
                                        {/* Document Title */}
                                        <div>
                                          <Link 
                                            href={`/documents/${doc.slug}`}
                                            className="text-lg font-bold text-noir hover:text-terre transition-colors line-clamp-2 block"
                                          >
                                            {doc.title}
                                          </Link>
                                          <p className="text-sm text-noir/60 mt-2 line-clamp-2">
                                            {doc.description}
                                          </p>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 text-xs text-noir/50 pt-2 border-t border-terre/10">
                                          <div className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-terre" />
                                            <span className="font-medium">{doc.profiles?.full_name || "Auteur"}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <Eye className="h-3.5 w-3.5 text-terre" />
                                            <span>{doc.views || 0} vues</span>
                                          </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-2">
                                          {hasPurchased ? (
                                            <Link href={`/documents/${doc.slug}`} className="block">
                                              <Button size="lg" className="w-full bg-foret hover:bg-foret/90 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                                                <Download className="h-4 w-4 mr-2" />
                                                Télécharger maintenant
                                              </Button>
                                            </Link>
                                          ) : (
                                            <Link href={`/documents/${doc.slug}`} className="block">
                                              <Button size="lg" className="w-full bg-gradient-to-r from-gold via-amber-500 to-gold hover:from-gold/90 hover:via-amber-600 hover:to-gold/90 text-noir font-bold shadow-md hover:shadow-lg transition-all">
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                Acheter ce document
                                              </Button>
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </CarouselItem>
                            );
                          })}
                        </CarouselContent>
                        <CarouselPrevious className="-left-4 bg-white border-terre/30 text-terre hover:bg-terre hover:text-white" />
                        <CarouselNext className="-right-4 bg-white border-terre/30 text-terre hover:bg-terre hover:text-white" />
                      </Carousel>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-noir">Modifier mon profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">
                Nom complet *
              </Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Votre nom complet"
                className="border-terre/20 focus:border-terre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Pays
              </Label>
              <Input
                id="country"
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                placeholder="Ex: Gabon, Cameroun, etc."
                className="border-terre/20 focus:border-terre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                Biographie
              </Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Parlez-nous un peu de vous..."
                rows={4}
                className="border-terre/20 focus:border-terre resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {editForm.bio.length}/500 caractères
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditingProfile(false)}
              className="border-terre/20 hover:bg-terre/5"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={!editForm.full_name.trim()}
              className="bg-gradient-to-r from-gold via-amber-500 to-gold hover:from-gold/90 hover:via-amber-600 hover:to-gold/90 text-noir font-semibold"
            >
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}