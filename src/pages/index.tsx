import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Upload, TrendingUp, Shield, Globe, Users, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-adinkra opacity-5"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>La bibliothèque numérique africaine</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Publiez et monétisez
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-earth via-gold to-forest">
                votre savoir africain
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AfriLitt est la première plateforme dédiée aux enseignants, chercheurs, écrivains et penseurs africains. 
              Partagez vos documents, construisez votre audience, générez des revenus.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-earth to-gold hover:opacity-90 text-white">
                <Link href="/auth/register">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/catalogue">
                  Explorer le catalogue
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">5K+</div>
                <div className="text-sm text-muted-foreground">Auteurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Lecteurs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
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
            <Card className="p-8 hover:shadow-lg transition-shadow border-border/40">
              <div className="h-14 w-14 rounded-xl bg-earth/10 flex items-center justify-center mb-6">
                <Upload className="h-7 w-7 text-earth" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Publication simplifiée</h3>
              <p className="text-muted-foreground">
                Uploadez vos PDF en quelques clics. Fixez votre prix ou proposez gratuitement. 
                Vous gardez le contrôle total sur vos œuvres.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-border/40">
              <div className="h-14 w-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Monétisation équitable</h3>
              <p className="text-muted-foreground">
                Recevez jusqu'à 85% des revenus générés. Paiements via Mobile Money et carte bancaire. 
                Transparence totale sur vos ventes.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-border/40">
              <div className="h-14 w-14 rounded-xl bg-forest/10 flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-forest" />
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

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Trois étapes simples pour commencer à partager votre savoir
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-earth to-gold flex items-center justify-center text-white font-bold text-2xl mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Créez votre compte</h3>
              <p className="text-muted-foreground">
                Inscription gratuite en 2 minutes. Complétez votre profil d'auteur.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gold to-forest flex items-center justify-center text-white font-bold text-2xl mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Publiez vos documents</h3>
              <p className="text-muted-foreground">
                Uploadez vos PDF, ajoutez descriptions et métadonnées. Fixez votre prix.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-forest to-earth flex items-center justify-center text-white font-bold text-2xl mx-auto">
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

      {/* Categories Preview */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Explorez par catégorie
            </h2>
            <p className="text-lg text-muted-foreground">
              Des milliers de documents dans tous les domaines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Littérature", icon: "📚", count: "2.5K" },
              { name: "Sciences", icon: "🔬", count: "1.8K" },
              { name: "Histoire", icon: "📜", count: "1.2K" },
              { name: "Philosophie", icon: "💭", count: "950" },
              { name: "Économie", icon: "📊", count: "1.1K" },
              { name: "Éducation", icon: "🎓", count: "2.2K" },
              { name: "Arts", icon: "🎨", count: "850" },
              { name: "Droit", icon: "⚖️", count: "720" }
            ].map((cat) => (
              <Link 
                key={cat.name}
                href={`/categories/${cat.name.toLowerCase()}`}
                className="p-6 rounded-xl border border-border/40 hover:border-gold/40 hover:shadow-lg transition-all text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div className="font-semibold mb-1">{cat.name}</div>
                <div className="text-sm text-muted-foreground">{cat.count} docs</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/categories">
                Voir toutes les catégories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-earth/5 via-gold/5 to-forest/5"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              Prêt à partager votre savoir ?
            </h2>
            <p className="text-xl text-muted-foreground">
              Rejoignez des milliers d'auteurs africains qui ont choisi AfriLitt pour valoriser leur travail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-earth to-gold hover:opacity-90 text-white">
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