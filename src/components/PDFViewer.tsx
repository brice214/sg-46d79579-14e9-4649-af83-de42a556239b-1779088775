import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, ShoppingCart, Lock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
  fileUrl: string;
  hasAccess?: boolean;
  onPurchase?: () => void;
  documentTitle?: string;
}

export function PDFViewer({ fileUrl, hasAccess = false, onPurchase, documentTitle }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement }>({});
  const renderTaskRef = useRef<any>(null); // Track current render task

  const FREE_PREVIEW_PAGES = 2;
  const isPageLocked = !hasAccess && currentPage > FREE_PREVIEW_PAGES;

  useEffect(() => {
    if (!fileUrl) {
      setLoading(false);
      return;
    }

    const loadPDF = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };

    loadPDF();

    // Cleanup on unmount
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRefs.current[currentPage]) return;

    const renderPage = async () => {
      try {
        // Cancel any ongoing render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRefs.current[currentPage];
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale: zoom * 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Store the render task so we can cancel it later
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
      } catch (error: any) {
        // Ignore cancellation errors
        if (error?.name !== "RenderingCancelledException") {
          console.error("Error rendering page:", error);
        }
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, zoom]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 2.0) {
      setZoom(zoom + 0.25);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) {
      setZoom(zoom - 0.25);
    }
  };

  const handleFullscreen = () => {
    window.open(fileUrl, "_blank");
  };

  if (!fileUrl) {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-terre/30 text-center">
        <p className="text-noir/60">URL du document non disponible</p>
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
            Page {currentPage} / {numPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            variant="outline"
            size="sm"
            className="border-terre/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleZoomOut} disabled={zoom <= 0.5} variant="outline" size="sm" className="border-terre/30">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-noir px-2">{Math.round(zoom * 100)}%</span>
          <Button onClick={handleZoomIn} disabled={zoom >= 2.0} variant="outline" size="sm" className="border-terre/30">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={handleFullscreen} variant="outline" size="sm" className="border-terre/30">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Badge */}
      {!hasAccess && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-500 text-white">
              Aperçu Limité
            </Badge>
            <p className="text-sm text-amber-900">
              Les {FREE_PREVIEW_PAGES} premières pages sont visibles. Achetez pour voir l'intégralité.
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
                      size="lg"
                      className="bg-gradient-to-r from-terre to-orange-600 hover:from-terre/90 hover:to-orange-700 text-noir font-bold shadow-2xl px-8 py-6 text-lg"
                    >
                      <ShoppingCart className="h-6 w-6 mr-2 text-noir" />
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