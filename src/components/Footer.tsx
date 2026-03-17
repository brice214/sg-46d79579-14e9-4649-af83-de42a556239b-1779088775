import Link from "next/link";
import { BookOpen, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-earth via-gold to-forest flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">AfriLitt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme africaine de publication et de vente de documents numériques.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Explorer</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogue" className="text-muted-foreground hover:text-foreground transition-colors">Catalogue</Link></li>
              <li><Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">Catégories</Link></li>
              <li><Link href="/authors" className="text-muted-foreground hover:text-foreground transition-colors">Auteurs</Link></li>
              <li><Link href="/free" className="text-muted-foreground hover:text-foreground transition-colors">Documents gratuits</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Pour les auteurs</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/upload" className="text-muted-foreground hover:text-foreground transition-colors">Publier un document</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Mon tableau de bord</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Tarifs</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ Auteurs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Conditions d'utilisation</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/copyright" className="text-muted-foreground hover:text-foreground transition-colors">Droits d'auteur</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AfriLitt. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Afrique</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>contact@afrilitt.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}