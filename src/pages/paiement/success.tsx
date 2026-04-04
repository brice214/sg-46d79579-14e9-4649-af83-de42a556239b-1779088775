import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle2, Download, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [documentInfo, setDocumentInfo] = useState<any>(null);

  useEffect(() => {
    const loadPurchaseInfo = async () => {
      try {
        // Récupérer le dernier achat de l'utilisateur (si connecté)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Requête simplifiée pour éviter l'erreur TypeScript
          const { data: purchases }: { data: any } = await supabase
            .from("purchases")
            .select(`*, documents(id, slug, title, price)`)
            .eq("user_id", user.id)
            .eq("payment_method", "ebilling")
            .order("created_at", { ascending: false })
            .limit(1);

          if (purchases && purchases.length > 0) {
            setDocumentInfo(purchases[0]);
          }
        }
      } catch (error) {
        console.error("Erreur chargement achat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchaseInfo();

    // Afficher toast de succès
    toast({
      title: "🎉 Paiement Réussi !",
      description: "Votre achat a été confirmé. Vous pouvez maintenant accéder au document.",
      duration: 5000
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          
          <CardTitle className="text-4xl font-bold text-green-900">
            Paiement Réussi !
          </CardTitle>
          
          <CardDescription className="text-lg">
            Votre transaction a été validée avec succès
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
            <p className="text-xl font-semibold text-green-900">
              ✓ Transaction confirmée
            </p>
            <p className="text-sm text-green-700 mt-2">
              Vous avez maintenant accès au document acheté
            </p>
          </div>

          {!isLoading && documentInfo && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Détails de votre achat
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Document</span>
                  <span className="font-semibold">{documentInfo.documents?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant payé</span>
                  <span className="font-semibold">{documentInfo.amount?.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode</span>
                  <span className="font-semibold">Mobile Money (eBilling)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmé
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {documentInfo?.documents?.slug && (
              <Button
                asChild
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Link href={`/documents/${documentInfo.documents.slug}`}>
                  <Download className="w-4 h-4 mr-2" />
                  Accéder au document
                </Link>
              </Button>
            )}
            
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Mon tableau de bord
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Un reçu de paiement a été envoyé à votre adresse email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}