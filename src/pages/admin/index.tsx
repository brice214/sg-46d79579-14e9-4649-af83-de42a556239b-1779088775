import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { documentService } from "@/services/documentService";
import { reportService } from "@/services/reportService";
import { purchaseService } from "@/services/purchaseService";
import { 
  LayoutDashboard, Users, FileText, AlertTriangle, DollarSign, 
  TrendingUp, Eye, Download, CheckCircle, XCircle, Clock, 
  Search, Filter, MoreVertical, ShieldAlert, ArrowUpRight,
  UserCheck, UserX, Edit, Trash2, Ban, Check, X
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

interface Transaction {
  id: string;
  amount: number;
  platform_fee: number;
  author_earnings: number;
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
  const [activeTab, setActiveTab] = useState("overview");
  
  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAuthors: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    totalReports: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    newUsersThisWeek: 0,
    newDocumentsThisWeek: 0,
  });

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("all");

  // Documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [documentsStatusFilter, setDocumentsStatusFilter] = useState("all");

  // Reports
  const [reports, setReports] = useState<any[]>([]);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Delete confirmation
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const profile = await authService.getProfile(session.user.id);
    if (profile?.role !== "admin") {
      router.push("/dashboard");
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires.",
        variant: "destructive",
      });
      return;
    }

    loadDashboardData();
  };

  const loadDashboardData = async () => {
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
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Total authors
      const { count: totalAuthors } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("role", ["author", "admin"]);

      // Total documents
      const { count: totalDocuments } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      // Pending documents
      const { count: pendingDocuments } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Total reports
      const { count: totalReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Total transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("amount, platform_fee, status");

      const totalTransactions = transactionsData?.length || 0;
      const totalRevenue = transactionsData
        ?.filter(t => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      const platformRevenue = transactionsData
        ?.filter(t => t.status === "completed")
        .reduce((sum, t) => sum + t.platform_fee, 0) || 0;

      // New users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newUsersThisWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // New documents this week
      const { count: newDocumentsThisWeek } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalAuthors: totalAuthors || 0,
        totalDocuments: totalDocuments || 0,
        pendingDocuments: pendingDocuments || 0,
        totalReports: totalReports || 0,
        totalTransactions,
        totalRevenue,
        platformRevenue,
        newUsersThisWeek: newUsersThisWeek || 0,
        newDocumentsThisWeek: newDocumentsThisWeek || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const loadReports = async () => {
    try {
      const reportsData = await reportService.getAllReports();
      setReports(reportsData);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          document:documents(title),
          buyer:profiles!transactions_buyer_id_fkey(email),
          author:profiles!transactions_author_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // User actions
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Rôle modifié",
        description: "Le rôle de l'utilisateur a été mis à jour.",
      });

      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error changing user role:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Delete profile (cascade will handle related data)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });

      loadUsers();
      loadStats();
      setDeleteDialog({ open: false, type: null, id: null, title: "" });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  // Document actions
  const handleApproveDocument = async (documentId: string) => {
    try {
      await documentService.updateDocumentStatus(documentId, "published");
      toast({
        title: "Document approuvé",
        description: "Le document a été publié avec succès.",
      });
      loadDocuments();
      loadStats();
    } catch (error) {
      console.error("Error approving document:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le document.",
        variant: "destructive",
      });
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    try {
      await documentService.updateDocumentStatus(documentId, "rejected");
      toast({
        title: "Document rejeté",
        description: "Le document a été rejeté.",
      });
      loadDocuments();
      loadStats();
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le document.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé définitivement.",
      });
      loadDocuments();
      loadStats();
      setDeleteDialog({ open: false, type: null, id: null, title: "" });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document.",
        variant: "destructive",
      });
    }
  };

  // Report actions
  const handleResolveReport = async (reportId: string, action: "dismiss" | "remove_document") => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      if (action === "remove_document") {
        await documentService.updateDocumentStatus(report.document_id, "rejected");
      }

      await reportService.updateReportStatus(reportId, "resolved");

      toast({
        title: "Signalement traité",
        description: action === "remove_document" 
          ? "Le document a été retiré de la plateforme."
          : "Le signalement a été rejeté.",
      });

      loadReports();
      loadDocuments();
      loadStats();
    } catch (error) {
      console.error("Error resolving report:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le signalement.",
        variant: "destructive",
      });
    }
  };

  // Filtered data
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(usersSearch.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(usersSearch.toLowerCase());
    const matchesRole = usersRoleFilter === "all" || user.role === usersRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(documentsSearch.toLowerCase());
    const matchesStatus = documentsStatusFilter === "all" || doc.status === documentsStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "warning",
      published: "default",
      rejected: "destructive",
      completed: "default",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === "pending" && "En attente"}
        {status === "published" && "Publié"}
        {status === "rejected" && "Rejeté"}
        {status === "completed" && "Complété"}
        {status === "failed" && "Échoué"}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: any = {
      admin: "bg-red-500",
      author: "bg-blue-500",
      visitor: "bg-gray-500",
    };
    return (
      <Badge className={colors[role] || "bg-gray-500"}>
        {role === "admin" && "Admin"}
        {role === "author" && "Auteur"}
        {role === "visitor" && "Visiteur"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <div className="relative pt-16 pb-12 border-b border-gold/20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background"></div>
        </div>
        <div className="container max-w-7xl relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="h-8 w-8 text-gold" />
            <h1 className="font-serif text-4xl font-bold text-white drop-shadow-lg">
              Dashboard Admin
            </h1>
          </div>
          <p className="text-gold/90 text-lg drop-shadow-md">
            Gérez tous les aspects de la plateforme AfriLitt
          </p>
        </div>
      </div>

      <main className="flex-1 py-8 bg-gradient-to-b from-earth/5 via-background to-gold/5">
        <div className="container max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Navigation Tabs */}
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Signalements
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Transactions
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPIs Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gold/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      +{stats.newUsersThisWeek} cette semaine
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Documents</CardTitle>
                    <FileText className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      +{stats.newDocumentsThisWeek} cette semaine
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">En attente</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingDocuments}</div>
                    <p className="text-xs text-muted-foreground">
                      Documents à modérer
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-gradient-to-br from-gold/10 to-gold/5">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                    <DollarSign className="h-4 w-4 text-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
                    <p className="text-xs text-muted-foreground">
                      Commission: {stats.platformRevenue.toFixed(2)} €
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Stats */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-gold/20">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-500" />
                      Auteurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-500">{stats.totalAuthors}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contributeurs actifs
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gold/20">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Signalements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">{stats.totalReports}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      À traiter
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gold/20">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{stats.totalTransactions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ventes totales
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-gold/20">
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>Accédez rapidement aux tâches importantes</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2"
                    onClick={() => setActiveTab("documents")}
                  >
                    <Clock className="h-4 w-4" />
                    {stats.pendingDocuments} documents en attente
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2"
                    onClick={() => setActiveTab("reports")}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {stats.totalReports} signalements
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="h-4 w-4" />
                    Gérer les utilisateurs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2"
                    onClick={() => setActiveTab("transactions")}
                  >
                    <DollarSign className="h-4 w-4" />
                    Voir les transactions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="border-gold/20">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Gestion des utilisateurs</CardTitle>
                      <CardDescription>
                        {filteredUsers.length} utilisateur(s) trouvé(s)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un utilisateur..."
                          value={usersSearch}
                          onChange={(e) => setUsersSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={usersRoleFilter} onValueChange={setUsersRoleFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="author">Auteur</SelectItem>
                          <SelectItem value="visitor">Visiteur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.full_name || "Sans nom"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleChangeUserRole(user.id, "visitor")}
                                  disabled={user.role === "visitor"}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Définir comme Visiteur
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleChangeUserRole(user.id, "author")}
                                  disabled={user.role === "author"}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Définir comme Auteur
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleChangeUserRole(user.id, "admin")}
                                  disabled={user.role === "admin"}
                                >
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  Définir comme Admin
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setDeleteDialog({
                                    open: true,
                                    type: "user",
                                    id: user.id,
                                    title: `${user.full_name || user.email}`,
                                  })}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card className="border-gold/20">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Gestion des documents</CardTitle>
                      <CardDescription>
                        {filteredDocuments.length} document(s) trouvé(s)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un document..."
                          value={documentsSearch}
                          onChange={(e) => setDocumentsSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={documentsStatusFilter} onValueChange={setDocumentsStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="published">Publiés</SelectItem>
                          <SelectItem value="rejected">Rejetés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{doc.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {doc.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {doc.profiles?.full_name || "Inconnu"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {doc.price === 0 ? (
                              <Badge variant="secondary">Gratuit</Badge>
                            ) : (
                              <span className="font-semibold">{doc.price} €</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell>
                            {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/documents/${doc.slug}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir le document
                                  </Link>
                                </DropdownMenuItem>
                                {doc.status === "pending" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleApproveDocument(doc.id)}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approuver
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleRejectDocument(doc.id)}
                                      className="text-orange-600"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rejeter
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setDeleteDialog({
                                    open: true,
                                    type: "document",
                                    id: doc.id,
                                    title: doc.title,
                                  })}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="border-gold/20">
                <CardHeader>
                  <CardTitle>Signalements en attente</CardTitle>
                  <CardDescription>
                    {reports.filter(r => r.status === "pending").length} signalement(s) à traiter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.filter(r => r.status === "pending").map((report) => (
                      <Card key={report.id} className="border-orange-500/20">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {report.document?.title || "Document supprimé"}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{report.reason}</Badge>
                                <span className="text-xs">
                                  Par {report.reporter?.email || "Utilisateur"} - {new Date(report.created_at).toLocaleDateString("fr-FR")}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{report.details}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveReport(report.id, "dismiss")}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rejeter le signalement
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleResolveReport(report.id, "remove_document")}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Retirer le document
                            </Button>
                            {report.document && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                              >
                                <Link href={`/documents/${report.document.slug}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir le document
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {reports.filter(r => r.status === "pending").length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun signalement en attente</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <Card className="border-gold/20">
                <CardHeader>
                  <CardTitle>Historique des transactions</CardTitle>
                  <CardDescription>
                    {transactions.length} transaction(s) enregistrée(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Acheteur</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="font-medium">
                              {transaction.document?.title || "Document supprimé"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {transaction.buyer?.email || "Inconnu"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {transaction.author?.full_name || "Inconnu"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{transaction.amount.toFixed(2)} €</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gold font-semibold">
                              {transaction.platform_fee.toFixed(2)} €
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune transaction enregistrée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, title: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. {deleteDialog.type === "user" ? "L'utilisateur" : "Le document"} <strong>{deleteDialog.title}</strong> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type === "user" && deleteDialog.id) {
                  handleDeleteUser(deleteDialog.id);
                } else if (deleteDialog.type === "document" && deleteDialog.id) {
                  handleDeleteDocument(deleteDialog.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}