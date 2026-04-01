import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

// Configure worker with jsdelivr CDN (better CORS support)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  maxPages?: number;
}

export function PDFViewer({ fileUrl, maxPages }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, maxPages || numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const displayPages = maxPages ? Math.min(numPages, maxPages) : numPages;

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white/50 backdrop-blur rounded-lg border border-terre/20">
        <div className="flex items-center gap-2">
          <Button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-noir">
            Page {pageNumber} / {displayPages}
            {maxPages && numPages > maxPages && (
              <span className="text-xs text-noir/60 ml-2">
                (Aperçu limité à {maxPages} pages)
              </span>
            )}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={pageNumber >= displayPages}
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
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex justify-center bg-slate-100 rounded-lg p-4 border-2 border-dashed border-terre/30">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-terre border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-noir/60">Chargement du PDF...</p>
            </div>
          }
          error={
            <div className="text-center py-12">
              <p className="text-red-600 font-medium mb-2">Erreur de chargement</p>
              <p className="text-noir/60 text-sm">Impossible de charger le document PDF</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {maxPages && numPages > maxPages && (
        <div className="mt-4 p-4 bg-or/10 border border-or/30 rounded-lg text-center">
          <p className="text-noir/80 font-medium mb-1">
            🔒 Aperçu limité aux {maxPages} premières pages
          </p>
          <p className="text-sm text-noir/60">
            Le document complet contient {numPages} pages
          </p>
        </div>
      )}
    </div>
  );
}