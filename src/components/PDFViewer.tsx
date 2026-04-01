import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Configure PDF.js worker to use local file
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PDFViewerProps {
  fileUrl: string;
  hasAccess: boolean;
  onPurchase?: () => void;
  documentTitle: string;
}

export function PDFViewer({ fileUrl, hasAccess, onPurchase, documentTitle }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string>("");

  const maxFreePages = 2; // Number of free preview pages

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError("");
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setError("Erreur de chargement du PDF. Veuillez réessayer.");
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      if (newPage < 1) return 1;
      if (newPage > numPages) return numPages;
      return newPage;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const isPageLocked = !hasAccess && pageNumber > maxFreePages;

  if (!fileUrl) {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-terre/30 text-center">
        <p className="text-noir/60">URL du document non disponible</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-8 border-2 border-red-200 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-white/80 backdrop-blur p-3 rounded-lg border border-terre/20">
        <div className="flex items-center gap-2">
          <Button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            variant="outline"
            size="sm"
            className="border-terre/30 hover:bg-terre/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-noir px-2">
            Page {pageNumber} / {numPages || "..."}
          </span>
          <Button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            variant="outline"
            size="sm"
            className="border-terre/30 hover:bg-terre/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={zoomOut}
            variant="outline"
            size="sm"
            className="border-terre/30 hover:bg-terre/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-noir px-2">
            {Math.round(scale * 100)}%
          </span>
          <Button
            onClick={zoomIn}
            variant="outline"
            size="sm"
            className="border-terre/30 hover:bg-terre/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => window.open(fileUrl, "_blank")}
            variant="outline"
            size="sm"
            className="border-terre/30 hover:bg-terre/10"
            disabled={isPageLocked}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Badge */}
      {!hasAccess && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Aperçu Limité
          </Badge>
          <span className="text-sm text-amber-800 font-medium">
            Les {maxFreePages} premières pages sont visibles. Achetez pour voir l'intégralité.
          </span>
        </div>
      )}

      {/* PDF Viewer Container */}
      <div className="relative bg-white rounded-lg border-2 border-terre/20 overflow-hidden shadow-lg">
        <div className="pdf-viewer-container flex items-center justify-center p-4 bg-gray-100 min-h-[600px]">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terre"></div>
              </div>
            }
          >
            <div className="relative">
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terre"></div>
                  </div>
                }
              />
              
              {/* Locked Page Overlay */}
              {isPageLocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                  <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl border-2 border-terre">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-terre/10 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingCart className="h-8 w-8 text-terre" />
                      </div>
                      <h3 className="text-2xl font-bold text-noir">
                        Contenu Premium
                      </h3>
                      <p className="text-noir/70">
                        Vous avez consulté les {maxFreePages} premières pages gratuites.
                        <br />
                        Achetez maintenant pour accéder aux {numPages - maxFreePages} pages restantes.
                      </p>
                      {onPurchase && (
                        <Button
                          onClick={onPurchase}
                          className="w-full bg-terre hover:bg-terre/90 text-white font-bold text-lg py-6"
                          size="lg"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Acheter maintenant
                        </Button>
                      )}
                      <p className="text-sm text-noir/50">
                        Accès immédiat • Téléchargement illimité • Support de l'auteur
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Document>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-terre/20">
        <p className="text-sm text-noir/70 text-center">
          {hasAccess
            ? "Vous avez un accès complet à ce document. Utilisez les contrôles ci-dessus pour naviguer."
            : `Aperçu gratuit : ${maxFreePages} pages sur ${numPages} • Achetez pour débloquer l'intégralité du contenu`}
        </p>
      </div>
    </div>
  );
}