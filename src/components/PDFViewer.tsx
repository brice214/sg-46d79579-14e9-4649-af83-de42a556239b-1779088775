import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize } from "lucide-react";
import { ShoppingCart } from "lucide-react";

// Configure worker - use data URL to avoid CORS issues
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

interface PDFViewerProps {
  fileUrl: string;
  maxPages?: number;
  hasAccess?: boolean;
  onPurchase?: () => void;
}

export function PDFViewer({ fileUrl, maxPages, hasAccess = true, onPurchase }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF Load Error:", error);
    setError("Impossible de charger le document PDF");
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      return Math.max(1, Math.min(newPage, numPages));
    });
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const canViewPage = (page: number) => {
    if (hasAccess) return true;
    if (!maxPages) return true;
    return page <= maxPages;
  };

  const openFullscreen = () => {
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-white/50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-terre/30 text-center">
        <p className="text-noir/60">Chargement du document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 backdrop-blur rounded-lg p-8 border-2 border-dashed border-red-300 text-center">
        <p className="text-red-700 font-semibold mb-2">Erreur de chargement</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur rounded-lg p-3 border border-terre/20">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-noir">
            Page {pageNumber} / {numPages}
          </span>
          <Button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={zoomOut} disabled={scale <= 0.5} variant="outline" size="sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-noir">{Math.round(scale * 100)}%</span>
          <Button onClick={zoomIn} disabled={scale >= 2.0} variant="outline" size="sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={openFullscreen} variant="outline" size="sm" title="Ouvrir en plein écran">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="bg-white rounded-lg border border-terre/20 overflow-hidden">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="p-8 text-center">
              <p className="text-noir/60">Chargement du PDF...</p>
            </div>
          }
        >
          <div className="flex justify-center p-4 bg-gray-100">
            <div className="relative">
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              
              {/* Blur overlay for restricted pages */}
              {!canViewPage(pageNumber) && (
                <div className="absolute inset-0 backdrop-blur-xl bg-white/30 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur p-8 rounded-xl shadow-2xl text-center max-w-md border-2 border-or/20">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-or" />
                    <h3 className="text-2xl font-bold text-noir mb-2">
                      Aperçu limité
                    </h3>
                    <p className="text-noir/70 mb-6">
                      Seules les {maxPages} premières pages sont visibles.
                      <br />
                      Achetez ce document pour voir l'intégralité.
                    </p>
                    {onPurchase && (
                      <Button
                        onClick={onPurchase}
                        className="bg-or hover:bg-or/90 text-noir font-bold"
                        size="lg"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Acheter maintenant
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Document>
      </div>

      {/* Info message for limited preview */}
      {!hasAccess && maxPages && numPages > maxPages && (
        <div className="bg-amber-50 border-2 border-or/30 rounded-lg p-4 text-center">
          <p className="text-noir/80">
            <strong>Aperçu limité :</strong> Vous voyez {maxPages} pages sur {numPages}.
            {onPurchase && (
              <Button
                onClick={onPurchase}
                variant="link"
                className="text-or hover:text-or/80 font-semibold ml-2"
              >
                Acheter pour voir le document complet
              </Button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}