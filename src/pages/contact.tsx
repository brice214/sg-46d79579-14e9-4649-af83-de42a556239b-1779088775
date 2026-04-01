import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Phone, Send, MessageSquare, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: ""
      });
      setLoading(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-earth/5 via-background to-gold/5">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/afrilitt-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background"></div>
        </div>

        <div className="container max-w-6xl relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 mb-6">
              <MessageSquare className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">Nous sommes à votre écoute</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">
              Contactez-nous
            </h1>
            
            <p className="text-xl text-gold/90 max-w-2xl mx-auto">
              Une question ? Une suggestion ? Notre équipe est là pour vous aider.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 border-2 border-gold/20 bg-gradient-to-br from-card to-earth/5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <a href="mailto:contact@afrilitt.com" className="text-gold hover:underline">
                      contact@afrilitt.com
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-gold/20 bg-gradient-to-br from-card to-gold/5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-earth to-gold flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Localisation</h3>
                    <p className="text-muted-foreground">
                      Libreville, Gabon
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-gold/20 bg-gradient-to-br from-card to-forest/5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-forest to-green-700 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Support</h3>
                    <p className="text-muted-foreground">
                      Disponible 24/7 par email
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 border-2 border-gold/20 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm">
                <h2 className="font-serif text-3xl font-bold mb-6">Envoyez-nous un message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="mt-2 border-gold/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="mt-2 border-gold/20"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                        <SelectTrigger className="mt-2 border-gold/20">
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Question générale</SelectItem>
                          <SelectItem value="support">Support technique</SelectItem>
                          <SelectItem value="auteur">Devenir auteur</SelectItem>
                          <SelectItem value="achat">Problème d'achat</SelectItem>
                          <SelectItem value="partenariat">Partenariat</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Objet *</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Objet du message"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        required
                        className="mt-2 border-gold/20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre demande en détail..."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      rows={8}
                      className="mt-2 border-gold/20 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gold/5 p-4 rounded-lg border border-gold/20">
                    <Check className="h-4 w-4 text-gold flex-shrink-0" />
                    <span>
                      Nous nous engageons à répondre à tous les messages dans les 24-48 heures.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-earth to-gold hover:from-earth/90 hover:to-gold/90 text-white font-semibold py-6 text-lg"
                  >
                    {loading ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}