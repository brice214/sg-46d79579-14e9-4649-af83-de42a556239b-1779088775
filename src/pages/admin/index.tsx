import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle, FileText, ShieldAlert, Eye } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/integrations/supabase/types";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type Report = Database["public"]["Tables"]["reports"]["Row"] & {
  documents: { title: string; slug: string } | null;
  profiles: { full_name: string } | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Cette zone est réservée aux administrateurs."
        });
        router.push("/");
        return;
      }

      await Promise.all([loadPendingDocs(), loadReports()]);
    } catch (error) {
      console.error("Admin check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingDocs = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });
    
    if (data) setPendingDocs(data);
  };

  const loadReports = async () => {
    const { data } = await supabase
      .from("reports")
      .select(`
        *,
        documents (title, slug),
        profiles:reporter_id (full_name)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setReports(data as unknown as Report[]);
  };

  const handleApproveDoc = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ is_approved: true, is_published: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Document approuvé",
        description: "Le document est maintenant public sur la plateforme."
      });
      loadPendingDocs();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'approuver le document." });
    }
  };

  const handleRejectDoc = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document rejeté ?")) return;
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Document supprimé", description: "Le document a été rejeté et supprimé." });
      loadPendingDocs();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer le document." });
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Signalement résolu", description: "Le statut a été mis à jour." });
      loadReports();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de résoudre le signalement." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full border-4 border-earth border-r-transparent h-8 w-8"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-earth" />
              Administration AfriLitt
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les publications en attente et les signalements de la communauté.
            </p>
          </div>

          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Documents en attente
                {pendingDocs.length > 0 && (
                  <Badge variant="destructive" className="ml-2 bg-earth">{pendingDocs.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports">
                Signalements
                {reports.filter(r => r.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="ml-2">{reports.filter(r => r.status === "pending").length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Documents à modérer</CardTitle>
                  <CardDescription>Vérifiez les documents avant leur publication sur le catalogue.</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingDocs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucun document en attente.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingDocs.map(doc => (
                        <div key={doc.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">{doc.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{doc.document_type}</Badge>
                              <Badge variant="outline">{doc.price === 0 ? "Gratuit" : `${doc.price} XOF`}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 md:mt-0">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/documents/${doc.slug}`}>
                                <Eye className="h-4 w-4 mr-1" /> Voir
                              </Link>
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveDoc(doc.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectDoc(doc.id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Rejeter
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Signalements d'utilisateurs</CardTitle>
                  <CardDescription>Gérez les abus, problèmes de droits d'auteur, etc.</CardDescription>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucun signalement.</p>
                  ) : (
                    <div className="space-y-4">
                      {reports.map(report => (
                        <div key={report.id} className="flex flex-col md:flex-row justify-between items-start p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={report.status === "pending" ? "destructive" : "secondary"}>
                                {report.status === "pending" ? "En attente" : "Résolu"}
                              </Badge>
                              <span className="font-semibold capitalize text-amber-600">{report.reason}</span>
                            </div>
                            <p className="text-sm"><strong>Détails :</strong> {report.details}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Document : {report.documents?.title || "Document supprimé"} | 
                              Signalé par : {report.profiles?.full_name || "Anonyme"} le {new Date(report.created_at || "").toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4 md:mt-0 md:ml-4">
                            {report.documents?.slug && (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/documents/${report.documents.slug}`}>Voir Document</Link>
                              </Button>
                            )}
                            {report.status === "pending" && (
                              <Button size="sm" onClick={() => handleResolveReport(report.id)}>
                                Marquer comme résolu
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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