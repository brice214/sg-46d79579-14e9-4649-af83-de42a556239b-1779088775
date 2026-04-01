import Link from "next/link";
import { BookOpen, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gold/20 bg-gradient-to-b from-background to-earth/10">
      {/* Motif décoratif */}
      <div className="absolute inset-0 bg-adinkra opacity-5"></div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16">
          {/* Colonne 1 : À propos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-earth via-gold to-forest flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-serif text-xl font-bold bg-gradient-to-r from-earth via-gold to-forest bg-clip-text text-transparent">
                AfriLitt
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La première plateforme africaine de publication et de monétisation du savoir. 
              Partagez vos connaissances, construisez votre audience, générez des revenus.
            </p>
            <div className="flex gap-3 pt-2">
              <Link href="#" className="h-9 w-9 rounded-full bg-earth/10 hover:bg-earth/20 flex items-center justify-center transition-colors group">
                <Facebook className="h-4 w-4 text-earth group-hover:scale-110 transition-transform" />
              </Link>
              <Link href="#" className="h-9 w-9 rounded-full bg-gold/10 hover:bg-gold/20 flex items-center justify-center transition-colors group">
                <Twitter className="h-4 w-4 text-gold group-hover:scale-110 transition-transform" />
              </Link>
              <Link href="#" className="h-9 w-9 rounded-full bg-forest/10 hover:bg-forest/20 flex items-center justify-center transition-colors group">
                <Linkedin className="h-4 w-4 text-forest group-hover:scale-110 transition-transform" />
              </Link>
              <Link href="#" className="h-9 w-9 rounded-full bg-earth/10 hover:bg-earth/20 flex items-center justify-center transition-colors group">
                <Instagram className="h-4 w-4 text-earth group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Colonne 2 : Liens rapides */}
          <div>
            <h3 className="font-semibold mb-4 text-gold">Plateforme</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/catalogue" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Publier un document
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Ressources */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-gold">À propos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/a-propos" 
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Notre histoire
                </Link>
              </li>
              <li>
                <Link 
                  href="/a-propos" 
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Notre mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-gold">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">contact@afrilitt.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Libreville, Gabon</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre du bas */}
        <div className="border-t border-gold/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} AfriLitt. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-gold transition-colors">
                Conditions d'utilisation
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-gold transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-gold transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}