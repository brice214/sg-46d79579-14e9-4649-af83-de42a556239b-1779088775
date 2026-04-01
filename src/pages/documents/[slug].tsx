import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PDFViewer } from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { documentService } from "@/services/documentService";
import { purchaseService } from "@/services/purchaseService";
import { reportService } from "@/services/reportService";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Download, Eye, AlertTriangle, ShoppingCart, FileText, Tag, Calendar, User, DollarSign, Shield, Sparkles, CheckCircle, XCircle } from "lucide-react";

type Document = {
  id: string;
  title: string;
  slug: string;
  description: string;
  author_id: string;
  category_id: string | null;
  keywords: string[];
  document_type: string;
  price: number;
  currency: string;
  page_count: number | null;
  file_url: string;
  cover_image_url: string | null;
  is_certified: boolean;
  is_published: boolean;
  download_count: number;
  view_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
  };
  categories: {
    name: string;
  } | null;
};

export default function DocumentPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { toast } = useToast();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Report modal state
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Admin approval state
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (slug && typeof slug === "string") {
      loadDocument(slug);
    }
  }, [slug, currentUser]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      
      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      setIsAdmin(profile?.role === "admin");
    }
  };

  const loadDocument = async (documentSlug: string) => {
    try {
      setLoading(true);
      const doc = await documentService.getDocumentBySlug(documentSlug);
      
      if (!doc) {
        toast({
          title: "Document introuvable",
          description: "Ce document n'existe pas ou a été supprimé.",
          variant: "destructive",
        });
        router.push("/catalogue");
        return;
      }

      setDocument(doc as Document);

      // Increment view count
      await documentService.incrementViewCount(doc.id);

      let userHasAccess = false;
      // Check if user has access
      if (currentUser) {
        userHasAccess = await documentService.checkUserAccess(doc.id, currentUser.id);
        setHasAccess(userHasAccess);
      }

      // Load PDF URL for viewer (admin always has access)
      if (currentUser && (isAdmin || userHasAccess || doc.price === 0)) {
        const { data } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.file_url, 3600); // 1 hour expiry
        
        if (data?.signedUrl) {
          setPdfUrl(data.signedUrl);
        }
      }
    } catch (error) {
      console.error("Error loading document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le document.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!document || !isAdmin) return;

    try {
      setIsApproving(true);
      await documentService.updateDocument(document.id, {
        is_published: true
      });

      toast({
        title: "✅ Document approuvé",
        description: "Le document est maintenant visible publiquement.",
      });

      // Reload document
      if (slug && typeof slug === "string") {
        await loadDocument(slug);
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le document.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!document || !isAdmin) return;

    try {
      setIsApproving(true);
      await documentService.updateDocument(document.id, {
        is_published: false
      });

      toast({
        title: "Document rejeté",
        description: "Le document a été rejeté et n'est plus visible.",
        variant: "destructive",
      });

      router.push("/admin");
    } catch (error) {
      console.error("Rejection error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le document.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour acheter ce document.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    if (!document) return;

    try {
      // Simulate payment process
      const success = await purchaseService.createTransaction({
        document_id: document.id,
        buyer_id: currentUser.id,
        author_id: document.author_id,
        amount: document.price,
        platform_fee: document.price * 0.15,
        author_earnings: document.price * 0.85,
        payment_method: 'card',
        status: 'completed'
      });

      if (success) {
        toast({
          title: "✅ Achat réussi !",
          description: "Vous pouvez maintenant télécharger ce document.",
        });
        setHasAccess(true);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du paiement.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    if (document.price > 0 && !hasAccess) {
      toast({
        title: "Accès refusé",
        description: "Vous devez acheter ce document pour le télécharger.",
        variant: "destructive",
      });
      return;
    }

    try {
      await documentService.incrementDownloadCount(document.id);
      
      // Download file
      const { data, error } = await supabase.storage
        .from("documents")
        .download(document.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Téléchargement démarré",
        description: "Le document est en cours de téléchargement.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document.",
        variant: "destructive",
      });
    }
  };

  const handleReport = async () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour signaler ce document.",
        variant: "destructive",
      });
      return;
    }

    if (!document || !reportReason || !reportDetails) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReporting(true);
      await reportService.createReport({
        document_id: document.id,
        reporter_id: currentUser.id,
        reason: reportReason as any,
        details: reportDetails
      });

      toast({
        title: "Signalement envoyé",
        description: "Votre signalement a été transmis à notre équipe de modération.",
      });

      setReportReason("");
      setReportDetails("");
    } catch (error) {
      console.error("Report error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le signalement.",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-pulse">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-terre" />
            <p className="text-xl text-noir/70">Chargement du document...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-terre/50" />
          <h1 className="text-2xl font-bold text-noir mb-2">Document introuvable</h1>
          <p className="text-noir/60 mb-6">Ce document n'existe pas ou a été supprimé.</p>
          <Button asChild>
            <Link href="/catalogue">Retour au catalogue</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Admin Controls Bar */}
        {isAdmin && (
          <Card className="mb-6 border-blue-300 bg-blue-50/80 backdrop-blur">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Mode Administrateur</p>
                    <p className="text-sm text-blue-700">
                      Statut : {document.is_published ? (
                        <Badge className="bg-green-500 text-white">Approuvé</Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500 text-orange-700">En attente</Badge>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {!document.is_published ? (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={isApproving}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approuver
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approuver ce document ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Le document sera publié et visible publiquement dans le catalogue.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                              Confirmer l'approbation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={isApproving}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rejeter ce document ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Le document sera rejeté et retiré de la publication.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                              Confirmer le rejet
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="border-red-300 text-red-700" disabled={isApproving}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Retirer la publication
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Retirer la publication ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Le document ne sera plus visible publiquement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                            Confirmer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Section with Document Info */}
        <div className="relative mb-12 rounded-2xl overflow-hidden border border-gold/20 shadow-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/afrilitt-background.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background/95"></div>
          
          <div className="relative p-8 md:p-12 z-10">
            <div className="flex items-start gap-3 mb-4">
              {document.is_certified && (
                <Badge className="bg-or text-noir border-or/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Certifié
                </Badge>
              )}
              {document.categories && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                  {document.categories.name}
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                {document.document_type}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
              {document.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/90 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-medium">{document.profiles.full_name || "Auteur anonyme"}</span>
              </div>
              {document.page_count && (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>{document.page_count} pages</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span>{document.view_count} vues</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <span>{document.download_count} téléchargements</span>
              </div>
            </div>

            {document.keywords && document.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {document.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-white/5 text-white border-white/20">
                    <Tag className="h-3 w-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              {document.price > 0 ? (
                <>
                  <div className="text-3xl font-bold text-or flex items-center gap-2">
                    <DollarSign className="h-8 w-8" />
                    {document.price.toLocaleString()} {document.currency}
                  </div>
                  {hasAccess ? (
                    <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Vous possédez ce document
                    </Badge>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="lg" className="bg-or hover:bg-or/90 text-noir font-bold shadow-lg">
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Acheter & Télécharger
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gradient-to-br from-amber-50 to-orange-50 border-or/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl text-noir">Confirmer l'achat</AlertDialogTitle>
                          <AlertDialogDescription className="text-noir/70">
                            Vous êtes sur le point d'acheter <strong className="text-noir">{document.title}</strong> pour{" "}
                            <strong className="text-or">{document.price.toLocaleString()} {document.currency}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-noir/20">Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePurchase} className="bg-or hover:bg-or/90 text-noir">
                            Confirmer le paiement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              ) : (
                <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Document Gratuit
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Description & PDF Preview */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-terre/20 shadow-xl bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-noir">
                  <BookOpen className="h-6 w-6 text-terre" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-noir/80 leading-relaxed whitespace-pre-wrap">
                  {document.description}
                </p>
              </CardContent>
            </Card>

            {/* PDF Preview with Real Viewer */}
            <Card className="border-terre/20 shadow-xl bg-gradient-to-br from-amber-100 to-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-noir">
                  <FileText className="h-6 w-6 text-terre" />
                  Aperçu du document
                </CardTitle>
                <CardDescription className="text-noir/60">
                  {isAdmin 
                    ? "Mode Admin : Document complet disponible"
                    : hasAccess || document.price === 0
                    ? "Document complet disponible"
                    : "Les 2 premières pages sont visibles. Achetez pour voir l'intégralité."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pdfUrl ? (
                  <PDFViewer 
                    fileUrl={pdfUrl} 
                    maxPages={!isAdmin && !hasAccess && document.price > 0 ? 2 : undefined}
                  />
                ) : (
                  <div className="bg-white/50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-terre/30 text-center">
                    <p className="text-noir/60 mb-4">
                      {currentUser 
                        ? "Chargement du document..."
                        : "Connectez-vous pour voir l'aperçu du document"}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleDownload}
                  disabled={document.price > 0 && !hasAccess && !isAdmin}
                  className="w-full bg-foret hover:bg-foret/90 text-white font-bold shadow-lg"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {document.price > 0 && !hasAccess && !isAdmin ? "Acheter pour télécharger" : "Télécharger le PDF"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Metadata & Report */}
          <div className="space-y-6">
            <Card className="border-terre/20 shadow-xl bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-noir">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-noir/70">
                  <Calendar className="h-4 w-4 text-terre" />
                  <span className="text-sm">
                    Publié le {new Date(document.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-noir mb-2">Auteur</p>
                  <p className="text-noir/80">{document.profiles.full_name || "Auteur anonyme"}</p>
                </div>
                {document.categories && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-noir mb-2">Catégorie</p>
                      <Badge className="bg-terre/10 text-terre border-terre/30">
                        {document.categories.name}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Report Button */}
            <Card className="border-red-200 shadow-xl bg-red-50/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Signaler un problème
                </CardTitle>
                <CardDescription className="text-red-700">
                  Si ce document enfreint les droits d'auteur ou contient du contenu inapproprié.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reason" className="text-red-900">Raison du signalement</Label>
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger id="reason" className="bg-white border-red-300">
                      <SelectValue placeholder="Choisir une raison" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="copyright">Violation de droits d'auteur</SelectItem>
                      <SelectItem value="inappropriate">Contenu inapproprié</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="misleading">Contenu trompeur</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="details" className="text-red-900">Détails</Label>
                  <Textarea
                    id="details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Expliquez le problème..."
                    className="bg-white border-red-300"
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleReport}
                  disabled={isReporting || !reportReason || !reportDetails}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {isReporting ? "Envoi..." : "Envoyer le signalement"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}