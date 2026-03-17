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

type Category = Database["public"]["Tables"]["categories"]["Row"];

export default function Upload() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [keywords, setKeywords] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [price, setPrice] = useState("0");
  const [pageCount, setPageCount] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [certifyRights, setCertifyRights] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    checkAuth();
    loadCategories();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour publier un document"
      });
      router.push("/auth/login");
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

    if (!certifyRights || !acceptTerms) {
      toast({
        variant: "destructive",
        title: "Certifications requises",
        description: "Vous devez certifier vos droits et accepter les CGU"
      });
      return;
    }

    if (!pdfFile) {
      toast({
        variant: "destructive",
        title: "Fichier requis",
        description: "Vous devez uploader un fichier PDF"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload PDF to Supabase Storage
      const pdfFileName = `${Date.now()}-${pdfFile.name}`;
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from("documents")
        .upload(`pdfs/${currentUser}/${pdfFileName}`, pdfFile);

      if (pdfError) throw pdfError;

      const { data: { publicUrl: pdfUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(pdfData.path);

      // Upload cover image if provided
      let coverUrl = null;
      if (coverImage) {
        const coverFileName = `${Date.now()}-${coverImage.name}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from("documents")
          .upload(`covers/${currentUser}/${coverFileName}`, coverImage);

        if (!coverError) {
          const { data: { publicUrl } } = supabase.storage
            .from("documents")
            .getPublicUrl(coverData.path);
          coverUrl = publicUrl;
        }
      }

      // Create document record
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
        currency: "XOF",
        page_count: pageCount ? parseInt(pageCount) : null,
        file_url: pdfUrl,
        cover_image_url: coverUrl,
        file_size_bytes: pdfFile.size,
        is_published: true,
        is_approved: false // Nécessite approbation admin
      });

      toast({
        title: "Document publié !",
        description: "Votre document est en attente de validation par l'équipe AfriLitt"
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
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
            Publier un document
          </h1>
          <p className="text-lg text-gold/90 drop-shadow-md max-w-2xl mx-auto">
            Partagez votre savoir avec la communauté AfriLitt. Contribuez à l'enrichissement de la bibliothèque numérique africaine.
          </p>
        </div>
      </div>

      <main className="flex-1 py-12 bg-gradient-to-b from-earth/5 via-background to-gold/5">
        <div className="container max-w-4xl">
          <Card className="border-gold/20 shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Informations du document
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
                    placeholder="Décrivez le contenu de votre document..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                  />
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
                    <Label htmlFor="price">Prix (XOF) *</Label>
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
                  <Label htmlFor="pdf">Fichier PDF *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="pdf" className="cursor-pointer">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      {pdfFile ? (
                        <p className="text-sm font-medium">{pdfFile.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium mb-1">
                            Cliquez pour sélectionner un PDF
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
                  <Label htmlFor="cover">Image de couverture (optionnel)</Label>
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
                            Cliquez pour ajouter une couverture
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
                    disabled={uploading || !certifyRights || !acceptTerms}
                    className="flex-1 bg-gradient-to-r from-earth to-gold text-white"
                  >
                    {uploading ? (
                      <>Upload en cours...</>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Publier le document
                      </>
                    )}
                  </Button>
                </div>

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