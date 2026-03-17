import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Filter, BookOpen, Eye, Download } from "lucide-react";
import { documentService } from "@/services/documentService";
import { categoryService } from "@/services/categoryService";
import type { Database } from "@/integrations/supabase/types";

type Document = Database["public"]["Tables"]["documents"]["Row"] & {
  profiles: { id: string; full_name: string | null; avatar_url: string | null } | null;
  categories: { id: string; name: string; slug: string } | null;
};

type Category = Database["public"]["Tables"]["categories"]["Row"];

export default function Catalogue() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "price_asc" | "price_desc">("recent");

  useEffect(() => {
    loadData();
  }, [selectedCategory, priceFilter, sortBy, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, cats] = await Promise.all([
        documentService.getPublishedDocuments({
          category: selectedCategory || undefined,
          search: search || undefined,
          isFree: priceFilter === "free" ? true : priceFilter === "paid" ? false : undefined,
          sortBy
        }),
        categoryService.getAllCategories()
      ]);
      setDocuments(docs as Document[]);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading catalogue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Catalogue de documents
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explorez notre bibliothèque de documents académiques, littéraires et de recherche
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-5xl mx-auto mb-12">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre, auteur, mots-clés..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="bg-gradient-to-r from-earth to-gold text-white">
                  Rechercher
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les prix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les prix</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="paid">Payant</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="popular">Plus populaires</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-earth border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Chargement des documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun document trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border/40">
                    {doc.cover_image_url && (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={doc.cover_image_url}
                          alt={doc.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant={doc.price === 0 ? "secondary" : "default"} className="shrink-0">
                          {doc.price === 0 ? "Gratuit" : `${doc.price} ${doc.currency}`}
                        </Badge>
                        {doc.categories && (
                          <Badge variant="outline" className="text-xs">
                            {doc.categories.name}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg line-clamp-2">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <div className="h-8 w-8 rounded-full bg-earth/10 flex items-center justify-center mr-2">
                          {doc.profiles?.avatar_url ? (
                            <img src={doc.profiles.avatar_url} alt="" className="rounded-full" />
                          ) : (
                            <span className="text-earth font-semibold">
                              {doc.profiles?.full_name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                        <span className="truncate">{doc.profiles?.full_name || "Auteur anonyme"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{doc.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{doc.download_count}</span>
                        </div>
                        {doc.page_count && (
                          <span>{doc.page_count} pages</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}