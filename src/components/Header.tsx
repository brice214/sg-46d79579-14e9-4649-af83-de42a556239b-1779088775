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

const roleTranslations: Record<string, string> = {
  admin: "Administrateur",
  author: "Auteur",
  visitor: "Visiteur",
  user: "Utilisateur"
};

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("🚀 Header - useEffect déclenché");
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔔 Header - Auth state changed:", { event, user: session?.user?.email });
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
    console.log("🔍 Header - checkUser appelé");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("📧 Header - Session récupérée:", { 
      hasSession: !!session, 
      userEmail: session?.user?.email,
      userId: session?.user?.id 
    });
    setUser(session?.user ?? null);
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  };

  const loadProfile = async (userId: string) => {
    console.log("🔄 Header - loadProfile appelé pour userId:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    console.log("=" .repeat(80));
    console.log("🎯 HEADER - PROFILE CHARGÉ - DÉTAILS COMPLETS:");
    console.log("  → Email:", data?.email);
    console.log("  → Full Name:", data?.full_name);
    console.log("  → Role (brut):", data?.role);
    console.log("  → Role (type):", typeof data?.role);
    console.log("  → Role === 'admin':", data?.role === "admin");
    console.log("  → Error:", error);
    console.log("  → Data complète:", JSON.stringify(data, null, 2));
    console.log("=" .repeat(80));
    
    if (data) {
      setProfile(data);
      console.log("✅ Header - Profile stocké dans state:", data);
    } else {
      console.error("❌ Header - Erreur chargement profile:", error);
    }
  };

  const handleLogout = async () => {
    console.log("🚪 Header - Déconnexion...");
    await supabase.auth.signOut();
    router.push("/");
  };

  const getRoleLabel = (role: string | null | undefined): string => {
    if (!role) return "Visiteur";
    return roleTranslations[role] || "Utilisateur";
  };

  // LOG EN TEMPS RÉEL DE L'ÉTAT
  console.log("🖼️ Header - Render:", {
    hasUser: !!user,
    hasProfile: !!profile,
    profileRole: profile?.role,
    isAdmin: profile?.role === "admin",
    shouldShowAdminMenu: profile?.role === "admin"
  });

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
                      {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-gold/20">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name || "Utilisateur"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-gold font-medium mt-1">
                      {getRoleLabel(profile?.role)}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-gold/10" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* MENU ADMIN - CONDITION SIMPLE ET VISIBLE */}
                  {(() => {
                    const isAdmin = profile?.role === "admin";
                    console.log("🎨 Header - Render menu admin:", { 
                      profileRole: profile?.role, 
                      isAdmin,
                      willShowMenu: isAdmin 
                    });
                    
                    if (isAdmin) {
                      return (
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/admin" className="flex items-center text-gold font-medium">
                            <Settings className="mr-2 h-4 w-4" />
                            Administration
                          </Link>
                        </DropdownMenuItem>
                      );
                    }
                    return null;
                  })()}
                  
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