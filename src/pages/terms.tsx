import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="font-serif text-4xl font-bold mb-8 text-center">Conditions Générales d'Utilisation</h1>
          
          <Card className="border-border/40">
            <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-serif text-earth mb-4">1. Préambule</h2>
              <p className="mb-6">
                AfriLitt est une plateforme numérique dédiée à la publication, au partage et à la vente de documents intellectuels, académiques et littéraires africains. En utilisant cette plateforme, vous acceptez les présentes Conditions Générales d'Utilisation.
              </p>

              <h2 className="text-2xl font-serif text-earth mb-4">2. Propriété Intellectuelle et Droits d'Auteur</h2>
              <p className="mb-4">
                <strong>2.1 Certification des droits :</strong> Tout utilisateur qui publie un document sur AfriLitt certifie sur l'honneur qu'il en est l'auteur légitime ou qu'il détient les droits explicites de publication et de distribution numérique pour ce contenu.
              </p>
              <p className="mb-6">
                <strong>2.2 Interdiction de plagiat :</strong> Il est strictement interdit de publier des œuvres déjà éditées sans l'accord écrit de la maison d'édition, ou tout document enfreignant les droits de propriété intellectuelle d'un tiers.
              </p>

              <h2 className="text-2xl font-serif text-earth mb-4">3. Modération et Signalement</h2>
              <p className="mb-6">
                AfriLitt se réserve le droit de retirer sans préavis tout document signalé comme violant nos CGU ou les lois en vigueur. Un système de signalement est mis à disposition des utilisateurs pour rapporter tout abus. Les documents soumis sont soumis à la validation d'un administrateur avant publication publique.
              </p>

              <h2 className="text-2xl font-serif text-earth mb-4">4. Ventes et Monétisation</h2>
              <p className="mb-6">
                Les auteurs fixent librement le prix de vente de leurs documents. AfriLitt prélève une commission de gestion sur chaque transaction pour couvrir les frais de plateforme et de paiement (Mobile Money, Carte Bancaire). Les revenus générés sont consultables depuis le tableau de bord auteur.
              </p>

              <h2 className="text-2xl font-serif text-earth mb-4">5. Accès aux documents et protection</h2>
              <p className="mb-6">
                L'accès complet à un document payant n'est accordé qu'après validation du paiement. AfriLitt met en œuvre des mesures techniques pour protéger les documents PDF (aperçu limité, URL temporaires), bien qu'une sécurité absolue ne puisse être garantie contre toute tentative de contournement illégal.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}