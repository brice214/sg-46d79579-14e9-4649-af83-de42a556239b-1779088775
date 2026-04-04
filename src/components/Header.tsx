import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Upload, LayoutDashboard, LogOut, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      loadProfile(session.user.id);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold/20 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-earth via-gold to-forest flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="font-serif text-2xl font-bold bg-gradient-to-r from-earth via-gold to-forest bg-clip-text text-transparent">
            AfriLitt
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/catalogue" className="text-sm font-medium hover:text-gold transition-colors">
            Catalogue
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-gold transition-colors">
            Catégories
          </Link>
          <Link 
            href="/a-propos" 
            className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors"
          >
            À propos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {profile?.role === "author" && (
                <Button asChild variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10 hover:border-gold">
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Publier
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-gold/10">
                    <Avatar className="h-8 w-8 border-2 border-gold/30">
                      <AvatarFallback className="bg-gradient-to-br from-earth to-gold text-white text-xs font-semibold">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-gold/20">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name || "Utilisateur"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-gold capitalize mt-1">{profile?.role || "visitor"}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-gold/10" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === "admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin" className="flex items-center text-gold">
                        <Settings className="mr-2 h-4 w-4" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gold/10" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/connexion">Connexion</Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/auth/compte">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}