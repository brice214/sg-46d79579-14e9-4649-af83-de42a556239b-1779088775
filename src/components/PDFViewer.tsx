import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from "lucide-react";

interface PDFViewerProps {
  fileUrl: string;
  maxPages?: number;
}

export function PDFViewer({ fileUrl, maxPages }: PDFViewerProps) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  const handleFullscreen = () => {
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 p-3 bg-terre/5 rounded-lg border border-terre/20">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            disabled={scale <= 0.5}
            className="border-terre/30"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-noir min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            disabled={scale >= 2}
            className="border-terre/30"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleFullscreen}
            variant="outline"
            size="sm"
            className="border-terre/30"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Plein écran
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="border-terre/30"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* PDF Viewer - Native iframe */}
      <div className="relative w-full bg-white rounded-lg border-2 border-terre/20 overflow-hidden shadow-lg">
        <div 
          className="w-full transition-transform duration-200 origin-top-left"
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
            width: `${100 / scale}%`,
          }}
        >
          <iframe
            src={fileUrl}
            className="w-full border-0"
            style={{ height: "800px" }}
            title="Aperçu du document PDF"
          />
        </div>
      </div>

      {maxPages && (
        <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-noir/70">
            📄 Aperçu limité aux {maxPages} premières pages. Achetez le document pour voir l'intégralité.
          </p>
        </div>
      )}
    </div>
  );
}