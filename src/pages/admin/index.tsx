import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, Users, FileText, AlertTriangle, DollarSign, 
  TrendingUp, Eye, CheckCircle, XCircle, Clock, 
  Search, MoreVertical, ShieldAlert, ArrowUpRight,
  UserCheck, UserX, Edit, Trash2, Ban, X, Menu, LogOut, Check
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Types
interface DashboardStats {
  totalUsers: number;
  totalAuthors: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalReports: number;
  totalTransactions: number;
  totalRevenue: number;
  platformRevenue: number;
  newUsersThisWeek: number;
  newDocumentsThisWeek: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  is_published: boolean;
  is_approved: boolean;
  created_at: string;
  author?: {
    full_name: string;
    email: string;
  };
}

interface Report {
  id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
  document_id: string;
  reporter?: {
    email: string;
  };
  document?: {
    title: string;
    slug: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  platform_fee: number;
  payment_method: string;
  status: string;
  created_at: string;
  document?: {
    title: string;
  };
  buyer?: {
    email: string;
  };
  author?: {
    full_name: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Filters
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("all");
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [documentsStatusFilter, setDocumentsStatusFilter] = useState("all");

  // Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "user" | "document" | null;
    id: string | null;
    title: string;
  }>({
    open: false,
    type: null,
    id: null,
    title: "",
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Check admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        toast({
          title: "Accès refusé",
          description: "Cette zone est réservée aux administrateurs.",
          variant: "destructive",
        });
        return;
      }

      // Load all data
      await loadAllData();
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadDocuments(),
        loadReports(),
        loadTransactions(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erreur de chargement",
        description: "Certaines données n'ont pas pu être chargées.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch counts in parallel
    const [
      { count: totalUsers },
      { count: totalAuthors },
      { count: totalDocuments },
      { count: pendingDocuments },
      { count: totalReports },
      { count: newUsers },
      { count: newDocs },
      { data: txData }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["author", "admin"]),
      supabase.from("documents").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }).eq("is_published", true).eq("is_approved", false),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      supabase.from("documents").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      supabase.from("transactions").select("amount, platform_fee, status")
    ]);

    const completedTx = txData?.filter(t => t.status === "completed") || [];
    const totalRevenue = completedTx.reduce((sum, t) => sum + Number(t.amount), 0);
    const platformRevenue = completedTx.reduce((sum, t) => sum + Number(t.platform_fee), 0);

    setStats({
      totalUsers: totalUsers || 0,
      totalAuthors: totalAuthors || 0,
      totalDocuments: totalDocuments || 0,
      pendingDocuments: pendingDocuments || 0,
      totalReports: totalReports || 0,
      totalTransactions: txData?.length || 0,
      totalRevenue,
      platformRevenue,
      newUsersThisWeek: newUsers || 0,
      newDocumentsThisWeek: newDocs || 0,
    });
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as User[]);
  };

  const loadDocuments = async () => {
    const { data } = await supabase
      .from("documents")
      .select(`
        id, title, slug, description, price, is_published, is_approved, created_at,
        author:profiles!documents_author_id_fkey(full_name, email)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setDocuments(data as unknown as Document[]);
  };

  const loadReports = async () => {
    const { data } = await supabase
      .from("reports")
      .select(`
        id, reason, details, status, created_at, document_id,
        reporter:profiles!reports_reporter_id_fkey(email),
        document:documents!reports_document_id_fkey(title, slug)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setReports(data as unknown as Report[]);
  };

  const loadTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select(`
        id, amount, platform_fee, payment_method, status, created_at,
        document:documents(title),
        buyer:profiles!transactions_buyer_id_fkey(email),
        author:profiles!transactions_author_id_fkey(full_name)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setTransactions(data as unknown as Transaction[]);
  };

  // Actions Utils
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (!error) {
      toast({ title: "Succès", description: "Rôle mis à jour." });
      loadUsers();
      loadStats();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (!error) {
      toast({ title: "Succès", description: "Utilisateur supprimé (profil)." });
      loadUsers();
      loadStats();
    }
    setDeleteDialog({ open: false, type: null, id: null, title: "" });
  };

  const handleDocumentAction = async (documentId: string, action: "approve" | "reject" | "delete") => {
    if (action === "delete") {
      await supabase.from("documents").delete().eq("id", documentId);
      toast({ title: "Succès", description: "Document supprimé." });
    } else {
      const is_approved = action === "approve";
      const is_published = action === "approve";
      
      await supabase.from("documents")
        .update({ is_approved, is_published })
        .eq("id", documentId);
      
      toast({ title: "Succès", description: action === "approve" ? "Document approuvé." : "Document rejeté." });
    }
    loadDocuments();
    loadStats();
    setDeleteDialog({ open: false, type: null, id: null, title: "" });
  };

  const handleReportAction = async (reportId: string, documentId: string, action: "dismiss" | "remove_document") => {
    if (action === "remove_document") {
      await supabase.from("documents").update({ is_published: false, is_approved: false }).eq("id", documentId);
    }
    await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
    
    toast({ title: "Succès", description: "Signalement traité." });
    loadReports();
    loadDocuments();
    loadStats();
  };

  // Renderers
  const renderOverview = () => {
    if (!stats) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gold/20 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{stats.totalUsers}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{stats.newUsersThisWeek} cette semaine
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
              <FileText className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{stats.totalDocuments}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{stats.newDocumentsThisWeek} cette semaine
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenus (CFA/EUR)</CardTitle>
              <DollarSign className="h-5 w-5 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Commission: <span className="text-gold font-medium">{stats.platformRevenue.toLocaleString()}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">À Traiter</CardTitle>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-orange-500">{stats.pendingDocuments + stats.totalReports}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingDocuments} docs • {stats.totalReports} signalements
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gold/20 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif">Actions Rapides</CardTitle>
              <CardDescription>Gérez les urgences de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-between h-14 bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20"
                onClick={() => setActiveModule("documents")}
              >
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-orange-500" />
                  <span className="font-medium">Documents en attente</span>
                </div>
                <Badge variant="destructive" className="bg-orange-500">{stats.pendingDocuments}</Badge>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between h-14 bg-red-500/5 hover:bg-red-500/10 border-red-500/20"
                onClick={() => setActiveModule("reports")}
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3 text-red-500" />
                  <span className="font-medium">Signalements ouverts</span>
                </div>
                <Badge variant="destructive">{stats.totalReports}</Badge>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-gold/20 shadow-md bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}>
            <div className="absolute inset-0 bg-black/80"></div>
            <CardContent className="relative z-10 p-8 flex flex-col items-center justify-center text-center h-full min-h-[250px]">
              <ShieldAlert className="h-12 w-12 text-gold mb-4" />
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Super Administrateur</h3>
              <p className="text-gold/80">Vous avez le contrôle total sur AfriLitt. Modérez le contenu pour garantir l'excellence.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const filtered = users.filter(user => {
      const matchesSearch = user.email?.toLowerCase().includes(usersSearch.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(usersSearch.toLowerCase());
      const matchesRole = usersRoleFilter === "all" || user.role === usersRoleFilter;
      return matchesSearch && matchesRole;
    });

    return (
      <Card className="border-gold/20 shadow-lg animate-in fade-in duration-500">
        <CardHeader className="border-b border-gold/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl">Gestion des utilisateurs</CardTitle>
              <CardDescription>{filtered.length} utilisateurs trouvés</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom/email..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Select value={usersRoleFilter} onValueChange={setUsersRoleFilter}>
                <SelectTrigger className="w-[150px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="author">Auteurs</SelectItem>
                  <SelectItem value="visitor">Visiteurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell className="pl-6">
                    <div>
                      <div className="font-medium text-foreground">{user.full_name || "Sans nom"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "destructive" : user.role === "author" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gold/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Changer de rôle</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleChangeUserRole(user.id, "visitor")} disabled={user.role === "visitor"}>
                          <UserX className="h-4 w-4 mr-2" /> Visiteur
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeUserRole(user.id, "author")} disabled={user.role === "author"}>
                          <Edit className="h-4 w-4 mr-2" /> Auteur
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeUserRole(user.id, "admin")} disabled={user.role === "admin"}>
                          <ShieldAlert className="h-4 w-4 mr-2" /> Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => setDeleteDialog({ open: true, type: "user", id: user.id, title: user.email })}>
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const renderDocuments = () => {
    const filtered = documents.filter(doc => {
      const matchesSearch = doc.title?.toLowerCase().includes(documentsSearch.toLowerCase());
      
      let matchesStatus = true;
      if (documentsStatusFilter === "pending") matchesStatus = doc.is_published && !doc.is_approved;
      else if (documentsStatusFilter === "published") matchesStatus = doc.is_published && doc.is_approved;
      else if (documentsStatusFilter === "rejected") matchesStatus = !doc.is_published && !doc.is_approved;

      return matchesSearch && matchesStatus;
    });

    return (
      <Card className="border-gold/20 shadow-lg animate-in fade-in duration-500">
        <CardHeader className="border-b border-gold/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl">Modération des documents</CardTitle>
              <CardDescription>{filtered.length} documents trouvés</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un document..."
                  value={documentsSearch}
                  onChange={(e) => setDocumentsSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Select value={documentsStatusFilter} onValueChange={setDocumentsStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente (Urgent)</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="rejected">Rejetés / Brouillons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Document</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => {
                const isPending = doc.is_published && !doc.is_approved;
                const isPublished = doc.is_published && doc.is_approved;
                
                return (
                  <TableRow key={doc.id} className={`hover:bg-muted/30 ${isPending ? 'bg-orange-500/5' : ''}`}>
                    <TableCell className="pl-6 max-w-[300px]">
                      <div>
                        <div className="font-medium text-foreground truncate">{doc.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">Créé le {new Date(doc.created_at).toLocaleDateString("fr-FR")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{doc.author?.full_name || "Inconnu"}</div>
                      <div className="text-xs text-muted-foreground">{doc.author?.email}</div>
                    </TableCell>
                    <TableCell>
                      {isPending && <Badge className="bg-orange-500 hover:bg-orange-600">En attente</Badge>}
                      {isPublished && <Badge className="bg-green-600 hover:bg-green-700">Publié</Badge>}
                      {!doc.is_published && !doc.is_approved && <Badge variant="secondary">Rejeté / Brouillon</Badge>}
                    </TableCell>
                    <TableCell>
                      {doc.price === 0 ? <Badge variant="outline" className="border-green-500 text-green-600">Gratuit</Badge> : <span className="font-medium">{doc.price} CFA</span>}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/documents/${doc.slug}`} target="_blank">
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Link>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gold/10">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Modération</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!isPublished && (
                              <DropdownMenuItem onClick={() => handleDocumentAction(doc.id, "approve")} className="text-green-600 focus:text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" /> Approuver et Publier
                              </DropdownMenuItem>
                            )}
                            {(isPublished || isPending) && (
                              <DropdownMenuItem onClick={() => handleDocumentAction(doc.id, "reject")} className="text-orange-600 focus:text-orange-600">
                                <XCircle className="h-4 w-4 mr-2" /> Rejeter / Suspendre
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => setDeleteDialog({ open: true, type: "document", id: doc.id, title: doc.title })}>
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Aucun document trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const renderReports = () => {
    return (
      <Card className="border-gold/20 shadow-lg animate-in fade-in duration-500">
        <CardHeader className="border-b border-gold/10 pb-6">
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" /> Signalements à traiter
          </CardTitle>
          <CardDescription>Gérez les alertes de la communauté ({reports.filter(r => r.status === "pending").length} en attente)</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {reports.filter(r => r.status === "pending").map((report) => (
              <Card key={report.id} className="border-red-500/30 shadow-md bg-red-500/5">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="destructive" className="mb-2">{report.reason}</Badge>
                      <CardTitle className="text-lg line-clamp-1">
                        Doc: {report.document?.title || "Document inconnu"}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="shrink-0 bg-background">
                      <Link href={`/documents/${report.document?.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Signalé par {report.reporter?.email} le {new Date(report.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-background p-3 rounded-md text-sm border border-red-500/20 mb-4">
                    "{report.details}"
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="default" 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleReportAction(report.id, report.document_id, "remove_document")}
                    >
                      <Ban className="h-4 w-4 mr-2" /> Suspendre Doc
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleReportAction(report.id, report.document_id, "dismiss")}
                    >
                      <Check className="h-4 w-4 mr-2" /> Ignorer (Faux)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.filter(r => r.status === "pending").length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border mt-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Tout est en ordre</h3>
              <p className="text-muted-foreground">Aucun signalement en attente de modération.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTransactions = () => {
    return (
      <Card className="border-gold/20 shadow-lg animate-in fade-in duration-500">
        <CardHeader className="border-b border-gold/10 pb-6">
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-gold" /> Historique financier
          </CardTitle>
          <CardDescription>Consultez toutes les ventes de la plateforme</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Document / Auteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right pr-6">Montant (Frais)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/30">
                  <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                    {tx.id.split('-')[0]}...
                  </TableCell>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium truncate max-w-[250px]">{tx.document?.title || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">Vendeur: {tx.author?.full_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "completed" ? "default" : "secondary"} className={tx.status === "completed" ? "bg-green-600" : ""}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="font-bold">{Number(tx.amount).toLocaleString()} CFA</div>
                    <div className="text-xs text-gold">Plateforme: {Number(tx.platform_fee).toLocaleString()} CFA</div>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          <p className="text-muted-foreground font-serif">Chargement de l'espace administrateur...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "documents", label: "Documents", icon: FileText, badge: stats?.pendingDocuments || 0 },
    { id: "reports", label: "Signalements", icon: AlertTriangle, badge: stats?.totalReports || 0, badgeColor: "bg-red-500" },
    { id: "transactions", label: "Transactions", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-40 w-full border-b border-gold/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6 gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-gold" />
            <span className="font-serif text-xl font-bold hidden md:inline-block text-foreground">AfriLitt Admin</span>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex border-gold/30 text-gold hover:bg-gold hover:text-white transition-colors">
              <Link href="/">Retour au site</Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => authService.signOut().then(() => router.push("/"))}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`
          fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 shrink-0 
          border-r border-gold/10 bg-card transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="flex flex-col h-full py-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all
                      ${isActive 
                        ? "bg-gradient-to-r from-earth to-gold text-white shadow-md font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <Badge variant="destructive" className={`h-5 px-1.5 flex items-center justify-center text-xs ${isActive ? "bg-white text-earth border-none" : item.badgeColor || "bg-orange-500"}`}>
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-auto pt-6 border-t border-gold/10">
              <div className="px-3 py-2 rounded-xl bg-muted/50 border border-gold/10">
                <p className="text-xs text-muted-foreground font-medium mb-1">Status Système</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Tous les services OK</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1600px] mx-auto">
          {activeModule === "overview" && renderOverview()}
          {activeModule === "users" && renderUsers()}
          {activeModule === "documents" && renderDocuments()}
          {activeModule === "reports" && renderReports()}
          {activeModule === "transactions" && renderTransactions()}
        </main>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, title: "" })}>
        <AlertDialogContent className="border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              Vous êtes sur le point de supprimer définitivement {deleteDialog.type === "user" ? "l'utilisateur" : "le document"} : <br/>
              <strong className="text-foreground mt-2 block p-2 bg-muted rounded-md">{deleteDialog.title}</strong>
              <br/>
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type === "user" && deleteDialog.id) {
                  handleDeleteUser(deleteDialog.id);
                } else if (deleteDialog.type === "document" && deleteDialog.id) {
                  handleDocumentAction(deleteDialog.id, "delete");
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Oui, supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}