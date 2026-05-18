import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, FileText, Bell, Trash2, Download, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: "1. Données collectées",
      content: [
        {
          subtitle: "1.1 Données d'inscription",
          text: "Lors de votre inscription sur AFRILITT, nous collectons les informations suivantes : adresse e-mail, nom complet, mot de passe (chiffré), date de création du compte."
        },
        {
          subtitle: "1.2 Données de profil",
          text: "En tant qu'auteur, vous pouvez enrichir votre profil avec : biographie, photo de profil, informations de contact pour retraits, numéro de téléphone Mobile Money."
        },
        {
          subtitle: "1.3 Données de contenu",
          text: "Lorsque vous publiez un document : fichier PDF, titre, description, catégorie, prix, métadonnées du document (taille, nombre de pages)."
        },
        {
          subtitle: "1.4 Données transactionnelles",
          text: "Pour chaque achat ou retrait : montant, méthode de paiement (Moov Money, Airtel Money), date et heure de la transaction, statut du paiement, identifiant de transaction E-billing."
        },
        {
          subtitle: "1.5 Données de navigation",
          text: "Nous collectons automatiquement : adresse IP, type de navigateur et appareil, pages visitées, temps passé sur la plateforme, documents consultés, recherches effectuées."
        }
      ]
    },
    {
      icon: Eye,
      title: "2. Utilisation des données",
      content: [
        {
          subtitle: "2.1 Fourniture du service",
          text: "Vos données sont utilisées pour : gérer votre compte et authentification, traiter vos publications et achats, faciliter les paiements et retraits, afficher votre catalogue personnel, permettre le partage social de contenus."
        },
        {
          subtitle: "2.2 Communication",
          text: "Nous utilisons votre e-mail pour : confirmations de transactions, notifications de ventes (auteurs), alertes de modération, mises à jour importantes de la plateforme, réponses à vos demandes de support."
        },
        {
          subtitle: "2.3 Amélioration du service",
          text: "Les données anonymisées servent à : analyser les tendances de lecture, optimiser les catégories et recommandations, détecter et prévenir la fraude, améliorer l'expérience utilisateur."
        },
        {
          subtitle: "2.4 Obligations légales",
          text: "Nous conservons certaines données pour : respecter les obligations fiscales (7 ans), répondre aux demandes des autorités compétentes, appliquer nos conditions d'utilisation."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "3. Partage des données",
      content: [
        {
          subtitle: "3.1 Informations publiques",
          text: "Sont visibles publiquement : nom d'auteur, biographie, documents publiés, dates de publication. Votre e-mail et coordonnées bancaires ne sont JAMAIS rendus publics."
        },
        {
          subtitle: "3.2 Prestataires de paiement",
          text: "Pour traiter les transactions, nous partageons : numéro de téléphone Mobile Money, montant à payer/retirer, référence de transaction. E-billing (notre prestataire) applique sa propre politique de confidentialité conforme aux normes bancaires."
        },
        {
          subtitle: "3.3 Autorités légales",
          text: "Nous divulguons vos données uniquement : sur demande légale d'une autorité compétente, pour protéger nos droits légaux, en cas de fraude ou activité illicite avérée."
        },
        {
          subtitle: "3.4 Partage social",
          text: "Lorsque vous utilisez les fonctions de partage (Facebook, Twitter, LinkedIn, WhatsApp), seuls les liens publics et titres sont transmis. Vos données personnelles ne sont pas partagées avec ces plateformes."
        },
        {
          subtitle: "3.5 Pas de vente de données",
          text: "AFRILITT ne vend JAMAIS vos données personnelles à des tiers à des fins marketing ou publicitaires."
        }
      ]
    },
    {
      icon: Lock,
      title: "4. Sécurité des données",
      content: [
        {
          subtitle: "4.1 Mesures techniques",
          text: "Nous protégeons vos données par : chiffrement SSL/TLS pour toutes les communications, hachage des mots de passe (bcrypt), authentification sécurisée via Supabase Auth, hébergement sécurisé sur infrastructure cloud (Vercel + Supabase)."
        },
        {
          subtitle: "4.2 Accès restreint",
          text: "L'accès à vos données personnelles est limité : administrateurs authentifiés uniquement, accès journalisé et auditable, pas d'accès pour le support de niveau 1."
        },
        {
          subtitle: "4.3 Notification de violation",
          text: "En cas de violation de données, nous nous engageons à : vous notifier sous 72h, informer la CNIL si nécessaire, prendre des mesures correctives immédiates."
        }
      ]
    },
    {
      icon: FileText,
      title: "5. Vos droits (RGPD)",
      content: [
        {
          subtitle: "5.1 Droit d'accès",
          text: "Vous pouvez demander une copie de toutes vos données personnelles. Délai de réponse : 30 jours maximum. Gratuit pour la première demande annuelle."
        },
        {
          subtitle: "5.2 Droit de rectification",
          text: "Vous pouvez modifier directement : nom, biographie, photo de profil, coordonnées de retrait. Pour d'autres modifications, contactez-nous."
        },
        {
          subtitle: "5.3 Droit à l'oubli",
          text: "Vous pouvez demander la suppression de votre compte via la page Compte > Supprimer mon compte. Effet : suppression immédiate du compte, conservation des données transactionnelles (7 ans, obligation légale), documents publiés retirés du catalogue."
        },
        {
          subtitle: "5.4 Droit à la portabilité",
          text: "Vous pouvez obtenir vos données dans un format structuré (JSON) pour transfert vers un autre service."
        },
        {
          subtitle: "5.5 Droit d'opposition",
          text: "Vous pouvez vous opposer au traitement de vos données à des fins de : profilage marketing, analyses statistiques non essentielles. Le service de base reste accessible."
        },
        {
          subtitle: "5.6 Exercer vos droits",
          text: "Pour toute demande, contactez : contact@afrilitt.com. Joignez une copie de votre pièce d'identité pour sécuriser votre demande."
        }
      ]
    },
    {
      icon: Bell,
      title: "6. Cookies et traceurs",
      content: [
        {
          subtitle: "6.1 Cookies essentiels",
          text: "Nécessaires au fonctionnement : session d'authentification (supabase-auth-token), préférences de thème (theme-preference), panier d'achat temporaire. Ces cookies ne peuvent être désactivés."
        },
        {
          subtitle: "6.2 Cookies analytiques",
          text: "Pour comprendre l'utilisation du site (anonymisés). Vous pouvez les refuser via le bandeau cookies."
        },
        {
          subtitle: "6.3 Durée de conservation",
          text: "Session : jusqu'à déconnexion. Préférences : 1 an. Analytiques : 13 mois maximum."
        },
        {
          subtitle: "6.4 Gestion des cookies",
          text: "Paramétrez vos préférences via : le bandeau lors de votre première visite, les paramètres de votre navigateur, notre page /cookies (configuration avancée)."
        }
      ]
    },
    {
      icon: Database,
      title: "7. Conservation des données",
      content: [
        {
          subtitle: "7.1 Compte actif",
          text: "Tant que votre compte est actif, nous conservons toutes vos données pour assurer le service."
        },
        {
          subtitle: "7.2 Compte inactif",
          text: "Après 3 ans sans connexion, nous vous notifions par e-mail. Sans réponse sous 6 mois, le compte est archivé puis supprimé (sauf obligations légales)."
        },
        {
          subtitle: "7.3 Après suppression de compte",
          text: "Données supprimées immédiatement : profil, documents non vendus, préférences. Conservées 7 ans (loi) : historique de transactions, factures, déclarations fiscales. Anonymisées : statistiques agrégées."
        },
        {
          subtitle: "7.4 Données de paiement",
          text: "Les coordonnées bancaires ne sont jamais stockées par AFRILITT. E-billing gère ces données selon les normes PCI-DSS."
        }
      ]
    },
    {
      icon: Shield,
      title: "8. Transfert international",
      content: [
        {
          subtitle: "8.1 Hébergement",
          text: "Vos données sont hébergées : Infrastructure principale : Supabase (UE/USA avec clauses contractuelles types), CDN Vercel (global avec protection adéquate), Stockage fichiers : Supabase Storage (chiffré)."
        },
        {
          subtitle: "8.2 Garanties",
          text: "Tous nos sous-traitants respectent : RGPD ou équivalent (Privacy Shield, clauses contractuelles), chiffrement en transit et au repos, audits de sécurité réguliers."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "9. Mineurs",
      content: [
        {
          subtitle: "9.1 Âge minimum",
          text: "AFRILITT est réservé aux personnes de 16 ans et plus. Les mineurs de 13-16 ans doivent avoir l'autorisation parentale."
        },
        {
          subtitle: "9.2 Contrôle parental",
          text: "Si vous découvrez qu'un mineur de moins de 13 ans a créé un compte, contactez-nous pour suppression immédiate."
        }
      ]
    },
    {
      icon: Download,
      title: "10. Données des auteurs",
      content: [
        {
          subtitle: "10.1 Documents publiés",
          text: "En tant qu'auteur, vous conservez la propriété intellectuelle de vos documents. AFRILITT obtient une licence pour : stocker et distribuer les fichiers, afficher les métadonnées publiquement, permettre la prévisualisation et l'achat."
        },
        {
          subtitle: "10.2 Analytiques auteurs",
          text: "Nous vous fournissons : nombre de vues et téléchargements, revenus générés, statistiques de catalogue. Ces données sont privées et ne sont pas partagées avec d'autres utilisateurs."
        },
        {
          subtitle: "10.3 Retraits",
          text: "Pour traiter vos demandes de retrait, nous devons conserver : numéro Mobile Money, montant retiré, date de retrait, statut de la transaction. Conservation : 7 ans (obligation fiscale)."
        }
      ]
    },
    {
      icon: Trash2,
      title: "11. Signalement et modération",
      content: [
        {
          subtitle: "11.1 Données de signalement",
          text: "Lorsque vous signalez un document, nous collectons : votre identifiant (anonyme pour l'auteur), motif du signalement, date et heure. Ces données sont conservées jusqu'à résolution + 6 mois."
        },
        {
          subtitle: "11.2 Sanctions",
          text: "En cas de violation des CGU, les données liées aux sanctions (raisons, durée, appels) sont conservées 3 ans à des fins de preuve."
        }
      ]
    },
    {
      icon: Mail,
      title: "12. Modifications de la politique",
      content: [
        {
          subtitle: "12.1 Notification",
          text: "Toute modification substantielle de cette politique sera : notifiée par e-mail 30 jours avant application, affichée sur la plateforme, datée et archivée."
        },
        {
          subtitle: "12.2 Consentement",
          text: "En continuant d'utiliser AFRILITT après notification, vous acceptez la nouvelle politique. Si vous refusez, vous pouvez supprimer votre compte."
        },
        {
          subtitle: "12.3 Historique",
          text: "Version actuelle : 18 mai 2026. Dernière mise à jour : 18 mai 2026."
        }
      ]
    },
    {
      icon: Mail,
      title: "13. Contact et réclamations",
      content: [
        {
          subtitle: "13.1 Délégué à la protection des données",
          text: "Pour toute question relative à vos données personnelles : E-mail : dpo@afrilitt.com, Courrier : AFRILITT - DPO, Libreville, Gabon. Délai de réponse : 30 jours maximum."
        },
        {
          subtitle: "13.2 Réclamation CNIL",
          text: "Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) ou l'autorité équivalente dans votre pays."
        },
        {
          subtitle: "13.3 Support utilisateur",
          text: "Pour des questions générales (non liées aux données) : contact@afrilitt.com"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-earth/5 to-background">
      <SEO 
        title="Politique de confidentialité - AFRILITT"
        description="Découvrez comment AFRILITT collecte, utilise et protège vos données personnelles. Conformité RGPD et transparence totale."
      />
      <Header />
      
      <main className="container py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-earth via-gold to-forest mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-earth via-gold to-forest bg-clip-text text-transparent">
            Politique de confidentialité
          </h1>
          <p className="text-lg text-muted-foreground">
            Votre vie privée est notre priorité. Cette politique explique comment nous collectons, 
            utilisons et protégeons vos données personnelles sur AFRILITT.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold" />
              <span>Dernière mise à jour : 18 mai 2026</span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="max-w-5xl mx-auto space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="border-gold/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-earth/10 via-gold/10 to-forest/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="space-y-2">
                      <h3 className="font-semibold text-lg text-earth">
                        {item.subtitle}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Summary Card */}
          <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-earth/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-gold" />
                En résumé
              </CardTitle>
              <CardDescription>
                Les points essentiels à retenir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gold">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Nous ne vendons JAMAIS vos données personnelles
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gold">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Vous contrôlez vos données : accès, modification, suppression à tout moment
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gold">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Chiffrement et sécurité de niveau bancaire (SSL/TLS, PCI-DSS)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gold">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Conformité RGPD avec tous vos droits européens respectés
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gold">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Transparence totale sur l'usage de vos données
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gold">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Contact DPO : dpo@afrilitt.com pour toute question sur vos données
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}