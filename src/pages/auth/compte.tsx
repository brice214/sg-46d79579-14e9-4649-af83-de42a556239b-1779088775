import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("visitor");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").update({ role: role }).eq("id", data.user.id);
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue.",
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
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-forest/60 to-black/80 backdrop-blur-sm"></div>
        </div>
        
        {/* Motifs décoratifs */}
        <div className="absolute inset-0 bg-adinkra opacity-10"></div>
        
        <Card className="w-full max-w-lg relative z-10 border-gold/30 shadow-2xl backdrop-blur-md bg-card/95">
          <CardHeader className="space-y-2 text-center border-b border-gold/20 pb-6">
            <CardTitle className="font-serif text-3xl text-transparent bg-clip-text bg-gradient-to-r from-earth via-gold to-forest">
              Créer un compte
            </CardTitle>
            <CardDescription className="text-base">
              Rejoignez la communauté AfriLitt
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Nom complet</Label>
                <Input
                  id="fullName"
                  placeholder="Ex: Amadou Hampâté Bâ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-border/50 focus:border-gold/50 transition-colors"
                />
              </div>
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
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-border/50 focus:border-gold/50 transition-colors"
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium">Type de compte</Label>
                <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="visitor" id="visitor" className="peer sr-only" />
                    <Label
                      htmlFor="visitor"
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover/50 backdrop-blur-sm p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-gold peer-data-[state=checked]:bg-gold/10 [&:has([data-state=checked])]:border-gold cursor-pointer transition-all"
                    >
                      <span className="font-semibold mb-1">Lecteur</span>
                      <span className="text-xs text-muted-foreground text-center">Découvrir et lire des documents</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="author" id="author" className="peer sr-only" />
                    <Label
                      htmlFor="author"
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover/50 backdrop-blur-sm p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-gold peer-data-[state=checked]:bg-gold/10 [&:has([data-state=checked])]:border-gold cursor-pointer transition-all"
                    >
                      <span className="font-semibold mb-1">Auteur</span>
                      <span className="text-xs text-muted-foreground text-center">Publier et vendre mes œuvres</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                En créant un compte, vous acceptez nos <Link href="/terms" className="text-gold hover:text-gold/80 transition-colors font-medium">conditions d'utilisation</Link>.
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-earth via-gold to-forest text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all" 
                disabled={loading}
              >
                {loading ? "Création..." : "Créer mon compte"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gold/20 p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/auth/connexion" className="text-gold hover:text-gold/80 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}