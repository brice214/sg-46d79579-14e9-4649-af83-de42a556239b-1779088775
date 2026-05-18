import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, Check } from "lucide-react";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SocialShare({ 
  url, 
  title, 
  description = "", 
  variant = "outline",
  size = "sm",
  className = ""
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = url.startsWith("http") ? url : `https://afrilitt.com${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Partager sur</p>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => window.open(shareLinks.facebook, "_blank", "width=600,height=400")}
            >
              <Facebook className="h-4 w-4 mr-2 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => window.open(shareLinks.twitter, "_blank", "width=600,height=400")}
            >
              <Twitter className="h-4 w-4 mr-2 text-sky-500" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => window.open(shareLinks.linkedin, "_blank", "width=600,height=400")}
            >
              <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
              LinkedIn
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => window.open(shareLinks.whatsapp, "_blank", "width=600,height=400")}
            >
              <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
              WhatsApp
            </Button>
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Lien copié !
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </>
              )}
            </Button>
          </div>

          {navigator.share && (
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Plus d'options
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}