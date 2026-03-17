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
        <div className="absolute inset-0 pattern-adinkra opacity-5"></div>
        <Card className="w-full max-w-lg relative z-10 border-border/50 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-serif text-3xl">Créer un compte</CardTitle>
            <CardDescription>
              Rejoignez la communauté AfriLitt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  placeholder="Ex: Amadou Hampâté Bâ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <Label>Type de compte</Label>
                <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="visitor" id="visitor" className="peer sr-only" />
                    <Label
                      htmlFor="visitor"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-earth [&:has([data-state=checked])]:border-earth cursor-pointer"
                    >
                      <span className="font-semibold mb-1">Lecteur</span>
                      <span className="text-xs text-muted-foreground text-center">Découvrir et lire des documents</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="author" id="author" className="peer sr-only" />
                    <Label
                      htmlFor="author"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-earth [&:has([data-state=checked])]:border-earth cursor-pointer"
                    >
                      <span className="font-semibold mb-1">Auteur</span>
                      <span className="text-xs text-muted-foreground text-center">Publier et vendre mes œuvres</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                En créant un compte, vous acceptez nos <Link href="/terms" className="text-earth hover:text-gold transition-colors">conditions d'utilisation</Link>.
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-earth to-gold text-white hover:opacity-90" disabled={loading}>
                {loading ? "Création..." : "Créer mon compte"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/40 p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-earth hover:text-gold font-medium transition-colors">
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