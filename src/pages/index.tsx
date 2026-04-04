import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, FileText, TrendingUp, ArrowRight, Sparkles, Award, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const [featuredDocuments, setFeaturedDocuments] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
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
  }, []);

  const loadStats = async () => {
    try {
      const [
        { count: documentsCount },
        { count: authorsCount },
        { count: categoriesCount },
        { count: downloadsCount }
      ] = await Promise.all([
        supabase.from("documents").select("*", { count: "exact", head: true }).eq("is_published", true).eq("is_approved", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "author"),
        supabase.from("categories").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("purchases").select("*", { count: "exact", head: true })
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
  };

  const categories = [
    { id: 1, name: "Littérature", slug: "litterature", icon: "📚", description: "Romans, nouvelles, poésie africaine", color: "from-amber-500/20 to-orange-600/20", iconBg: "bg-gradient-to-br from-amber-500 to-orange-600" },
    { id: 2, name: "Sciences", slug: "sciences", icon: "🔬", description: "Recherches scientifiques et techniques", color: "from-blue-500/20 to-cyan-600/20", iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600" },
    { id: 3, name: "Histoire", slug: "histoire", icon: "📜", description: "Histoire africaine et mondiale", color: "from-yellow-600/20 to-amber-700/20", iconBg: "bg-gradient-to-br from-yellow-600 to-amber-700" },
    { id: 4, name: "Philosophie", slug: "philosophie", icon: "💭", description: "Pensée et philosophie africaine", color: "from-purple-500/20 to-pink-600/20", iconBg: "bg-gradient-to-br from-purple-500 to-pink-600" },
    { id: 5, name: "Économie", slug: "economie", icon: "📊", description: "Économie et développement", color: "from-green-500/20 to-emerald-600/20", iconBg: "bg-gradient-to-br from-green-500 to-emerald-600" },
    { id: 6, name: "Éducation", slug: "education", icon: "🎓", description: "Manuels scolaires et pédagogie", color: "from-indigo-500/20 to-blue-600/20", iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600" },
    { id: 7, name: "Arts", slug: "arts", icon: "🎨", description: "Arts visuels, musique et culture", color: "from-pink-500/20 to-rose-600/20", iconBg: "bg-gradient-to-br from-pink-500 to-rose-600" },
    { id: 8, name: "Droit", slug: "droit", icon: "⚖️", description: "Droit et sciences juridiques", color: "from-slate-500/20 to-gray-600/20", iconBg: "bg-gradient-to-br from-slate-500 to-gray-600" },
    { id: 9, name: "Affaires", slug: "affaires", icon: "💼", description: "Entrepreneuriat et gestion d'entreprises", color: "from-earth/30 to-gold/30", iconBg: "bg-gradient-to-br from-earth to-gold" }
  ];

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
            <Sparkles className="h-4 w-4 text-gold" />
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
                <BookOpen className="h-5 w-5 mr-2" />
                Explorer le catalogue
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 shadow-xl text-lg px-8">
              <Link href="/auth/register">
                <TrendingUp className="h-5 w-5 mr-2" />
                Commencer à publier
              </Link>
            </Button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-terre mb-2">{stats.documents}+</div>
              <div className="text-sm md:text-base text-noir/70">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-terre mb-2">{stats.authors}+</div>
              <div className="text-sm md:text-base text-noir/70">Auteurs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-terre mb-2">{stats.categories}+</div>
              <div className="text-sm md:text-base text-noir/70">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-terre mb-2">{stats.downloads}+</div>
              <div className="text-sm md:text-base text-noir/70">Téléchargements</div>
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

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-gold/20 bg-gradient-to-br from-card via-card to-card/80 hover:border-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gold/20"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-earth/5 rounded-full blur-2xl group-hover:bg-earth/10 transition-colors"></div>

                <div className="relative p-6">
                  {/* Icon with gradient background */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${category.iconBg} shadow-lg mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <span className="text-3xl drop-shadow-lg">{category.icon}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl font-bold mb-2 group-hover:text-gold transition-colors">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Footer with arrow */}
                  <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                    <span className="text-xs font-medium text-muted-foreground">0 document</span>
                    <ArrowRight className="h-5 w-5 text-gold transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-gold/30 hover:bg-gold/10 hover:border-gold/50">
              <Link href="/categories">
                Voir toutes les catégories
                <ArrowRight className="h-4 w-4 ml-2" />
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
            <Shield className="h-4 w-4 text-gold" />
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
                <ArrowRight className="h-5 w-5 ml-2" />
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