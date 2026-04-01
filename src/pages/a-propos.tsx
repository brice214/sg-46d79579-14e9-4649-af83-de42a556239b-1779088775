import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  Globe, 
  Target, 
  Heart, 
  Lightbulb,
  Shield,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: BookOpen,
      title: "Savoir Africain",
      description: "Valoriser et diffuser la richesse intellectuelle du continent africain à travers des publications authentiques et de qualité."
    },
    {
      icon: Shield,
      title: "Éthique & Légalité",
      description: "Garantir le respect des droits d'auteur et promouvoir une plateforme de publication légale et transparente."
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Créer un espace de partage et d'échange entre auteurs, chercheurs et lecteurs passionnés de culture africaine."
    },
    {
      icon: TrendingUp,
      title: "Monétisation Juste",
      description: "Permettre aux auteurs africains de vivre de leur plume en fixant eux-mêmes le prix de leur travail intellectuel."
    },
    {
      icon: Globe,
      title: "Rayonnement Global",
      description: "Diffuser la pensée africaine dans le monde entier et créer des ponts culturels entre les continents."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Utiliser les technologies modernes pour démocratiser l'accès au savoir et faciliter la publication numérique."
    }
  ];

  const stats = [
    { value: "9", label: "Catégories de savoir", icon: BookOpen },
    { value: "100%", label: "Contenu africain", icon: Globe },
    { value: "85%", label: "Revenus pour les auteurs", icon: Award },
    { value: "24/7", label: "Plateforme accessible", icon: CheckCircle2 }
  ];

  const mission = [
    {
      title: "Notre Mission",
      content: "AfriLitt est née d'un constat simple : le savoir africain mérite une plateforme dédiée, moderne et respectueuse. Notre mission est de créer la plus grande bibliothèque numérique africaine, où chaque auteur peut publier, monétiser et partager son travail en toute légalité.",
      gradient: "from-earth/20 to-gold/20"
    },
    {
      title: "Notre Vision",
      content: "Devenir la référence incontournable de la publication et de la diffusion du savoir africain dans le monde. Nous rêvons d'un écosystème où la pensée africaine rayonne, où les auteurs sont rémunérés équitablement, et où les lecteurs accèdent facilement à des contenus de qualité.",
      gradient: "from-gold/20 to-forest/20"
    },
    {
      title: "Notre Engagement",
      content: "Nous nous engageons à protéger les droits d'auteur, à promouvoir l'excellence intellectuelle africaine, et à créer un environnement numérique éthique et transparent. Chaque document publié est vérifié, chaque auteur est respecté, chaque lecteur est protégé.",
      gradient: "from-forest/20 to-earth/20"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-background"></div>
        </div>

        <div className="container max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 backdrop-blur-sm mb-6">
              <Heart className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">La fierté africaine digitale</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Nous sommes{" "}
              <span className="bg-gradient-to-r from-gold via-earth to-forest bg-clip-text text-transparent">
                AfriLitt
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gold/90 mb-8 leading-relaxed">
              La première plateforme africaine de publication et de vente de documents numériques. 
              <br className="hidden md:block" />
              Un espace où le savoir africain prend toute sa valeur.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-earth via-gold to-forest text-white hover:shadow-2xl hover:shadow-gold/30 hover:scale-105 transition-all border-none"
              >
                <Link href="/register">
                  Rejoindre la communauté
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-2 border-gold/30 bg-white/5 backdrop-blur-sm text-white hover:bg-gold/10 hover:border-gold/50"
              >
                <Link href="/catalogue">
                  Découvrir le catalogue
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-b from-background to-earth/5">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index}
                className="p-6 text-center border-2 border-gold/20 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm hover:border-gold/40 hover:shadow-xl transition-all"
              >
                <stat.icon className="h-8 w-8 text-gold mx-auto mb-3" />
                <div className="font-serif text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Engagement */}
      <section className="py-20 bg-gradient-to-b from-earth/5 to-gold/5">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Notre Raison d'Être
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AfriLitt n'est pas qu'une plateforme, c'est un mouvement culturel et intellectuel africain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mission.map((item, index) => (
              <Card 
                key={index}
                className={`p-8 border-2 border-gold/20 bg-gradient-to-br ${item.gradient} backdrop-blur-sm hover:border-gold/40 hover:shadow-2xl hover:scale-105 transition-all`}
              >
                <h3 className="font-serif text-2xl font-bold mb-4 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.content}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gold/5 to-forest/5">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">
              Nos Valeurs Fondamentales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Six piliers qui guident chaque décision et action sur AfriLitt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index}
                className="group p-6 border-2 border-gold/20 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/10 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-earth/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <value.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-foreground group-hover:text-gold transition-colors">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80"></div>
        </div>

        <div className="container max-w-4xl relative z-10 text-center">
          <Target className="h-16 w-16 text-gold mx-auto mb-6" />
          
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Faites Partie de l'Histoire
          </h2>
          
          <p className="text-xl text-gold/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Que vous soyez auteur, chercheur, enseignant ou lecteur passionné, 
            AfriLitt est votre plateforme. Rejoignez-nous et contribuez au rayonnement 
            du savoir africain dans le monde.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-earth via-gold to-forest text-white hover:shadow-2xl hover:shadow-gold/30 hover:scale-105 transition-all border-none text-lg px-8"
            >
              <Link href="/register">
                <Users className="mr-2 h-5 w-5" />
                Créer mon compte auteur
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="border-2 border-gold/30 bg-white/5 backdrop-blur-sm text-white hover:bg-gold/10 hover:border-gold/50 text-lg px-8"
            >
              <Link href="/catalogue">
                <BookOpen className="mr-2 h-5 w-5" />
                Explorer le catalogue
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}