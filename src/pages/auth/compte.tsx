import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"reader" | "author">("reader");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await authService.signUp(email, password, fullName, role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-cream via-white to-gold/5 py-12 px-4">
        <Card className="w-full max-w-md p-8 shadow-xl border-terre/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-noir mb-2">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez la communauté AfriLitt</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-noir mb-2">Nom complet</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="border-terre/20 focus:border-terre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-noir mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="border-terre/20 focus:border-terre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-noir mb-2">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-terre/20 focus:border-terre pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-noir"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-noir mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-terre/20 focus:border-terre pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-noir"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-noir mb-2">Type de compte</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("reader")}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    role === "reader"
                      ? "border-terre bg-terre/10 text-terre font-medium"
                      : "border-gray-200 hover:border-terre/30"
                  }`}
                >
                  <div className="text-2xl mb-1">👤</div>
                  <div className="text-sm">Lecteur</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("author")}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    role === "author"
                      ? "border-terre bg-terre/10 text-terre font-medium"
                      : "border-gray-200 hover:border-terre/30"
                  }`}
                >
                  <div className="text-2xl mb-1">✍️</div>
                  <div className="text-sm">Auteur</div>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-terre to-gold hover:from-terre/90 hover:to-gold/90 text-white"
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <a href="/auth/connexion" className="text-terre hover:text-terre/80 font-medium">
                Se connecter
              </a>
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}