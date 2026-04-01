import { Button } from "@/components/ui/button";
import { Download, Maximize2, Lock, ShoppingCart } from "lucide-react";

interface PDFViewerProps {
  fileUrl: string;
  hasAccess: boolean;
  onPurchase?: () => void;
  documentTitle?: string;
}

export function PDFViewer({ fileUrl, hasAccess, onPurchase, documentTitle }: PDFViewerProps) {
  const handleFullscreen = () => {
    window.open(fileUrl, "_blank");
  };

  if (!hasAccess) {
    // Show preview/purchase prompt for paid documents without access
    return (
      <div className="relative w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-terre/20 overflow-hidden">
        <div className="flex flex-col items-center justify-center p-12 space-y-6 min-h-[600px]">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-8 shadow-lg">
            <Lock className="h-16 w-16 text-terre" />
          </div>
          
          <h3 className="text-2xl font-bold text-noir text-center">
            Document Payant
          </h3>
          
          <p className="text-noir/70 text-center max-w-md">
            Ce document est protégé. Achetez-le pour accéder à l'intégralité du contenu et le télécharger.
          </p>

          <div className="bg-white/90 backdrop-blur rounded-lg p-6 border-2 border-terre/20 max-w-sm">
            <h4 className="font-semibold text-noir mb-3 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-terre" />
              Ce que vous obtenez :
            </h4>
            <ul className="space-y-2 text-sm text-noir/80">
              <li className="flex items-center gap-2">
                <span className="text-terre">✓</span>
                Accès illimité au document complet
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terre">✓</span>
                Téléchargement PDF haute qualité
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terre">✓</span>
                Accès à vie depuis votre compte
              </li>
              <li className="flex items-center gap-2">
                <span className="text-terre">✓</span>
                Support de l'auteur
              </li>
            </ul>
          </div>

          {onPurchase && (
            <Button 
              onClick={onPurchase}
              size="lg"
              className="bg-gradient-to-r from-terre to-orange-600 hover:from-terre/90 hover:to-orange-600/90 text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Acheter maintenant
            </Button>
          )}

          <p className="text-xs text-noir/50 text-center max-w-xs">
            Paiement sécurisé • Accès immédiat après achat • Satisfaction garantie
          </p>
        </div>
      </div>
    );
  }

  // Show full document for users with access
  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-4 p-3 bg-white/80 backdrop-blur rounded-lg border border-terre/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-noir">
            {documentTitle || "Document PDF"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleFullscreen}
            variant="outline"
            size="sm"
            className="border-terre/30 hover:bg-terre/10"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full bg-white rounded-lg border-2 border-terre/20 overflow-hidden shadow-xl">
        <iframe
          src={fileUrl}
          className="w-full h-[800px]"
          title="Document PDF"
          style={{ border: "none" }}
        />
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Vous avez accès complet à ce document. Utilisez le bouton de téléchargement ci-dessous pour le sauvegarder.
        </p>
      </div>
    </div>
  );
}