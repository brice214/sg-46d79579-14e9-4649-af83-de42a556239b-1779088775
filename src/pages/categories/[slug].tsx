import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { BookOpen, User, Tag, ArrowLeft, TrendingUp, FileText } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { documentService } from "@/services/documentService";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"] & {
  profiles?: { full_name: string | null } | null;
};

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (slug && typeof slug === "string") {
      loadCategoryData(slug);
    }
  }, [slug]);

  const loadCategoryData = async (categorySlug: string) => {
    setLoading(true);
    try {
      const [categoryData, allDocuments] = await Promise.all([
        categoryService.getCategoryBySlug(categorySlug),
        documentService.getPublishedDocuments()
      ]);

      setCategory(categoryData);
      
      // Filter documents by category
      const categoryDocuments = allDocuments.filter(
        doc => doc.category_id === categoryData.id
      );
      setDocuments(categoryDocuments);
    } catch (error) {
      console.error("Error loading category:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && Number(doc.price) === 0) ||
                        (priceFilter === "paid" && Number(doc.price) > 0);
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    
    return matchesPrice && matchesType;
  });

  // Icon mapping
  const getCategoryIcon = (name?: string): string => {
    if (!name) return "📖";
    const iconMap: { [key: string]: string } = {
      "Littérature": "📚",
      "Sciences": "🔬",
      "Histoire": "📜",
      "Philosophie": "💭",
      "Économie": "📊",
      "Éducation": "🎓",
      "Arts": "🎨",
      "Droit": "⚖️"
    };
    return iconMap[name] || "📖";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md border-gold/20">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Catégorie introuvable</h2>
            <p className="text-muted-foreground mb-6">
              Cette catégorie n'existe pas ou a été supprimée.
            </p>
            <Button asChild className="bg-gradient-to-r from-earth to-gold">
              <Link href="/categories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux catégories
              </Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-gold/20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            <Button
              asChild
              variant="ghost"
              className="mb-6 text-white hover:text-gold hover:bg-white/10"
            >
              <Link href="/categories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Toutes les catégories
              </Link>
            </Button>

            <div className="text-center space-y-6">
              <div className="text-8xl mb-6 drop-shadow-2xl">
                {getCategoryIcon(category.name)}
              </div>
              
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
                  {category.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
                <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-gold drop-shadow-md">
                    {documents.length}
                  </div>
                  <div className="text-sm text-gray-200">Documents</div>
                </div>
                <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-gold drop-shadow-md">
                    {documents.filter(d => Number(d.price) === 0).length}
                  </div>
                  <div className="text-sm text-gray-200">Gratuits</div>
                </div>
                <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-gold drop-shadow-md">
                    {documents.reduce((sum, d) => sum + (d.view_count || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-200">Vues</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <main className="flex-1 py-12 bg-gradient-to-b from-earth/5 via-background to-gold/5">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Filtres latéraux */}
            <aside className="lg:col-span-1">
              <Card className="p-6 sticky top-24 border-gold/20 bg-gradient-to-br from-card to-earth/5 shadow-lg">
                <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  Filtres
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Prix</label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="border-gold/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les prix</SelectItem>
                        <SelectItem value="free">Gratuit uniquement</SelectItem>
                        <SelectItem value="paid">Payant uniquement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de document</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="border-gold/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
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

                  {(priceFilter !== "all" || typeFilter !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceFilter("all");
                        setTypeFilter("all");
                      }}
                      className="w-full border-gold/30 hover:bg-gold/10"
                    >
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </Card>
            </aside>

            {/* Liste des documents */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} dans cette catégorie
                </p>
              </div>

              {filteredDocuments.length === 0 ? (
                <Card className="p-12 text-center border-gold/20 bg-gradient-to-br from-card to-earth/5">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Aucun document trouvé</h3>
                  <p className="text-muted-foreground mb-6">
                    Aucun document ne correspond à vos critères de recherche.
                  </p>
                  <Button
                    onClick={() => {
                      setPriceFilter("all");
                      setTypeFilter("all");
                    }}
                    className="bg-gradient-to-r from-earth to-gold"
                  >
                    Réinitialiser les filtres
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredDocuments.map((doc) => (
                    <Link key={doc.id} href={`/documents/${doc.slug}`}>
                      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-gold/20 bg-gradient-to-br from-card to-gold/5 hover:border-gold/40 hover:scale-[1.02]">
                        {/* Image de couverture */}
                        <div className="relative h-48 bg-gradient-to-br from-earth/20 to-gold/20 overflow-hidden">
                          {doc.cover_image_url ? (
                            <img
                              src={doc.cover_image_url}
                              alt={doc.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-gold/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          
                          {/* Badge prix */}
                          <div className="absolute top-3 right-3">
                            {Number(doc.price) === 0 ? (
                              <Badge className="bg-forest/90 text-white backdrop-blur-sm shadow-lg">
                                Gratuit
                              </Badge>
                            ) : (
                              <Badge className="bg-gold/90 text-white backdrop-blur-sm shadow-lg">
                                {Number(doc.price).toLocaleString()} {doc.currency}
                              </Badge>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="absolute bottom-3 left-3 flex gap-3 text-white text-sm">
                            <span className="flex items-center gap-1 backdrop-blur-sm bg-black/30 px-2 py-1 rounded">
                              <BookOpen className="h-3 w-3" />
                              {doc.view_count || 0}
                            </span>
                          </div>
                        </div>

                        {/* Contenu */}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="border-gold/30 text-gold text-xs capitalize">
                              {doc.document_type}
                            </Badge>
                            {doc.is_certified && (
                              <Badge variant="outline" className="border-forest/30 text-forest text-xs">
                                ✓ Certifié
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-2 group-hover:text-gold transition-colors line-clamp-2">
                            {doc.title}
                          </h3>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {doc.description}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{doc.profiles?.full_name || "Auteur anonyme"}</span>
                          </div>

                          {doc.keywords && doc.keywords.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gold/10">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <div className="flex flex-wrap gap-1">
                                {doc.keywords.slice(0, 3).map((keyword, i) => (
                                  <span key={i} className="text-xs text-muted-foreground">
                                    {keyword}{i < Math.min(doc.keywords!.length, 3) - 1 ? ',' : ''}
                                  </span>
                                ))}
                                {doc.keywords.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{doc.keywords.length - 3}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}