import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Upload, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-earth via-gold to-forest flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold text-foreground group-hover:text-gold transition-colors">
              AfriLitt
            </span>
            <span className="text-xs text-muted-foreground">Bibliothèque Africaine</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/catalogue" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Catalogue
          </Link>
          <Link href="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Catégories
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            À propos
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {user ? (
            <>
              <Button asChild variant="outline" size="sm" className="hidden md:flex">
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Publier
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href="/dashboard">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-earth to-gold hover:opacity-90">
                <Link href="/auth/register">Inscription</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}