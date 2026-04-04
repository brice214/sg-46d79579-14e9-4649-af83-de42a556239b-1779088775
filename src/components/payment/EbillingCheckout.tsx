import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initiateDocumentCheckout } from "@/services/ebillingService";
import { Loader2, Smartphone, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EbillingCheckoutProps {
  documentId: string;
  documentSlug: string;
  documentTitle: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function EbillingCheckout({
  documentId,
  documentSlug,
  documentTitle,
  amount,
  onSuccess,
  onError
}: EbillingCheckoutProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "Libreville, Gabon"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Validation du numéro de téléphone (format Gabon)
    const phoneRegex = /^0[67]\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Numéro invalide",
        description: "Le numéro doit commencer par 06 ou 07 et contenir 9 chiffres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Appel API checkout
      const response = await initiateDocumentCheckout({
        document_id: documentId,
        amount,
        short_description: `Achat: ${documentTitle}`,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        client_address: formData.address,
        document_slug: documentSlug,
        document_title: documentTitle
      });

      console.log("✅ Checkout initié:", response);

      // 2. Créer formulaire invisible pour redirection POST
      const form = document.createElement("form");
      form.method = "POST";
      form.action = response.redirectUrl;

      const invoiceField = document.createElement("input");
      invoiceField.type = "hidden";
      invoiceField.name = "invoice_number";
      invoiceField.value = response.billId;
      form.appendChild(invoiceField);

      document.body.appendChild(form);
      
      // 3. Soumettre le formulaire (redirection automatique vers eBilling)
      form.submit();

      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("❌ Erreur paiement:", error);
      
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible d'initialiser le paiement. Veuillez réessayer.",
        variant: "destructive"
      });
      
      setLoading(false);
      if (onError) onError(error);
    }
  };

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