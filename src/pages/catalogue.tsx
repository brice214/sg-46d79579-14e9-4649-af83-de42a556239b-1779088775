import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Filter, BookOpen, User, Tag } from "lucide-react";
import { documentService } from "@/services/documentService";
import { categoryService } from "@/services/categoryService";
import type { Database } from "@/integrations/supabase/types";

type Document = Database["public"]["Tables"]["documents"]["Row"] & {
  profiles?: { full_name: string | null } | null;
  categories?: { name: string } | null;
};

type Category = Database["public"]["Tables"]["categories"]["Row"];

export default function Catalogue() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, catsData] = await Promise.all([
        documentService.getPublishedDocuments(),
        categoryService.getAllCategories()
      ]);
      setDocuments(docsData);
      setCategories(catsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category_id === selectedCategory;
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && Number(doc.price) === 0) ||
                        (priceFilter === "paid" && Number(doc.price) > 0);
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-earth/5 via-background to-gold/5">
      <Header />

      {/* Hero Section avec background */}
      <section className="relative py-16 overflow-hidden border-b border-gold/20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Catalogue de documents
            </h1>
            <p className="text-lg text-gray-200 drop-shadow-md">
              Découvrez {documents.length} documents publiés par des auteurs africains
            </p>

            {/* Barre de recherche */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher un document, un auteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-gold/30 bg-white/95 backdrop-blur-sm shadow-xl focus:border-gold"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-12">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filtres latéraux */}
            <aside className="lg:col-span-1">
              <Card className="p-6 sticky top-24 border-gold/20 bg-gradient-to-br from-card to-earth/5 shadow-lg">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gold/20">
                  <Filter className="h-5 w-5 text-gold" />
                  <h2 className="font-semibold text-lg">Filtres</h2>
                </div>

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
                    <label className="text-sm font-medium mb-2 block">Catégorie</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="border-gold/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
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

                  {(searchTerm || selectedCategory !== "all" || priceFilter !== "all" || typeFilter !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setPriceFilter("all");
                        setTypeFilter("all");
                      }}
                      className="w-full border-gold/30 hover:bg-gold/10"
                    >
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              </Card>
            </aside>

            {/* Liste des documents */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} trouvé{filteredDocuments.length > 1 ? 's' : ''}
                </p>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-6 animate-pulse border-gold/10 bg-gradient-to-br from-card to-gold/5">
                      <div className="h-48 bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </Card>
                  ))}
                </div>
              ) : filteredDocuments.length === 0 ? (
                <Card className="p-12 text-center border-gold/20 bg-gradient-to-br from-card to-earth/5">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Aucun document trouvé</h3>
                  <p className="text-muted-foreground mb-6">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setPriceFilter("all");
                      setTypeFilter("all");
                    }}
                    className="bg-gradient-to-r from-earth to-gold hover:opacity-90"
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
                            {doc.categories && (
                              <Badge variant="outline" className="border-earth/30 text-earth text-xs">
                                {doc.categories.name}
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-gold/30 text-gold text-xs capitalize">
                              {doc.document_type}
                            </Badge>
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