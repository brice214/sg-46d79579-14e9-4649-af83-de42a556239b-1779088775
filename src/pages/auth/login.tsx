import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } = await authService.signIn(email, password);
      
      // Get user role from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur AfriLitt !",
      });

      // Redirect based on role
      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects");
      toast({
        title: "Erreur de connexion",
        description: err.message || "Vérifiez vos identifiants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Background image avec overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-earth/60 to-black/80 backdrop-blur-sm"></div>
        </div>
        
        {/* Motifs décoratifs */}
        <div className="absolute inset-0 bg-adinkra opacity-10"></div>
        
        <Card className="w-full max-w-md relative z-10 border-gold/30 shadow-2xl backdrop-blur-md bg-card/95">
          <CardHeader className="space-y-2 text-center border-b border-gold/20 pb-6">
            <CardTitle className="font-serif text-3xl text-transparent bg-clip-text bg-gradient-to-r from-earth via-gold to-forest">
              Connexion
            </CardTitle>
            <CardDescription className="text-base">
              Accédez à votre compte AfriLitt
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border/50 focus:border-gold/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                  <Link href="#" className="text-sm text-gold hover:text-gold/80 transition-colors font-medium">
                    Oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-border/50 focus:border-gold/50 transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-earth via-gold to-forest text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all" 
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gold/20 p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-gold hover:text-gold/80 font-medium transition-colors">
                S'inscrire
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}