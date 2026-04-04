import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const [featuredDocuments, setFeaturedDocuments] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    documents: 150,
    authors: 45,
    categories: 12,
    downloads: 2500
  });

  useEffect(() => {
    loadBanners();
    loadFeaturedDocuments();
    loadStats();
    loadCategoriesWithCounts();
  }, []);

  const loadStats = async () => {
    try {
      const [
        { count: documentsCount },
        { count: authorsCount },
        { count: categoriesCount },
        { count: downloadsCount }
      ] = await Promise.all([
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("is_published", true).eq("is_approved", true) as any,
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "author") as any,
        supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true) as any,
        supabase.from("purchases").select("id", { count: "exact", head: true }) as any
      ]);

      setStats({
        documents: documentsCount || 0,
        authors: authorsCount || 0,
        categories: categoriesCount || 0,
        downloads: downloadsCount || 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadBanners = async () => {
  };

  const loadFeaturedDocuments = async () => {
    try {
      const { data: documents } = (await supabase
        .from("documents")
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            icon,
            description
          ),
          profiles (
            full_name
          )
        `)
        .eq("is_featured", true)
        .eq("is_published", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6)) as any;

      setFeaturedDocuments(documents || []);
    } catch (error) {
      console.error("Error loading featured documents:", error);
    }
  };

  const loadCategoriesWithCounts = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name, slug, icon, description, is_active")
        .eq("is_active", true)
        .order("name");

      if (!categoriesData) return;

      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          const { count } = await supabase
            .from("documents")
            .select("id", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("is_published", true)
            .eq("is_approved", true);

          return {
            ...category,
            document_count: count || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const renderCategoryIcon = (iconName: string) => {
    if (!iconName) return <span className="text-2xl">📚</span>;
    
    // Si c'est un emoji (longueur courte ou contient des caractères emoji)
    if (iconName.length <= 4 || /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(iconName)) {
      return <span className="text-2xl">{iconName}</span>;
    }
    
    // Si c'est un nom d'icône Lucide
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-6 w-6 text-terre" />;
    }
    
    return <span className="text-2xl">📚</span>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background"></div>
        </div>

        <div className="container relative z-10 text-center py-20 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 mb-6">
            <Icons.Sparkles className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-gold">La bibliothèque numérique africaine</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
            Publiez. Partagez. <br />
            <span className="bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent">
              Monétisez votre savoir
            </span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 drop-shadow-lg leading-relaxed">
            AfriLitt est la première plateforme africaine dédiée à la publication et la vente de documents numériques par des auteurs, chercheurs et penseurs africains.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-earth to-gold hover:from-earth/90 hover:to-gold/90 text-white shadow-2xl hover:shadow-gold/20 hover:scale-105 transition-all border-none text-lg px-8">
              <Link href="/catalogue">
                <Icons.BookOpen className="h-5 w-5 mr-2" />
                Explorer le catalogue
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-xl text-lg px-8">
              <Link href="/auth/register">
                <Icons.TrendingUp className="h-5 w-5 mr-2" />
                Commencer à publier
              </Link>
            </Button>
          </div>

          {/* Stats cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Icons.Users className="h-6 w-6 text-gold" />
                <div className="text-3xl font-bold text-white">{stats.authors}+</div>
              </div>
              <p className="text-white/80 text-sm">Auteurs africains</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Icons.FileText className="h-6 w-6 text-gold" />
                <div className="text-3xl font-bold text-white">{stats.documents}+</div>
              </div>
              <p className="text-white/80 text-sm">Documents publiés</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Icons.Award className="h-6 w-6 text-gold" />
                <div className="text-3xl font-bold text-white">100%</div>
              </div>
              <p className="text-white/80 text-sm">Contenu africain</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-background via-earth/5 to-background">
        <div className="container max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/30">
              9 domaines de savoir
            </Badge>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-earth via-foreground to-gold bg-clip-text text-transparent">
              Explorez par catégorie
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez une richesse de connaissances à travers nos catégories soigneusement organisées
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.slice(0, 9).map((category) => (
              <Card 
                key={category.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-terre/20 hover:border-terre/40 overflow-hidden"
                onClick={() => window.location.href = `/categories/${category.slug}`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-terre/10">
                      {renderCategoryIcon(category.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-noir group-hover:text-terre transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.document_count} document{category.document_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-gold/30 hover:bg-gold/10 hover:border-gold/50">
              <Link href="/categories">
                Voir toutes les catégories
                <Icons.ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-gradient-to-b from-background to-earth/5">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-forest/20 text-forest border-forest/30 hover:bg-forest/30">
              Simple et efficace
            </Badge>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Publiez et monétisez vos travaux en quelques étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-gold/20 bg-gradient-to-br from-card to-card/80 hover:border-gold/40 hover:shadow-xl transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-earth to-gold flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <CardTitle className="font-serif text-2xl">Créez votre compte</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Inscrivez-vous gratuitement en tant qu'auteur pour commencer à publier vos documents.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-gold/20 bg-gradient-to-br from-card to-card/80 hover:border-gold/40 hover:shadow-xl transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <CardTitle className="font-serif text-2xl">Publiez vos documents</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Uploadez vos PDF, définissez votre prix et publiez instantanément sur la plateforme.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-gold/20 bg-gradient-to-br from-card to-card/80 hover:border-gold/40 hover:shadow-xl transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest to-green-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <CardTitle className="font-serif text-2xl">Gagnez de l'argent</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Recevez 85% des revenus générés par vos ventes. Suivez vos statistiques en temps réel.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/80"></div>
        </div>

        <div className="container max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 mb-6">
            <Icons.Shield className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-gold">Plateforme 100% sécurisée</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-xl">
            Rejoignez la communauté AfriLitt
          </h2>
          
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
            Des milliers d'auteurs africains publient et monétisent leur savoir. Pourquoi pas vous ?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90 text-black font-semibold shadow-2xl hover:shadow-gold/30 hover:scale-105 transition-all border-none text-lg px-10">
              <Link href="/auth/register">
                Commencer gratuitement
                <Icons.ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-xl text-lg px-10">
              <Link href="/catalogue">
                Découvrir le catalogue
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}