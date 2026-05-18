import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { categoryService } from "@/services/categoryService";
import { documentService } from "@/services/documentService";
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import type { Category } from "@/services/categoryService";

export default function Upload() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  // Sanitize filename helper - remove accents, special chars, limit length
  const sanitizeFileName = (fileName: string): string => {
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Remove accents and special characters
    const sanitized = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with dash
      .replace(/-+/g, '-') // Replace multiple dashes with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .substring(0, 50); // Limit to 50 chars
    
    return `${sanitized}${extension}`;
  };

  // Word counter helper function
  const countWords = (text: string): number => {
    if (!text.trim()) return 0;
    // Split by whitespace and filter out empty strings
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const [descriptionWordCount, setDescriptionWordCount] = useState(0);
  const MIN_WORDS = 300;
  const MAX_WORDS = 500;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [keywords, setKeywords] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [price, setPrice] = useState("0");
  const [promoPrice, setPromoPrice] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [certifyRights, setCertifyRights] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    checkAuth();
    loadCategories();
  }, []);

  useEffect(() => {
    // Détecter le mode édition et charger le document
    const editId = router.query.edit as string;
    if (editId && currentUser) {
      loadDocumentForEdit(editId);
    }
  }, [router.query.edit, currentUser]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour uploader un document.",
        variant: "destructive",
      });
      router.push("/auth/connexion");
      return;
    }

    // Vérifier le rôle
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "author" && profile?.role !== "admin") {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Seuls les auteurs peuvent publier des documents"
      });
      router.push("/");
      return;
    }

    setCurrentUser(session.user.id);
  };

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadDocumentForEdit = async (documentId: string) => {
    try {
      setLoading(true);
      const doc = await documentService.getDocumentById(documentId);
      
      // Vérifier que l'utilisateur est bien l'auteur
      if (doc.author_id !== currentUser) {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous ne pouvez éditer que vos propres documents"
        });
        router.push("/dashboard");
        return;
      }

      // Pré-remplir le formulaire
      setEditMode(true);
      setEditingDocumentId(documentId);
      setTitle(doc.title);
      setDescription(doc.description);
      setDescriptionWordCount(countWords(doc.description));
      setCategoryId(doc.category_id || "");
      setKeywords(Array.isArray(doc.keywords) ? doc.keywords.join(", ") : "");
      setDocumentType(doc.document_type || "");
      setPrice(doc.price.toString());
      setPromoPrice(doc.promo_price ? doc.promo_price.toString() : "");
      setPageCount(doc.page_count ? doc.page_count.toString() : "");
      
      // Les fichiers existants ne sont pas modifiables directement
      // mais on peut en uploader de nouveaux
      
      toast({
        title: "Mode édition",
        description: "Vous pouvez maintenant modifier votre document"
      });
    } catch (error: any) {
      console.error("Error loading document:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger le document"
      });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Format invalide",
          description: "Seuls les fichiers PDF sont acceptés"
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50 MB max
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: "Le fichier ne doit pas dépasser 50 MB"
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Format invalide",
          description: "Seules les images sont acceptées"
        });
        return;
      }
      setCoverImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    console.log("🔍 DEBUG - Current User ID:", currentUser);

    if (!certifyRights || !acceptTerms) {
      toast({
        variant: "destructive",
        title: "Certifications requises",
        description: "Vous devez certifier vos droits et accepter les CGU"
      });
      return;
    }

    // En mode édition, le PDF n'est pas obligatoire (on garde l'ancien)
    if (!editMode && !pdfFile) {
      toast({
        variant: "destructive",
        title: "Fichier requis",
        description: "Vous devez uploader un fichier PDF"
      });
      return;
    }

    setUploading(true);

    try {
      // Vérifier la session auth avant l'upload
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("🔍 DEBUG - Session:", { 
        userId: session?.user?.id, 
        hasSession: !!session,
        sessionError 
      });

      if (!session?.user) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      let pdfUrl = null;
      let coverUrl = null;

      // Upload PDF si un nouveau fichier est fourni
      if (pdfFile) {
        const sanitizedName = sanitizeFileName(pdfFile.name);
        const pdfFileName = `${Date.now()}-${sanitizedName}`;
        const uploadPath = `pdfs/${currentUser}/${pdfFileName}`;
        
        console.log("🔍 DEBUG - Upload path:", uploadPath);

        const { data: pdfData, error: pdfError } = await supabase.storage
          .from("documents")
          .upload(uploadPath, pdfFile);

        console.log("🔍 DEBUG - Upload result:", { pdfData, pdfError });

        if (pdfError) throw pdfError;

        const { data: { publicUrl } } = supabase.storage
          .from("documents")
          .getPublicUrl(pdfData.path);
        
        pdfUrl = publicUrl;
      }

      // Upload cover image si fournie
      if (coverImage) {
        const sanitizedName = sanitizeFileName(coverImage.name);
        const coverFileName = `${Date.now()}-${sanitizedName}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from("documents")
          .upload(`covers/${currentUser}/${coverFileName}`, coverImage);

        console.log("🔍 DEBUG - Cover upload result:", { coverData, coverError });

        if (coverError) {
          console.error("Cover upload error:", coverError);
          toast({
            variant: "destructive",
            title: "Erreur upload couverture",
            description: `L'image de couverture n'a pas pu être uploadée: ${coverError.message}`
          });
          // Ne pas bloquer la mise à jour du document pour cette erreur
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("documents")
            .getPublicUrl(coverData.path);
          coverUrl = publicUrl;
          console.log("🔍 DEBUG - Cover URL:", coverUrl);
        }
      }

      if (editMode && editingDocumentId) {
        // MODE ÉDITION - Mettre à jour le document existant
        const updates: any = {
          title,
          description,
          category_id: categoryId || null,
          keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
          document_type: documentType as any,
          price: parseFloat(price),
          promo_price: promoPrice ? parseFloat(promoPrice) : null,
          page_count: pageCount ? parseInt(pageCount) : null,
          updated_at: new Date().toISOString()
        };

        // Ajouter les nouveaux fichiers seulement s'ils ont été uploadés
        if (pdfUrl) {
          updates.file_url = pdfUrl;
          updates.file_size_bytes = pdfFile!.size;
        }
        if (coverUrl) {
          updates.cover_image_url = coverUrl;
        }

        await documentService.updateDocument(editingDocumentId, updates);

        toast({
          title: "Document mis à jour !",
          description: "Vos modifications ont été enregistrées avec succès"
        });
      } else {
        // MODE CRÉATION - Créer un nouveau document
        const slug = title.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        await documentService.createDocument({
          title,
          slug: `${slug}-${Date.now()}`,
          description,
          author_id: currentUser,
          category_id: categoryId || null,
          keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
          document_type: documentType as any,
          price: parseFloat(price),
          promo_price: promoPrice ? parseFloat(promoPrice) : null,
          currency: "XAF",
          page_count: pageCount ? parseInt(pageCount) : null,
          file_url: pdfUrl!,
          cover_image_url: coverUrl,
          file_size_bytes: pdfFile!.size,
          is_published: true,
          is_approved: false
        });

        toast({
          title: "Document publié !",
          description: "Votre document est en attente de validation par l'équipe AfriLitt"
        });
      }

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="relative pt-20 pb-16 border-b border-gold/20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background"></div>
        </div>
        <div className="container max-w-4xl relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
            {editMode ? "Modifier le document" : "Publier un document"}
          </h1>
          <p className="text-lg text-gold/90 drop-shadow-md max-w-2xl mx-auto">
            {editMode 
              ? "Mettez à jour les informations de votre document"
              : "Partagez votre savoir avec la communauté AfriLitt. Contribuez à l'enrichissement de la bibliothèque numérique africaine."
            }
          </p>
        </div>
      </div>

      <main className="flex-1 py-12 bg-gradient-to-b from-earth/5 via-background to-gold/5">
        <div className="container max-w-4xl">
          <Card className="border-gold/20 shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                {editMode ? "Modifier les informations" : "Informations du document"}
              </CardTitle>
              <CardDescription>
                Tous les champs marqués d'un astérisque (*) sont obligatoires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Les Soleils des Indépendances"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description / Résumé *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const wordCount = countWords(newValue);
                      setDescriptionWordCount(wordCount);
                      setDescription(newValue);
                    }}
                    placeholder="Décrivez le contenu de votre document..."
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <p className={`font-medium ${
                      descriptionWordCount < MIN_WORDS 
                        ? "text-destructive" 
                        : descriptionWordCount > MAX_WORDS
                        ? "text-orange-600"
                        : "text-foret"
                    }`}>
                      {descriptionWordCount} / {MIN_WORDS}-{MAX_WORDS} mots
                    </p>
                    {descriptionWordCount < MIN_WORDS && (
                      <p className="text-xs text-destructive">
                        Encore {MIN_WORDS - descriptionWordCount} mots requis
                      </p>
                    )}
                    {descriptionWordCount > MAX_WORDS && (
                      <p className="text-xs text-orange-600">
                        {descriptionWordCount - MAX_WORDS} mots en trop
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Une description détaillée (300-500 mots) aide les lecteurs à découvrir votre document et améliore son référencement.
                  </p>
                </div>

                {/* Catégorie et Type */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type de document *</Label>
                    <Select value={documentType} onValueChange={setDocumentType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="memoire">Mémoire</SelectItem>
                        <SelectItem value="these">Thèse</SelectItem>
                        <SelectItem value="roman">Roman</SelectItem>
                        <SelectItem value="essai">Essai</SelectItem>
                        <SelectItem value="manuel">Manuel</SelectItem>
                        <SelectItem value="recherche">Recherche</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mots-clés */}
                <div className="space-y-2">
                  <Label htmlFor="keywords">Mots-clés</Label>
                  <Input
                    id="keywords"
                    placeholder="Séparez les mots-clés par des virgules"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex: littérature, afrique, colonialisme
                  </p>
                </div>

                {/* Prix et Pages */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (XAF) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 pour gratuit"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promoPrice">Prix promo (XAF)</Label>
                    <Input
                      id="promoPrice"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Prix promotionnel (facultatif)"
                      value={promoPrice}
                      onChange={(e) => setPromoPrice(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Si défini, c'est ce prix qui sera utilisé
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pageCount">Nombre de pages</Label>
                    <Input
                      id="pageCount"
                      type="number"
                      min="1"
                      placeholder="Ex: 120"
                      value={pageCount}
                      onChange={(e) => setPageCount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Upload PDF */}
                <div className="space-y-2">
                  <Label htmlFor="pdf">
                    Fichier PDF {editMode ? "(optionnel - garder l'actuel si vide)" : "*"}
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                      required={!editMode}
                    />
                    <label htmlFor="pdf" className="cursor-pointer">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      {pdfFile ? (
                        <p className="text-sm font-medium">{pdfFile.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium mb-1">
                            {editMode 
                              ? "Cliquez pour remplacer le PDF (optionnel)"
                              : "Cliquez pour sélectionner un PDF"
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Maximum 50 MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Upload Cover Image */}
                <div className="space-y-2">
                  <Label htmlFor="cover">
                    Image de couverture {editMode ? "(optionnel - garder l'actuelle si vide)" : "(optionnel)"}
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Input
                      id="cover"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                    <label htmlFor="cover" className="cursor-pointer">
                      {coverImage ? (
                        <p className="text-sm font-medium">{coverImage.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium mb-1">
                            {editMode
                              ? "Cliquez pour remplacer la couverture (optionnel)"
                              : "Cliquez pour ajouter une couverture"
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG ou WebP
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <Separator />

                {/* Certifications légales */}
                <div className="space-y-4 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                        Certifications obligatoires
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="certify"
                            checked={certifyRights}
                            onCheckedChange={(checked) => setCertifyRights(checked as boolean)}
                          />
                          <Label htmlFor="certify" className="text-sm leading-relaxed cursor-pointer">
                            Je certifie être l'auteur ou posséder les droits de publication de ce document.
                            Je m'engage à ne pas publier de contenu protégé par des droits d'auteur sans autorisation.
                          </Label>
                        </div>

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          />
                          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            J'accepte les{" "}
                            <Link href="/terms" className="text-earth hover:text-gold underline">
                              conditions d'utilisation
                            </Link>{" "}
                            d'AfriLitt et comprends que mon document sera soumis à validation.
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={uploading}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={
                      uploading || 
                      !title || 
                      !description || 
                      descriptionWordCount < MIN_WORDS ||
                      descriptionWordCount > MAX_WORDS ||
                      !categoryId || 
                      !documentType || 
                      (!editMode && !pdfFile) ||
                      !certifyRights ||
                      !acceptTerms
                    }
                    className="w-full bg-gradient-to-r from-gold via-amber-500 to-gold hover:from-gold/90 hover:via-amber-600 hover:to-gold/90 text-noir font-bold shadow-lg"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-noir mr-2" />
                        {editMode ? "Mise à jour..." : "Publication en cours..."}
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-5 w-5" />
                        {editMode ? "Enregistrer les modifications" : "Publier le document"}
                      </>
                    )}
                  </Button>
                </div>

                {/* Help text for disabled button */}
                {(descriptionWordCount < MIN_WORDS || descriptionWordCount > MAX_WORDS) && (
                  <p className="text-sm text-center text-destructive font-medium">
                    {descriptionWordCount < MIN_WORDS 
                      ? `⚠️ La description doit contenir au moins ${MIN_WORDS} mots pour être publiée`
                      : `⚠️ La description ne doit pas dépasser ${MAX_WORDS} mots`
                    }
                  </p>
                )}

                {uploading && (
                  <Alert>
                    <AlertDescription>
                      Upload en cours... Veuillez patienter sans fermer cette page.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}