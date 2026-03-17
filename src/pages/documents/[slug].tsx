import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { 
  Download, 
  Eye, 
  Calendar, 
  FileText, 
  Tag, 
  AlertTriangle,
  ShoppingCart,
  CheckCircle
} from "lucide-react";
import { documentService } from "@/services/documentService";
import { purchaseService } from "@/services/purchaseService";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DocumentDetails = Database["public"]["Tables"]["documents"]["Row"] & {
  profiles: { 
    id: string; 
    full_name: string | null; 
    avatar_url: string | null;
    bio: string | null;
    country: string | null;
  } | null;
  categories: { id: string; name: string; slug: string } | null;
};

export default function DocumentPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { toast } = useToast();
  
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (slug) {
      loadDocument();
      checkAuth();
    }
  }, [slug]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user?.id || null);
  };

  const loadDocument = async () => {
    if (!slug || typeof slug !== "string") return;

    setLoading(true);
    try {
      const doc = await documentService.getDocumentBySlug(slug);
      setDocument(doc as DocumentDetails);

      // Incrémenter le compteur de vues
      await documentService.incrementViewCount(doc.id);

      // Vérifier l'accès utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && doc.price > 0) {
        const access = await documentService.checkUserAccess(doc.id, session.user.id);
        setHasAccess(access);
      } else if (doc.price === 0) {
        setHasAccess(true);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Document introuvable"
      });
      router.push("/catalogue");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!document || !currentUser) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Veuillez vous connecter pour acheter ce document"
      });
      router.push("/auth/login");
      return;
    }

    setPurchasing(true);
    try {
      // Simuler un paiement (à remplacer par une vraie intégration de paiement)
      const platformFee = Number(document.price) * 0.15; // 15% de frais
      const authorEarnings = Number(document.price) - platformFee;

      const transaction = await purchaseService.createTransaction({
        document_id: document.id,
        buyer_id: currentUser,
        author_id: document.author_id,
        amount: Number(document.price),
        currency: document.currency,
        platform_fee: platformFee,
        author_earnings: authorEarnings,
        payment_method: "card",
        status: "completed"
      });

      await purchaseService.completeTransaction(transaction.id);
      await purchaseService.grantAccess(document.id, currentUser, transaction.id);
      await documentService.incrementDownloadCount(document.id);

      setHasAccess(true);
      toast({
        title: "Achat réussi !",
        description: "Vous pouvez maintenant télécharger le document"
      });
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors de l'achat"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!document || !hasAccess) return;

    // Télécharger le document
    window.open(document.file_url, "_blank");
    
    toast({
      title: "Téléchargement démarré",
      description: "Votre document est en cours de téléchargement"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-earth border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Chargement du document...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!document) return null;

  const isAuthor = currentUser === document.author_id;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Document Header */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <Badge variant={document.price === 0 ? "secondary" : "default"} className="text-sm">
                    {document.price === 0 ? "Gratuit" : `${document.price} ${document.currency}`}
                  </Badge>
                  {document.categories && (
                    <Badge variant="outline">{document.categories.name}</Badge>
                  )}
                  <Badge variant="outline">{document.document_type}</Badge>
                </div>

                <h1 className="font-serif text-4xl font-bold mb-4">{document.title}</h1>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{document.view_count} vues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>{document.download_count} téléchargements</span>
                  </div>
                  {document.page_count && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{document.page_count} pages</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(document.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="prose max-w-none">
                  <h2 className="font-semibold text-xl mb-3">Résumé</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{document.description}</p>
                </div>

                {/* Keywords */}
                {document.keywords && document.keywords.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Mots-clés
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {document.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Preview */}
              <Card className="border-border/40">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Aperçu du document</h3>
                  <div className="bg-muted/30 rounded-lg p-8 text-center">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    {hasAccess ? (
                      <div>
                        <p className="text-muted-foreground mb-4">
                          Vous avez accès à ce document complet
                        </p>
                        <Button onClick={handleDownload} className="bg-gradient-to-r from-earth to-gold text-white">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le PDF
                        </Button>
                      </div>
                    ) : document.price === 0 ? (
                      <div>
                        <p className="text-muted-foreground mb-4">
                          Document gratuit - Connectez-vous pour télécharger
                        </p>
                        <Button asChild>
                          <Link href="/auth/login">Se connecter</Link>
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground mb-4">
                          Achetez ce document pour y accéder en intégralité
                        </p>
                        <Button 
                          onClick={handlePurchase} 
                          disabled={purchasing || isAuthor}
                          className="bg-gradient-to-r from-earth to-gold text-white"
                        >
                          {purchasing ? (
                            <>Traitement...</>
                          ) : isAuthor ? (
                            <>Votre document</>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Acheter pour {document.price} {document.currency}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Card */}
              <Card className="border-border/40">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Auteur</h3>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-earth/10 flex items-center justify-center shrink-0">
                      {document.profiles?.avatar_url ? (
                        <img src={document.profiles.avatar_url} alt="" className="rounded-full w-full h-full object-cover" />
                      ) : (
                        <span className="text-earth font-bold text-2xl">
                          {document.profiles?.full_name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        {document.profiles?.full_name || "Auteur anonyme"}
                      </h4>
                      {document.profiles?.country && (
                        <p className="text-sm text-muted-foreground">{document.profiles.country}</p>
                      )}
                      {document.profiles?.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          {document.profiles.bio}
                        </p>
                      )}
                      <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                        <Link href={`/authors/${document.author_id}`}>
                          Voir le profil
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certification */}
              {document.is_certified && (
                <Card className="border-gold/40 bg-gold/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Document certifié</h4>
                        <p className="text-sm text-muted-foreground">
                          Ce document a été vérifié et certifié par AfriLitt
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Report */}
              {!isAuthor && (
                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <Button variant="outline" size="sm" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Signaler un abus
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}