import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { documentService } from "@/services/documentService";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface CategoryWithCount extends Category {
  documentCount: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const [categoriesData, documentsData] = await Promise.all([
        categoryService.getAllCategories(),
        documentService.getPublishedDocuments()
      ]);

      // Count documents per category
      const categoriesWithCounts = categoriesData.map(cat => {
        const count = documentsData.filter(doc => doc.category_id === cat.id).length;
        return { ...cat, documentCount: count };
      });

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping pour les catégories
  const getCategoryIcon = (name: string): string => {
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

  const getCategoryGradient = (index: number): string => {
    const gradients = [
      "from-earth/20 to-gold/20",
      "from-forest/20 to-earth/20",
      "from-gold/20 to-forest/20",
      "from-earth/20 to-forest/20",
      "from-gold/20 to-earth/20",
      "from-forest/20 to-gold/20",
      "from-earth/20 to-gold/20",
      "from-gold/20 to-forest/20"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-gold/20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 text-sm font-medium text-gold">
              <Sparkles className="h-4 w-4" />
              <span>Explorez par domaine</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              Catégories de documents
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
              Parcourez notre bibliothèque organisée par domaines de connaissance. 
              Chaque catégorie regroupe des documents soigneusement validés par notre équipe.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-gold drop-shadow-md">{categories.length}</div>
                <div className="text-sm text-gray-200">Catégories</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-gold drop-shadow-md">
                  {categories.reduce((sum, cat) => sum + cat.documentCount, 0)}
                </div>
                <div className="text-sm text-gray-200">Documents</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold text-gold drop-shadow-md">100%</div>
                <div className="text-sm text-gray-200">Africain</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <main className="flex-1 py-16 bg-gradient-to-b from-earth/5 via-background to-gold/5">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-8 animate-pulse border-gold/10">
                    <div className="h-20 w-20 bg-muted rounded-xl mb-6"></div>
                    <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <Card className={`group p-8 hover:shadow-2xl transition-all duration-300 border-border/40 bg-gradient-to-br ${getCategoryGradient(index)} backdrop-blur-sm hover:border-gold/40 hover:scale-105 h-full`}>
                      {/* Icon */}
                      <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-300">
                        {getCategoryIcon(category.name)}
                      </div>

                      {/* Name */}
                      <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-gold transition-colors">
                        {category.name}
                      </h3>

                      {/* Description */}
                      {category.description && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-semibold text-foreground">{category.documentCount}</span>
                          <span>document{category.documentCount > 1 ? 's' : ''}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gold group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {!loading && categories.length === 0 && (
              <Card className="p-12 text-center border-gold/20 bg-gradient-to-br from-card to-earth/5">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Aucune catégorie trouvée</h3>
                <p className="text-muted-foreground">
                  Les catégories seront bientôt disponibles.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}