import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { categoryService } from "@/services/categoryService";
import { platformSettingsService } from "@/services/platformSettingsService";
import { analyticsService } from "@/services/analyticsService";
import { bannerService } from "@/services/bannerService";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, Users, FileText, AlertTriangle, DollarSign, 
  TrendingUp, Eye, CheckCircle, XCircle, Clock, 
  Search, MoreVertical, ShieldAlert, ArrowUpRight,
  UserCheck, UserX, Edit, Trash2, Ban, X, Menu, LogOut, Check, PenTool, Lock,
  Settings, BarChart3, Image, FolderTree, Plus, Save, GripVertical, ChevronUp, ChevronDown, Wallet
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "@/services/categoryService";
import type { Banner } from "@/services/bannerService";
import { SalesChart } from "@/components/admin/SalesChart";
import { TopDocumentsChart } from "@/components/admin/TopDocumentsChart";
import { TopAuthorsChart } from "@/components/admin/TopAuthorsChart";
import { ConversionMetrics } from "@/components/admin/ConversionMetrics";
import { WithdrawalSettings } from "@/components/admin/WithdrawalSettings";
import { WithdrawalRequests } from "@/components/admin/WithdrawalRequests";

// Types
interface DashboardStats {
  totalVisitors: number;
  totalAuthors: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalReports: number;
  totalTransactions: number;
  totalRevenue: number;
  platformRevenue: number;
  newVisitorsThisWeek: number;
  newAuthorsThisWeek: number;
  newDocumentsThisWeek: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface Author {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  is_blocked?: boolean;
  total_documents?: number;
  total_sales?: number;
  total_revenue?: number;
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

interface CategoryWithCount extends Category {
  documentCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [visitors, setVisitors] = useState<User[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  // Platform Settings States
  const [commissionRate, setCommissionRate] = useState(15);
  const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(true);
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(true);
  const [platformName, setPlatformName] = useState("AfriLitt");
  const [primaryColor, setPrimaryColor] = useState("#D4AF37");
  const [termsOfService, setTermsOfService] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  // Filters
  const [visitorsSearch, setVisitorsSearch] = useState("");
  const [authorsSearch, setAuthorsSearch] = useState("");
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [documentsStatusFilter, setDocumentsStatusFilter] = useState("all");

  // Dialog States
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "visitor" | "author" | "document" | "category" | "banner" | null;
    id: string | null;
    title: string;
  }>({
    open: false,
    type: null,
    id: null,
    title: "",
  });

  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category: Category | null;
  }>({
    open: false,
    mode: "create",
    category: null,
  });

  const [bannerDialog, setBannerDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    banner: Banner | null;
  }>({
    open: false,
    mode: "create",
    banner: null,
  });

  // Category Form States
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
  });

  // Banner Form States
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    cta_text: "",
    cta_link: "",
    display_order: 1,
    is_active: true,
  });

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "visitors"
    | "authors"
    | "documents"
    | "reports"
    | "transactions"
    | "categories"
    | "banners"
    | "analytics"
    | "settings"
    | "withdrawals"
  >("overview");
  
  const [withdrawalSubTab, setWithdrawalSubTab] = useState<"settings" | "requests">("settings");

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
        loadVisitors(),
        loadAuthors(),
        loadDocuments(),
        loadReports(),
        loadTransactions(),
        loadCategories(),
        loadBanners(),
        loadPlatformSettings(),
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

    const [
      { count: totalVisitors },
      { count: totalAuthors },
      { count: totalDocuments },
      { count: pendingDocuments },
      { count: totalReports },
      { count: newVisitors },
      { count: newAuthors },
      { count: newDocs },
      { data: txData }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "visitor"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "author"),
      supabase.from("documents").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }).eq("is_published", true).eq("is_approved", false),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "visitor").gte("created_at", weekAgo.toISOString()),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "author").gte("created_at", weekAgo.toISOString()),
      supabase.from("documents").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      supabase.from("transactions").select("amount, platform_fee, status")
    ]);

    const completedTx = txData?.filter(t => t.status === "completed") || [];
    const totalRevenue = completedTx.reduce((sum, t) => sum + Number(t.amount), 0);
    const platformRevenue = completedTx.reduce((sum, t) => sum + Number(t.platform_fee), 0);

    setStats({
      totalVisitors: totalVisitors || 0,
      totalAuthors: totalAuthors || 0,
      totalDocuments: totalDocuments || 0,
      pendingDocuments: pendingDocuments || 0,
      totalReports: totalReports || 0,
      totalTransactions: txData?.length || 0,
      totalRevenue,
      platformRevenue,
      newVisitorsThisWeek: newVisitors || 0,
      newAuthorsThisWeek: newAuthors || 0,
      newDocumentsThisWeek: newDocs || 0,
    });
  };

  const loadVisitors = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "visitor")
      .order("created_at", { ascending: false });
    if (data) setVisitors(data as User[]);
  };

  const loadAuthors = async () => {
    const { data: authorProfiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "author")
      .order("created_at", { ascending: false });

    if (authorProfiles) {
      const authorsWithStats = await Promise.all(
        authorProfiles.map(async (author) => {
          const [
            { count: totalDocuments },
            { data: sales }
          ] = await Promise.all([
            supabase.from("documents").select("*", { count: "exact", head: true }).eq("author_id", author.id),
            supabase.from("transactions").select("amount, status").eq("author_id", author.id).eq("status", "completed")
          ]);

          const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

          return {
            ...author,
            total_documents: totalDocuments || 0,
            total_sales: sales?.length || 0,
            total_revenue: totalRevenue,
            is_blocked: false,
          };
        })
      );
      setAuthors(authorsWithStats as Author[]);
    }
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

  const loadCategories = async () => {
    const cats = await categoryService.getAllCategories();
    const catsWithCount = await Promise.all(
      cats.map(async (cat) => ({
        ...cat,
        documentCount: await categoryService.getCategoryDocumentCount(cat.id),
      }))
    );
    setCategories(catsWithCount);
  };

  const loadBanners = async () => {
    const data = await bannerService.getAllBanners();
    setBanners(data);
  };

  const loadPlatformSettings = async () => {
    const config = await platformSettingsService.getConfig();
    setCommissionRate(config.commission_rate);
    setMobileMoneyEnabled(config.mobile_money_enabled);
    setCardPaymentEnabled(config.card_payment_enabled);
    setPlatformName(config.platform_name);
    setPrimaryColor(config.primary_color);
    setTermsOfService(config.terms_of_service);
    setPrivacyPolicy(config.privacy_policy);
  };

  // Category Actions
  const handleCreateCategory = async () => {
    const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.display_order || 0), 0);
    const newCategory = await categoryService.createCategory({
      ...categoryForm,
      display_order: maxOrder + 1,
      is_active: true,
    });

    if (newCategory) {
      toast({ title: "Succès", description: "Catégorie créée." });
      loadCategories();
      setCategoryDialog({ open: false, mode: "create", category: null });
      setCategoryForm({ name: "", slug: "", description: "", icon: "" });
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryDialog.category) return;
    
    const success = await categoryService.updateCategory(categoryDialog.category.id, categoryForm);
    if (success) {
      toast({ title: "Succès", description: "Catégorie mise à jour." });
      loadCategories();
      setCategoryDialog({ open: false, mode: "create", category: null });
      setCategoryForm({ name: "", slug: "", description: "", icon: "" });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const success = await categoryService.deleteCategory(categoryId);
    if (success) {
      toast({ title: "Succès", description: "Catégorie supprimée." });
      loadCategories();
    }
    setDeleteDialog({ open: false, type: null, id: null, title: "" });
  };

  const handleReorderCategory = async (categoryId: string, direction: "up" | "down") => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const reorderedCategories = [...categories];
    [reorderedCategories[currentIndex], reorderedCategories[newIndex]] = 
    [reorderedCategories[newIndex], reorderedCategories[currentIndex]];

    const categoryIds = reorderedCategories.map(c => c.id);
    const success = await categoryService.reorderCategories(categoryIds);
    
    if (success) {
      setCategories(reorderedCategories);
      toast({ title: "Succès", description: "Ordre mis à jour." });
    }
  };

  // Banner Actions
  const handleCreateBanner = async () => {
    const newBanner = await bannerService.createBanner(bannerForm);
    if (newBanner) {
      toast({ title: "Succès", description: "Bannière créée." });
      loadBanners();
      setBannerDialog({ open: false, mode: "create", banner: null });
      setBannerForm({ title: "", subtitle: "", image_url: "", cta_text: "", cta_link: "", display_order: 1, is_active: true });
    }
  };

  const handleUpdateBanner = async () => {
    if (!bannerDialog.banner) return;
    
    const success = await bannerService.updateBanner(bannerDialog.banner.id, bannerForm);
    if (success) {
      toast({ title: "Succès", description: "Bannière mise à jour." });
      loadBanners();
      setBannerDialog({ open: false, mode: "create", banner: null });
      setBannerForm({ title: "", subtitle: "", image_url: "", cta_text: "", cta_link: "", display_order: 1, is_active: true });
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const success = await bannerService.deleteBanner(bannerId);
    if (success) {
      toast({ title: "Succès", description: "Bannière supprimée." });
      loadBanners();
    }
    setDeleteDialog({ open: false, type: null, id: null, title: "" });
  };

  const handleToggleBanner = async (bannerId: string, isActive: boolean) => {
    const success = await bannerService.updateBanner(bannerId, { is_active: !isActive });
    if (success) {
      toast({ title: "Succès", description: isActive ? "Bannière désactivée." : "Bannière activée." });
      loadBanners();
    }
  };

  // Platform Settings Actions
  const handleSavePlatformSettings = async () => {
    await Promise.all([
      platformSettingsService.updateSetting("commission_rate", commissionRate),
      platformSettingsService.updateSetting("mobile_money_enabled", mobileMoneyEnabled),
      platformSettingsService.updateSetting("card_payment_enabled", cardPaymentEnabled),
      platformSettingsService.updateSetting("platform_name", platformName),
      platformSettingsService.updateSetting("primary_color", primaryColor),
      platformSettingsService.updateSetting("terms_of_service", termsOfService),
      platformSettingsService.updateSetting("privacy_policy", privacyPolicy),
    ]);
    toast({ title: "Succès", description: "Configuration enregistrée." });
  };

  // Existing Actions
  const handleDeleteVisitor = async (visitorId: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", visitorId);
    if (!error) {
      toast({ title: "Succès", description: "Utilisateur supprimé." });
      loadVisitors();
      loadStats();
    }
    setDeleteDialog({ open: false, type: null, id: null, title: "" });
  };

  const handleBlockAuthor = async (authorId: string, isBlocked: boolean) => {
    toast({ 
      title: isBlocked ? "Auteur débloqué" : "Auteur bloqué", 
      description: "Fonctionnalité en développement" 
    });
  };

  const handleDeleteAuthor = async (authorId: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", authorId);
    if (!error) {
      toast({ title: "Succès", description: "Auteur supprimé." });
      loadAuthors();
      loadStats();
    }
    setDeleteDialog({ open: false, type: null, id: null, title: "" });
  };

  const handleResetAuthorPassword = async (authorEmail: string) => {
    try {
      await supabase.auth.resetPasswordForEmail(authorEmail);
      toast({ 
        title: "Email envoyé", 
        description: `Un email de réinitialisation a été envoyé à ${authorEmail}` 
      });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible d'envoyer l'email de réinitialisation", 
        variant: "destructive" 
      });
    }
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs (Clients)</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{stats.totalVisitors}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{stats.newVisitorsThisWeek} cette semaine
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Auteurs</CardTitle>
              <PenTool className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{stats.totalAuthors}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{stats.newAuthorsThisWeek} cette semaine
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gold/20 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Actions Rapides</CardTitle>
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

  const renderVisitors = () => {
    const filtered = visitors.filter(visitor => 
      visitor.email?.toLowerCase().includes(visitorsSearch.toLowerCase()) ||
      visitor.full_name?.toLowerCase().includes(visitorsSearch.toLowerCase())
    );

    return (
      <Card className="border-gold/20 shadow-lg animate-in fade-in duration-500">
        <CardHeader className="border-b border-gold/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl">Gestion des utilisateurs (Clients)</CardTitle>
              <CardDescription>{filtered.length} utilisateurs trouvés</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom/email..."
                value={visitorsSearch}
                onChange={(e) => setVisitorsSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Utilisateur</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((visitor) => (
                <TableRow key={visitor.id} className="hover:bg-muted/30">
                  <TableCell className="pl-6">
                    <div>
                      <div className="font-medium text-foreground">{visitor.full_name || "Sans nom"}</div>
                      <div className="text-sm text-muted-foreground">{visitor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(visitor.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gold/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => setDeleteDialog({ open: true, type: "visitor", id: visitor.id, title: visitor.email })}>
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
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

  const renderAuthors = () => {
    const filtered = authors.filter(author => 
      author.email?.toLowerCase().includes(authorsSearch.toLowerCase()) ||
      author.full_name?.toLowerCase().includes(authorsSearch.toLowerCase())
    );

    return (
      <Card className="border-gold/20 shadow-lg animate-in fade-in duration-500">
        <CardHeader className="border-b border-gold/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl flex items-center gap-2">
                <PenTool className="h-6 w-6 text-purple-500" />
                Gestion des auteurs
              </CardTitle>
              <CardDescription>{filtered.length} auteurs trouvés</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un auteur..."
                value={authorsSearch}
                onChange={(e) => setAuthorsSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Auteur</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Ventes</TableHead>
                <TableHead>Revenus</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((author) => (
                <TableRow key={author.id} className={`hover:bg-muted/30 ${author.is_blocked ? 'bg-red-500/5' : ''}`}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium text-foreground">{author.full_name || "Sans nom"}</div>
                        <div className="text-sm text-muted-foreground">{author.email}</div>
                      </div>
                      {author.is_blocked && (
                        <Badge variant="destructive" className="text-xs">Bloqué</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {author.total_documents || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {author.total_sales || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gold">
                      {(author.total_revenue || 0).toLocaleString()} CFA
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(author.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gold/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Gestion de l'auteur</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleBlockAuthor(author.id, author.is_blocked || false)}>
                          <Ban className="h-4 w-4 mr-2" /> 
                          {author.is_blocked ? "Débloquer" : "Bloquer"} l'auteur
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetAuthorPassword(author.email)}>
                          <Lock className="h-4 w-4 mr-2" /> Réinitialiser mot de passe
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => setDeleteDialog({ open: true, type: "author", id: author.id, title: author.email })}>
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer l'auteur
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Aucun auteur trouvé
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
                    {new Date(tx.created_at).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } as any)}
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

  const renderCategories = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="border-gold/20 shadow-lg">
          <CardHeader className="border-b border-gold/10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <FolderTree className="h-6 w-6 text-gold" />
                  Gestion des catégories
                </CardTitle>
                <CardDescription>{categories.length} catégories configurées</CardDescription>
              </div>
              <Button onClick={() => {
                setCategoryForm({ name: "", slug: "", description: "", icon: "" });
                setCategoryDialog({ open: true, mode: "create", category: null });
              }}>
                <Plus className="h-4 w-4 mr-2" /> Nouvelle catégorie
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 pl-6"></TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => (
                  <TableRow key={category.id} className="hover:bg-muted/30">
                    <TableCell className="pl-6">
                      <div className="flex flex-col gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleReorderCategory(category.id, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleReorderCategory(category.id, "down")}
                          disabled={index === categories.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {category.icon && <span className="text-xl">{category.icon}</span>}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">{category.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      /{category.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.documentCount}</Badge>
                    </TableCell>
                    <TableCell>
                      {category.is_active ? (
                        <Badge variant="default" className="bg-green-600">Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setCategoryForm({
                              name: category.name,
                              slug: category.slug,
                              description: category.description || "",
                              icon: category.icon || "",
                            });
                            setCategoryDialog({ open: true, mode: "edit", category });
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteDialog({ open: true, type: "category", id: category.id, title: category.name })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
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
      </div>
    );
  };

  const renderBanners = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="border-gold/20 shadow-lg">
          <CardHeader className="border-b border-gold/10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <Image className="h-6 w-6 text-gold" />
                  Gestion des bannières
                </CardTitle>
                <CardDescription>Personnalisez les bannières de la page d'accueil</CardDescription>
              </div>
              <Button onClick={() => {
                setBannerForm({ title: "", subtitle: "", image_url: "", cta_text: "", cta_link: "", display_order: banners.length + 1, is_active: true });
                setBannerDialog({ open: true, mode: "create", banner: null });
              }}>
                <Plus className="h-4 w-4 mr-2" /> Nouvelle bannière
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {banners.map((banner) => (
                <Card key={banner.id} className="border-gold/20 overflow-hidden">
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${banner.image_url})` }}>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
                        <p className="text-sm opacity-90">{banner.subtitle}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={banner.is_active ? "default" : "secondary"} className={banner.is_active ? "bg-green-600" : ""}>
                        {banner.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        CTA: {banner.cta_text} → {banner.cta_link}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleBanner(banner.id, banner.is_active || false)}>
                            <Eye className="h-4 w-4 mr-2" /> 
                            {banner.is_active ? "Désactiver" : "Activer"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setBannerForm({
                              title: banner.title,
                              subtitle: banner.subtitle || "",
                              image_url: banner.image_url || "",
                              cta_text: banner.cta_text || "",
                              cta_link: banner.cta_link || "",
                              display_order: banner.display_order || 1,
                              is_active: banner.is_active ?? true,
                            });
                            setBannerDialog({ open: true, mode: "edit", banner });
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteDialog({ open: true, type: "banner", id: banner.id, title: banner.title })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {banners.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Aucune bannière configurée</p>
                <p className="text-sm">Créez votre première bannière pour personnaliser la page d'accueil</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <SalesChart />
        
        <div className="grid gap-6 md:grid-cols-2">
          <TopDocumentsChart />
          <TopAuthorsChart />
        </div>

        <ConversionMetrics />
      </div>
    );
  };

  const renderWithdrawals = () => {
    return (
      <div className="space-y-6">
        {/* Sub-navigation tabs */}
        <Card className="border-gold/20">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={withdrawalSubTab === "settings" ? "default" : "outline"}
                onClick={() => setWithdrawalSubTab("settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button
                variant={withdrawalSubTab === "requests" ? "default" : "outline"}
                onClick={() => setWithdrawalSubTab("requests")}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Demandes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content based on sub-tab */}
        {withdrawalSubTab === "settings" ? <WithdrawalSettings /> : <WithdrawalRequests />}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="border-gold/20 shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Settings className="h-6 w-6 text-gold" />
              Configuration de la plateforme
            </CardTitle>
            <CardDescription>Gérez les paramètres globaux d'AfriLitt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Payment Settings */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">💳 Paramètres de paiement</h3>
                <p className="text-sm text-muted-foreground mb-4">Configurez les méthodes de paiement et les commissions</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commission">Taux de commission plateforme (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    value={String(commissionRate)}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Commission prélevée sur chaque vente (actuellement {String(commissionRate)}%)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mobile-money">Mobile Money</Label>
                    <input
                      id="mobile-money"
                      type="checkbox"
                      checked={Boolean(mobileMoneyEnabled)}
                      onChange={(e) => setMobileMoneyEnabled(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="card-payment">Carte bancaire</Label>
                    <input
                      id="card-payment"
                      type="checkbox"
                      checked={Boolean(cardPaymentEnabled)}
                      onChange={(e) => setCardPaymentEnabled(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">🎨 Identité visuelle</h3>
                <p className="text-sm text-muted-foreground mb-4">Personnalisez l'apparence de la plateforme</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Nom de la plateforme</Label>
                  <Input
                    id="platform-name"
                    value={String(platformName)}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary-color">Couleur primaire</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={String(primaryColor)}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={String(primaryColor)}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">⚖️ Mentions légales</h3>
                <p className="text-sm text-muted-foreground mb-4">Conditions d'utilisation et politique de confidentialité</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="terms">Conditions Générales d'Utilisation (CGU)</Label>
                  <Textarea
                    id="terms"
                    rows={6}
                    value={String(termsOfService)}
                    onChange={(e) => setTermsOfService(e.target.value)}
                    placeholder="Rédigez vos CGU..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy">Politique de confidentialité</Label>
                  <Textarea
                    id="privacy"
                    rows={6}
                    value={String(privacyPolicy)}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    placeholder="Rédigez votre politique de confidentialité..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSavePlatformSettings} size="lg">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer la configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const navItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "visitors", label: "Utilisateurs", icon: Users },
    { id: "authors", label: "Auteurs", icon: PenTool },
    { id: "documents", label: "Documents", icon: FileText, badge: stats?.pendingDocuments || 0 },
    { id: "reports", label: "Signalements", icon: AlertTriangle, badge: stats?.totalReports || 0, badgeColor: "bg-red-500" },
    { id: "transactions", label: "Transactions", icon: DollarSign },
    { id: "categories", label: "Catégories", icon: FolderTree },
    { id: "withdrawals", label: "Retraits", icon: Wallet },
    { id: "settings", label: "Configuration", icon: Settings },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "banners", label: "Bannières", icon: Image },
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
          border-r border-gold/10 bg-card transition-transform duration-300 ease-in-out overflow-y-auto
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="flex flex-col h-full py-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
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
                    {item.badge && item.badge > 0 && (
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
          {activeTab === "overview" && renderOverview()}
          {activeTab === "visitors" && renderVisitors()}
          {activeTab === "authors" && renderAuthors()}
          {activeTab === "documents" && renderDocuments()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "transactions" && renderTransactions()}
          {activeTab === "categories" && renderCategories()}
          {activeTab === "banners" && renderBanners()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "withdrawals" && renderWithdrawals()}
          {activeTab === "settings" && renderSettings()}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, title: "" })}>
        <AlertDialogContent className="border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              Vous êtes sur le point de supprimer définitivement :
              <br/>
              <strong className="text-foreground mt-2 block p-2 bg-muted rounded-md">{deleteDialog.title}</strong>
              <br/>
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type === "visitor" && deleteDialog.id) {
                  handleDeleteVisitor(deleteDialog.id);
                } else if (deleteDialog.type === "author" && deleteDialog.id) {
                  handleDeleteAuthor(deleteDialog.id);
                } else if (deleteDialog.type === "document" && deleteDialog.id) {
                  handleDocumentAction(deleteDialog.id, "delete");
                } else if (deleteDialog.type === "category" && deleteDialog.id) {
                  handleDeleteCategory(deleteDialog.id);
                } else if (deleteDialog.type === "banner" && deleteDialog.id) {
                  handleDeleteBanner(deleteDialog.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Oui, supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog.open} onOpenChange={(open) => !open && setCategoryDialog({ open: false, mode: "create", category: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryDialog.mode === "create" ? "Créer une catégorie" : "Modifier la catégorie"}
            </DialogTitle>
            <DialogDescription>
              {categoryDialog.mode === "create" 
                ? "Ajoutez une nouvelle catégorie de documents" 
                : "Modifiez les informations de la catégorie"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nom de la catégorie</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Romans, Essais..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug (URL)</Label>
              <Input
                id="cat-slug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="Ex: romans, essais..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-icon">Icône (emoji)</Label>
              <Input
                id="cat-icon"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                placeholder="Ex: 📚, 📖, 📝..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description (optionnel)</Label>
              <Textarea
                id="cat-desc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Décrivez cette catégorie..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog({ open: false, mode: "create", category: null })}>
              Annuler
            </Button>
            <Button onClick={categoryDialog.mode === "create" ? handleCreateCategory : handleUpdateCategory}>
              <Save className="h-4 w-4 mr-2" />
              {categoryDialog.mode === "create" ? "Créer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialog.open} onOpenChange={(open) => !open && setBannerDialog({ open: false, mode: "create", banner: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {bannerDialog.mode === "create" ? "Créer une bannière" : "Modifier la bannière"}
            </DialogTitle>
            <DialogDescription>
              {bannerDialog.mode === "create" 
                ? "Ajoutez une nouvelle bannière pour la page d'accueil" 
                : "Modifiez les informations de la bannière"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="banner-title">Titre</Label>
                <Input
                  id="banner-title"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="Titre principal de la bannière"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-subtitle">Sous-titre</Label>
                <Input
                  id="banner-subtitle"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="Sous-titre ou description"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-image">URL de l'image</Label>
              <Input
                id="banner-image"
                value={bannerForm.image_url}
                onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="banner-cta">Texte du bouton CTA</Label>
                <Input
                  id="banner-cta"
                  value={bannerForm.cta_text}
                  onChange={(e) => setBannerForm({ ...bannerForm, cta_text: e.target.value })}
                  placeholder="Ex: Explorer, Découvrir..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-url">Lien du CTA</Label>
                <Input
                  id="banner-url"
                  value={bannerForm.cta_link}
                  onChange={(e) => setBannerForm({ ...bannerForm, cta_link: e.target.value })}
                  placeholder="/catalogue, /categories..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-order">Ordre d'affichage</Label>
              <Input
                id="banner-order"
                type="number"
                min="1"
                value={bannerForm.display_order}
                onChange={(e) => setBannerForm({ ...bannerForm, display_order: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBannerDialog({ open: false, mode: "create", banner: null })}>
              Annuler
            </Button>
            <Button onClick={bannerDialog.mode === "create" ? handleCreateBanner : handleUpdateBanner}>
              <Save className="h-4 w-4 mr-2" />
              {bannerDialog.mode === "create" ? "Créer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}