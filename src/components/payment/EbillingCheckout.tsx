import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initiateDocumentCheckout } from "@/services/ebillingService";
import { Loader2, Smartphone, ShieldCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EbillingCheckoutProps {
  documentId: string;
  documentSlug: string;
  documentTitle: string;
  amount: number;
  description?: string;
  userId?: string;
  clientInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function EbillingCheckout({
  documentId,
  documentSlug,
  documentTitle,
  amount,
  description,
  userId,
  clientInfo,
  onSuccess,
  onError
}: EbillingCheckoutProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: clientInfo?.name || "",
    email: clientInfo?.email || "",
    phone: clientInfo?.phone || "",
    address: "Libreville, Gabon"
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log("🔐 Vérification authentification...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log("Session:", {
        exists: !!session,
        user_id: session?.user?.id || "NULL",
        email: session?.user?.email || "NULL",
        error: error?.message || "NONE"
      });

      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        
        // Pré-remplir avec les données utilisateur
        setFormData({
          name: session.user.user_metadata?.full_name || clientInfo?.name || "",
          email: session.user.email || clientInfo?.email || "",
          phone: session.user.user_metadata?.phone || clientInfo?.phone || "",
          address: "Libreville, Gabon"
        });
        
        console.log("✅ Utilisateur authentifié:", session.user.id);
      } else {
        setIsAuthenticated(false);
        console.log("❌ Aucune session active");
      }
    } catch (error) {
      console.error("Erreur vérification auth:", error);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    console.log("\n═══════════════════════════════════════");
    console.log("🚀 DÉBUT PROCESSUS PAIEMENT");
    console.log("═══════════════════════════════════════");

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Validation numéro Gabon (06 ou 07)
    const phoneRegex = /^0[67]\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Numéro invalide",
        description: "Le numéro doit commencer par 06 ou 07 et contenir 9 chiffres.",
        variant: "destructive"
      });
      return;
    }

    // Double vérification de l'authentification
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log("📊 ÉTAT AUTHENTIFICATION:");
    console.log("  - Session active:", !!session);
    console.log("  - User ID:", session?.user?.id || "NULL");
    console.log("  - Email:", session?.user?.email || "NULL");
    console.log("  - Token présent:", !!session?.access_token);

    if (!session?.user) {
      console.error("❌ ALERTE: Pas de session lors du paiement!");
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter avant d'effectuer un achat.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Données envoyées à l'API:");
      console.log({
        document_id: documentId,
        amount,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        user_authenticated: true,
        user_id: session.user.id
      });

      // Appel API checkout
      const response = await initiateDocumentCheckout({
        document_id: documentId,
        amount,
        short_description: description || `Achat: ${documentTitle}`,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        client_address: formData.address,
        document_slug: documentSlug,
        document_title: documentTitle
      });

      console.log("✅ Checkout response:", response);

      // Créer formulaire POST pour redirection vers eBilling
      const form = document.createElement("form");
      form.method = "POST";
      form.action = response.redirectUrl;

      const invoiceField = document.createElement("input");
      invoiceField.type = "hidden";
      invoiceField.name = "invoice_number";
      invoiceField.value = response.billId;
      form.appendChild(invoiceField);

      const redirectField = document.createElement("input");
      redirectField.type = "hidden";
      redirectField.name = "merchant_redirect_url";
      redirectField.value = response.successUrl;
      form.appendChild(redirectField);

      document.body.appendChild(form);
      
      console.log("🔄 Redirection vers eBilling...");
      form.submit();

      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("❌ ERREUR PAIEMENT:", error);
      
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible d'initialiser le paiement. Veuillez réessayer.",
        variant: "destructive"
      });
      
      setLoading(false);
      if (onError) onError(error);
    }
  };

  if (checkingAuth) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600">Vérification de l'authentification...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Session expirée</strong>
              <p className="mt-2">Veuillez vous reconnecter pour effectuer un achat.</p>
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full mt-4" 
            onClick={() => window.location.href = "/auth/connexion"}
          >
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Paiement Mobile Money
        </CardTitle>
        <CardDescription>
          Airtel Money et Moov Money via eBilling
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Info */}
        <Alert className="bg-green-50 border-green-200">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Connecté en tant que <strong>{currentUser?.email}</strong>
          </AlertDescription>
        </Alert>

        {/* Document Info */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <div className="text-sm text-slate-600">Document</div>
          <div className="font-semibold text-slate-900">{documentTitle}</div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-slate-600">Montant à payer</span>
            <span className="text-2xl font-bold text-blue-600">
              {amount.toLocaleString()} FCFA
            </span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro Mobile Money *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="074123456 ou 066123456"
              required
            />
            <p className="text-xs text-muted-foreground">
              Numéro Airtel Money ou Moov Money (06 ou 07)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (pour le reçu) *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jean@exemple.com"
              required
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirection vers eBilling...
            </>
          ) : (
            `Payer ${amount.toLocaleString()} FCFA`
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-3 h-3" />
          Paiement sécurisé par eBilling Gabon
        </div>
      </CardFooter>
    </Card>
  );
}