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
              <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
              
              <h2 className="text-2xl font-serif text-terre mb-4">1. Préambule</h2>
              <p className="mb-4">
                AFRILITT est une plateforme numérique dédiée à la publication, au partage, à la vente et à la promotion de documents intellectuels, académiques et littéraires africains. La plateforme met en relation des auteurs souhaitant publier et monétiser leurs œuvres avec des lecteurs à la recherche de contenus de qualité.
              </p>
              <p className="mb-6">
                En créant un compte et en utilisant les services AFRILITT, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">2. Définitions</h2>
              <ul className="mb-6">
                <li><strong>Plateforme :</strong> Le site web AFRILITT et tous ses services associés</li>
                <li><strong>Utilisateur :</strong> Toute personne inscrite sur la plateforme, qu'elle soit Auteur ou Lecteur</li>
                <li><strong>Auteur :</strong> Utilisateur qui publie des documents sur la plateforme</li>
                <li><strong>Lecteur :</strong> Utilisateur qui consulte et/ou achète des documents</li>
                <li><strong>Document :</strong> Tout contenu numérique (PDF) publié sur la plateforme</li>
                <li><strong>Commission :</strong> Pourcentage prélevé par AFRILITT sur chaque vente</li>
              </ul>

              <h2 className="text-2xl font-serif text-terre mb-4">3. Inscription et Compte Utilisateur</h2>
              <p className="mb-4">
                <strong>3.1 Création de compte :</strong> L'inscription nécessite une adresse email valide et un mot de passe sécurisé. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
              </p>
              <p className="mb-4">
                <strong>3.2 Exactitude des informations :</strong> Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription et à les maintenir actualisées.
              </p>
              <p className="mb-4">
                <strong>3.3 Responsabilité du compte :</strong> Vous êtes seul responsable de toutes les activités effectuées depuis votre compte. En cas d'utilisation non autorisée, vous devez en informer immédiatement AFRILITT.
              </p>
              <p className="mb-6">
                <strong>3.4 Résiliation de compte :</strong> Vous pouvez demander la suppression de votre compte à tout moment. AFRILITT se réserve le droit de suspendre ou supprimer un compte en cas de violation des CGU.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">4. Publication de Documents (Auteurs)</h2>
              <p className="mb-4">
                <strong>4.1 Propriété intellectuelle :</strong> En publiant un document, vous certifiez sur l'honneur que :
              </p>
              <ul className="mb-4">
                <li>Vous êtes l'auteur légitime du document ou détenez tous les droits nécessaires à sa publication</li>
                <li>Le document ne viole aucun droit de propriété intellectuelle d'un tiers</li>
                <li>Le document n'est pas déjà publié sous contrat d'exclusivité avec une maison d'édition sans autorisation écrite</li>
                <li>Le contenu respecte les lois en vigueur et n'est pas illégal, diffamatoire, ou offensant</li>
              </ul>
              <p className="mb-4">
                <strong>4.2 Validation des documents :</strong> Tous les documents soumis sont soumis à validation par un administrateur avant publication publique. AFRILITT se réserve le droit de refuser la publication de tout document ne respectant pas les présentes CGU.
              </p>
              <p className="mb-4">
                <strong>4.3 Tarification :</strong> Les auteurs fixent librement le prix de vente de leurs documents. Ils peuvent également proposer des documents gratuits.
              </p>
              <p className="mb-4">
                <strong>4.4 Modification et suppression :</strong> Les auteurs peuvent modifier les informations de leurs documents (titre, description, prix) ou les supprimer à tout moment depuis leur tableau de bord.
              </p>
              <p className="mb-6">
                <strong>4.5 Partage et promotion :</strong> Les auteurs peuvent partager le lien de leur catalogue personnel et de leurs documents sur les réseaux sociaux via les outils de partage intégrés à la plateforme.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">5. Achats et Accès aux Documents (Lecteurs)</h2>
              <p className="mb-4">
                <strong>5.1 Prévisualisation :</strong> Une prévisualisation limitée (pages 1-2) est disponible gratuitement pour tous les documents payants.
              </p>
              <p className="mb-4">
                <strong>5.2 Achat et paiement :</strong> L'accès complet à un document payant nécessite un paiement validé. AFRILITT accepte les paiements via :
              </p>
              <ul className="mb-4">
                <li>Mobile Money (Moov Money, Airtel Money) via E-billing</li>
                <li>Cartes bancaires (à venir)</li>
              </ul>
              <p className="mb-4">
                <strong>5.3 Accès permanent :</strong> Une fois acheté, l'accès au document est permanent et peut être consulté à tout moment depuis l'espace "Mes achats".
              </p>
              <p className="mb-4">
                <strong>5.4 Protection des contenus :</strong> AFRILITT met en œuvre des mesures techniques pour protéger les documents (URL temporaires, limitation de l'aperçu). Le téléchargement et la redistribution non autorisés sont strictement interdits.
              </p>
              <p className="mb-4">
                <strong>5.5 Politique de remboursement :</strong> En raison de la nature numérique des produits, les achats sont définitifs. Aucun remboursement ne sera accordé sauf en cas d'erreur technique avérée empêchant l'accès au document.
              </p>
              <p className="mb-6">
                <strong>5.6 Partage de documents :</strong> Les lecteurs peuvent partager les liens des documents sur les réseaux sociaux pour faire découvrir les œuvres aux autres utilisateurs.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">6. Commissions et Rémunération des Auteurs</h2>
              <p className="mb-4">
                <strong>6.1 Taux de commission :</strong> AFRILITT prélève une commission sur chaque vente pour couvrir les frais de plateforme, de paiement et de maintenance. Le taux de commission est affiché dans les paramètres de la plateforme et peut varier.
              </p>
              <p className="mb-4">
                <strong>6.2 Consultation des revenus :</strong> Les auteurs peuvent consulter en temps réel leurs revenus, le nombre de ventes et les statistiques détaillées depuis leur tableau de bord.
              </p>
              <p className="mb-4">
                <strong>6.3 Demande de retrait :</strong> Les auteurs peuvent demander le retrait de leurs revenus accumulés sous réserve des conditions suivantes :
              </p>
              <ul className="mb-4">
                <li>Montant minimum de retrait défini dans les paramètres de la plateforme</li>
                <li>Fourniture d'informations de paiement valides (numéro Mobile Money, coordonnées bancaires)</li>
                <li>Vérification de l'identité pour des montants élevés (si nécessaire)</li>
              </ul>
              <p className="mb-4">
                <strong>6.4 Traitement des retraits :</strong> Les demandes de retrait sont traitées par l'administration dans un délai de 7 à 14 jours ouvrables. AFRILITT se réserve le droit de demander des documents justificatifs avant validation.
              </p>
              <p className="mb-6">
                <strong>6.5 Frais de transaction :</strong> Des frais de transaction appliqués par les opérateurs Mobile Money peuvent être déduits du montant du retrait.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">7. Modération et Signalement</h2>
              <p className="mb-4">
                <strong>7.1 Signalement de contenu :</strong> Un système de signalement est mis à disposition des utilisateurs pour rapporter tout contenu inapproprié, illégal ou violant les droits d'auteur.
              </p>
              <p className="mb-4">
                <strong>7.2 Traitement des signalements :</strong> Chaque signalement est examiné par l'équipe d'administration. Les documents signalés peuvent être temporairement retirés pendant l'investigation.
              </p>
              <p className="mb-4">
                <strong>7.3 Sanctions :</strong> En cas de violation avérée des CGU, AFRILITT peut :
              </p>
              <ul className="mb-4">
                <li>Retirer le document incriminé</li>
                <li>Suspendre temporairement le compte de l'auteur</li>
                <li>Supprimer définitivement le compte en cas de violations répétées</li>
                <li>Bloquer les revenus en attente en cas de fraude</li>
              </ul>
              <p className="mb-6">
                <strong>7.4 Interdiction de plagiat :</strong> Le plagiat et la publication de contenus protégés sans autorisation sont strictement interdits et peuvent entraîner des poursuites judiciaires.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">8. Bannières et Publicités</h2>
              <p className="mb-4">
                AFRILITT se réserve le droit d'afficher des bannières promotionnelles sur la plateforme pour mettre en avant certains documents, auteurs ou fonctionnalités. Ces bannières peuvent être personnalisées et gérées par l'administration.
              </p>
              <p className="mb-6">
                Les auteurs peuvent bénéficier de promotions et de mises en avant payantes pour augmenter la visibilité de leurs documents (fonctionnalité à venir).
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">9. Protection des Données Personnelles</h2>
              <p className="mb-4">
                <strong>9.1 Collecte de données :</strong> AFRILITT collecte et traite les données personnelles nécessaires au fonctionnement de la plateforme (nom, email, informations de paiement, historique d'achats, statistiques d'utilisation).
              </p>
              <p className="mb-4">
                <strong>9.2 Utilisation des données :</strong> Vos données sont utilisées pour :
              </p>
              <ul className="mb-4">
                <li>Gérer votre compte et vos transactions</li>
                <li>Améliorer nos services</li>
                <li>Vous envoyer des communications importantes (notifications de ventes, mises à jour)</li>
                <li>Générer des statistiques anonymisées</li>
              </ul>
              <p className="mb-4">
                <strong>9.3 Sécurité :</strong> AFRILITT met en œuvre des mesures de sécurité pour protéger vos données contre tout accès, modification ou divulgation non autorisés.
              </p>
              <p className="mb-4">
                <strong>9.4 Droits des utilisateurs :</strong> Conformément aux réglementations en vigueur, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Contactez-nous pour exercer ces droits.
              </p>
              <p className="mb-6">
                <strong>9.5 Conservation des données :</strong> Vos données sont conservées pendant la durée de votre inscription et jusqu'à 3 ans après la fermeture de votre compte pour des raisons légales et comptables.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">10. Responsabilités et Limitations</h2>
              <p className="mb-4">
                <strong>10.1 Responsabilité de AFRILITT :</strong> AFRILITT agit en tant qu'hébergeur et intermédiaire technique. La plateforme ne saurait être tenue responsable du contenu publié par les auteurs, de l'exactitude des informations fournies ou de l'utilisation qui en est faite.
              </p>
              <p className="mb-4">
                <strong>10.2 Disponibilité du service :</strong> AFRILITT s'efforce d'assurer un service disponible 24h/24 et 7j/7, mais ne peut garantir une disponibilité totale. Des interruptions pour maintenance ou incidents techniques peuvent survenir.
              </p>
              <p className="mb-4">
                <strong>10.3 Protection des documents :</strong> Bien que des mesures de protection soient mises en place, AFRILITT ne peut garantir une sécurité absolue contre toute tentative de contournement ou de piratage.
              </p>
              <p className="mb-6">
                <strong>10.4 Litiges entre utilisateurs :</strong> AFRILITT n'est pas partie prenante dans les éventuels litiges entre auteurs et lecteurs concernant le contenu des documents. Ces litiges doivent être réglés directement entre les parties concernées.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">11. Modification des CGU</h2>
              <p className="mb-6">
                AFRILITT se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications majeures par email ou notification sur la plateforme. La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles conditions.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">12. Droit Applicable et Juridiction</h2>
              <p className="mb-4">
                Les présentes CGU sont régies par le droit applicable dans le pays d'exploitation de la plateforme. En cas de litige, les parties s'efforceront de trouver une solution amiable avant toute action judiciaire.
              </p>
              <p className="mb-6">
                À défaut d'accord amiable, les tribunaux compétents du lieu du siège social de AFRILITT seront seuls compétents pour connaître du litige.
              </p>

              <h2 className="text-2xl font-serif text-terre mb-4">13. Contact</h2>
              <p className="mb-4">
                Pour toute question concernant ces conditions d'utilisation ou pour exercer vos droits, vous pouvez nous contacter via :
              </p>
              <ul className="mb-6">
                <li>La page Contact de la plateforme</li>
                <li>L'email de support affiché sur le site</li>
                <li>Le formulaire de signalement pour les questions liées au contenu</li>
              </ul>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-muted-foreground italic">
                  En utilisant AFRILITT, vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes Conditions Générales d'Utilisation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}