import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Upload, TrendingUp, Shield, Globe, Users, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const categories = [
    { id: 1, name: "Littérature", icon: "📚", description: "Des romans, essais, poésie et plus encore." },
    { id: 2, name: "Sciences", icon: "🔬", description: "Médecine, physique, informatique et autres sciences." },
    { id: 3, name: "Histoire", icon: "📜", description: "Histoire africaine, mondiale et culturelle." },
    { id: 4, name: "Philosophie", icon: "💭", description: "Études philosophiques et réflexions sur la société." },
    { id: 5, name: "Économie", icon: "📊", description: "Économie, finance et gestion." },
    { id: 6, name: "Éducation", icon: "🎓", description: "Manuels scolaires, cours et ressources pédagogiques." },
    { id: 7, name: "Arts", icon: "🎨", description: "Peinture, musique, cinéma et autres arts." },
    { id: 8, name: "Droit", icon: "⚖️", description: "Droit international, droit africain et droit comparé." },
    { id: 9, name: "Technologie", icon: "💻", description: "Informatique, cyber-sécurité et nouvelles technologies." }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section avec background africain */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        {/* Background image avec overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 text-sm font-medium text-gold">
              <Sparkles className="h-4 w-4" />
              <span>La bibliothèque numérique africaine</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg">
              Publiez et monétisez
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-earth to-gold">
                votre savoir africain
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
              AfriLitt est la première plateforme dédiée aux enseignants, chercheurs, écrivains et penseurs africains. 
              Partagez vos documents, construisez votre audience, générez des revenus.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-earth to-gold hover:opacity-90 text-white shadow-2xl">
                <Link href="/auth/register">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link href="/catalogue">
                  Explorer le catalogue
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-gold drop-shadow-md">10K+</div>
                <div className="text-sm text-gray-200">Documents</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-gold drop-shadow-md">5K+</div>
                <div className="text-sm text-gray-200">Auteurs</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-gold drop-shadow-md">50K+</div>
                <div className="text-sm text-gray-200">Lecteurs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section avec fond coloré */}
      <section className="py-20 bg-gradient-to-b from-background via-earth/5 to-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Une plateforme pensée pour l'Afrique
            </h2>
            <p className="text-lg text-muted-foreground">
              Nous avons créé l'écosystème parfait pour valoriser la production intellectuelle africaine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-2xl transition-all border-border/40 bg-gradient-to-br from-card to-earth/5 hover:scale-105 duration-300">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-earth to-earth/50 flex items-center justify-center mb-6 shadow-lg">
                <Upload className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Publication simplifiée</h3>
              <p className="text-muted-foreground">
                Uploadez vos PDF en quelques clics. Fixez votre prix ou proposez gratuitement. 
                Vous gardez le contrôle total sur vos œuvres.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all border-border/40 bg-gradient-to-br from-card to-gold/5 hover:scale-105 duration-300">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gold to-gold/50 flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Monétisation équitable</h3>
              <p className="text-muted-foreground">
                Recevez jusqu'à 85% des revenus générés. Paiements via Mobile Money et carte bancaire. 
                Transparence totale sur vos ventes.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all border-border/40 bg-gradient-to-br from-card to-forest/5 hover:scale-105 duration-300">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-forest to-forest/50 flex items-center justify-center mb-6 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Protection légale</h3>
              <p className="text-muted-foreground">
                Vos droits d'auteur sont protégés. Système de certification intégré. 
                Modération active contre le piratage.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works avec motifs */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-adinkra opacity-5"></div>
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Trois étapes simples pour commencer à partager votre savoir
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 group">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-earth to-gold flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold">Créez votre compte</h3>
              <p className="text-muted-foreground">
                Inscription gratuite en 2 minutes. Complétez votre profil d'auteur.
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gold to-forest flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-xl font-semibold">Publiez vos documents</h3>
              <p className="text-muted-foreground">
                Uploadez vos PDF, ajoutez descriptions et métadonnées. Fixez votre prix.
              </p>
            </div>

            <div className="text-center space-y-4 group">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-forest to-earth flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-xl font-semibold">Gagnez des revenus</h3>
              <p className="text-muted-foreground">
                Recevez des paiements à chaque vente. Suivez vos statistiques en temps réel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories avec fond dégradé */}
      <section className="py-20 bg-gradient-to-b from-background via-gold/5 to-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Explorez par catégorie
            </h2>
            <p className="text-lg text-muted-foreground">
              Des milliers de documents dans tous les domaines
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group p-6 rounded-xl border border-gold/20 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm hover:shadow-xl transition-all hover:scale-105 hover:border-gold/40"
              >
                <div className="text-4xl mb-3">{category.icon || "📚"}</div>
                <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-gold transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-gold/40 hover:bg-gold/10">
              <Link href="/categories">
                Voir toutes les catégories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section avec background */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-earth/10 via-gold/10 to-forest/10"></div>
        <div className="absolute inset-0 bg-adinkra opacity-5"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              Prêt à partager votre savoir ?
            </h2>
            <p className="text-xl text-muted-foreground">
              Rejoignez des milliers d'auteurs africains qui ont choisi AfriLitt pour valoriser leur travail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-earth to-gold hover:opacity-90 text-white shadow-xl">
                <Link href="/auth/register">
                  Créer mon compte auteur
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}