import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, ShoppingCart, Lock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PDFViewerProps {
  fileUrl: string;
  hasAccess: boolean;
  onPurchase?: () => void;
  documentTitle?: string;
}

export function PDFViewer({ fileUrl, hasAccess, onPurchase, documentTitle }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
  const pdfDocRef = useRef<any>(null);

  const maxPreviewPages = hasAccess ? undefined : 2;

  useEffect(() => {
    if (!fileUrl) {
      setError("URL du document non disponible");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import PDF.js dynamically
        const pdfjsLib = await import("pdfjs-dist");
        
        // Set worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setLoading(false);

        // Render first page
        await renderPage(pdf, 1);
      } catch (err) {
        console.error("Error loading PDF:", err);
        if (isMounted) {
          setError("Erreur lors du chargement du PDF");
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  useEffect(() => {
    if (pdfDocRef.current && currentPage) {
      renderPage(pdfDocRef.current, currentPage);
    }
  }, [currentPage, scale]);

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale * 1.5 });

      const canvas = canvasRefs.current[pageNum];
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (scale < 2.0) {
      setScale(scale + 0.25);
    }
  };

  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.25);
    }
  };

  const handleFullscreen = () => {
    window.open(fileUrl, "_blank");
  };

  const isPageLocked = !hasAccess && maxPreviewPages && currentPage > maxPreviewPages;

  if (!fileUrl) {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-terre/30 text-center">
        <p className="text-noir/60">URL du document non disponible</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-red-300 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-terre/30 text-center">
        <p className="text-noir/60">Chargement du document...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur rounded-lg p-3 shadow-sm border border-terre/20">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
            className="border-terre/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-noir px-2">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            variant="outline"
            size="sm"
            className="border-terre/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleZoomOut} disabled={scale <= 0.5} variant="outline" size="sm" className="border-terre/30">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-noir px-2">{Math.round(scale * 100)}%</span>
          <Button onClick={handleZoomIn} disabled={scale >= 2.0} variant="outline" size="sm" className="border-terre/30">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={handleFullscreen} variant="outline" size="sm" className="border-terre/30">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Badge */}
      {!hasAccess && maxPreviewPages && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-500 text-white">
              Aperçu Limité
            </Badge>
            <p className="text-sm text-amber-900">
              Les {maxPreviewPages} premières pages sont visibles. Achetez pour voir l'intégralité.
            </p>
          </div>
        </div>
      )}

      {/* PDF Canvas Container */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 shadow-lg overflow-auto max-h-[800px]">
        <div className="flex justify-center">
          <div className="relative inline-block">
            <canvas
              ref={(el) => {
                if (el) canvasRefs.current[currentPage] = el;
              }}
              className={`border-2 border-terre/20 shadow-xl rounded bg-white ${
                isPageLocked ? "blur-md" : ""
              }`}
            />

            {/* Locked Overlay */}
            {isPageLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-noir/40 backdrop-blur-sm rounded">
                <div className="text-center bg-white/95 rounded-xl p-8 shadow-2xl max-w-md mx-4">
                  <div className="bg-terre/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-10 w-10 text-terre" />
                  </div>
                  <h3 className="text-2xl font-bold text-noir mb-2">Contenu Protégé</h3>
                  <p className="text-noir/70 mb-6">
                    Vous avez atteint la fin de l'aperçu gratuit. Débloquez l'intégralité du document pour continuer.
                  </p>
                  {onPurchase && (
                    <Button
                      onClick={onPurchase}
                      className="w-full bg-gradient-to-r from-terre to-foret hover:from-terre/90 hover:to-foret/90 text-white font-bold shadow-lg"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Acheter maintenant
                    </Button>
                  )}
                  <p className="text-xs text-noir/60 mt-4">
                    • Accès illimité au document complet
                    <br />• Téléchargement PDF haute qualité
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
      {hasAccess && (
        <div className="flex justify-center">
          <Button
            onClick={handleFullscreen}
            className="bg-gradient-to-r from-terre to-foret hover:from-terre/90 hover:to-foret/90 text-white font-bold shadow-lg"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Télécharger le PDF
          </Button>
        </div>
      )}
    </div>
  );
}