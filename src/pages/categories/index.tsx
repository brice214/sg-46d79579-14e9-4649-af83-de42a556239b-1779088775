import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { documentService } from "@/services/documentService";
import type { Database } from "@/integrations/supabase/types";
import type { Category } from "@/services/categoryService";

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
      "Droit": "⚖️",
      "Affaires": "💼"
    };
    return iconMap[name] || "📖";
  };

  const getCategoryGradient = (index: number): string => {
    const gradients = [
      "from-amber-500/20 to-orange-600/20",
      "from-blue-500/20 to-cyan-600/20",
      "from-yellow-600/20 to-amber-700/20",
      "from-purple-500/20 to-pink-600/20",
      "from-green-500/20 to-emerald-600/20",
      "from-indigo-500/20 to-blue-600/20",
      "from-pink-500/20 to-rose-600/20",
      "from-slate-500/20 to-gray-600/20",
      "from-earth/30 to-gold/30"
    ];
    return gradients[index % gradients.length];
  };

  const getIconBg = (index: number): string => {
    const backgrounds = [
      "bg-gradient-to-br from-amber-500 to-orange-600",
      "bg-gradient-to-br from-blue-500 to-cyan-600",
      "bg-gradient-to-br from-yellow-600 to-amber-700",
      "bg-gradient-to-br from-purple-500 to-pink-600",
      "bg-gradient-to-br from-green-500 to-emerald-600",
      "bg-gradient-to-br from-indigo-500 to-blue-600",
      "bg-gradient-to-br from-pink-500 to-rose-600",
      "bg-gradient-to-br from-slate-500 to-gray-600",
      "bg-gradient-to-br from-earth to-gold"
    ];
    return backgrounds[index % backgrounds.length];
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
              <div className="grid md:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group relative overflow-hidden rounded-2xl border-2 border-gold/20 bg-gradient-to-br from-card via-card to-card/80 hover:border-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gold/20"
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(index)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-earth/5 rounded-full blur-2xl group-hover:bg-earth/10 transition-colors"></div>

                    <div className="relative p-6">
                      {/* Icon with gradient background */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${getIconBg(index)} shadow-lg mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        <span className="text-3xl drop-shadow-lg">{getCategoryIcon(category.name)}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-2xl font-bold mb-2 group-hover:text-gold transition-colors">
                        {category.name}
                      </h3>

                      {/* Description */}
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {category.description}
                        </p>
                      )}

                      {/* Footer with arrow */}
                      <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-semibold text-foreground">{category.documentCount}</span>
                          <span>document{category.documentCount > 1 ? 's' : ''}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gold transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
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