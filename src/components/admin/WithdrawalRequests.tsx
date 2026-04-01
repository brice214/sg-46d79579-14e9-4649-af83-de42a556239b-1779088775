import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { withdrawalService } from "@/services/withdrawalService";
import { Wallet, Loader2, Check, X, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface WithdrawalRequestData {
  id: string;
  author_id: string;
  amount: number;
  transaction_fee: number;
  net_amount: number;
  payment_method: string;
  payment_details: any;
  status: string;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export function WithdrawalRequests() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WithdrawalRequestData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequestData | null>(null);
  const [actionDialog, setActionDialog] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "completed">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [requestsData, statsData] = await Promise.all([
      withdrawalService.getAllWithdrawalRequests(),
      withdrawalService.getWithdrawalStats(),
    ]);

    setRequests(requestsData as unknown as WithdrawalRequestData[]);
    setStats(statsData);
    setLoading(false);
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedRequest) return;

    setProcessing(true);
    const status = action === "approve" ? "approved" : "rejected";
    const success = await withdrawalService.updateWithdrawalStatus(
      selectedRequest.id,
      status,
      adminNotes || undefined
    );

    if (success) {
      toast({
        title: action === "approve" ? "✅ Demande approuvée" : "❌ Demande rejetée",
        description: `La demande de retrait a été ${action === "approve" ? "approuvée" : "rejetée"}`,
      });
      await loadData();
      setActionDialog(null);
      setSelectedRequest(null);
      setAdminNotes("");
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la demande",
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "secondary" },
      approved: { label: "Approuvée", variant: "default" },
      rejected: { label: "Rejetée", variant: "destructive" },
      completed: { label: "Complétée", variant: "outline" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === "mobile_money" ? "Mobile Money" : "Virement bancaire";
  };

  const filteredRequests = filter === "all" 
    ? requests 
    : requests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approuvées</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Complétées</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejetées</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-gold/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl">Demandes de retrait</CardTitle>
              <CardDescription>Gérer les demandes de retrait des auteurs</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Toutes
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                En attente
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("approved")}
              >
                Approuvées
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                Complétées
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune demande de retrait</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:border-gold/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        {request.profiles?.avatar_url ? (
                          <img
                            src={request.profiles.avatar_url}
                            alt={request.profiles.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">👤</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{request.profiles?.full_name || "Auteur inconnu"}</p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.profiles?.email}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Montant</p>
                            <p className="font-semibold">{Number(request.amount).toLocaleString()} XOF</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Frais</p>
                            <p className="font-semibold text-red-500">
                              -{Number(request.transaction_fee).toLocaleString()} XOF
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Montant net</p>
                            <p className="font-semibold text-green-600">
                              {Number(request.net_amount).toLocaleString()} XOF
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Méthode</p>
                            <p className="font-semibold">{getPaymentMethodLabel(request.payment_method)}</p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Demandé le {new Date(request.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {request.admin_notes && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="text-xs text-muted-foreground mb-1">Note admin:</p>
                            <p className="text-sm">{request.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionDialog("approve");
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionDialog("reject");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === "approve" ? "Approuver la demande" : "Rejeter la demande"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === "approve"
                ? "Confirmez l'approbation de cette demande de retrait"
                : "Indiquez la raison du rejet"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted">
                <p className="text-sm mb-2">
                  <span className="font-semibold">Auteur:</span> {selectedRequest.profiles?.full_name}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Montant net:</span>{" "}
                  {Number(selectedRequest.net_amount).toLocaleString()} XOF
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Méthode:</span>{" "}
                  {getPaymentMethodLabel(selectedRequest.payment_method)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes">
                  {actionDialog === "approve" ? "Note (optionnel)" : "Raison du rejet"}
                </Label>
                <Textarea
                  id="admin-notes"
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    actionDialog === "approve"
                      ? "Ajouter une note..."
                      : "Expliquez la raison du rejet..."
                  }
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setActionDialog(null)}>
                  Annuler
                </Button>
                <Button
                  variant={actionDialog === "approve" ? "default" : "destructive"}
                  onClick={() => handleAction(actionDialog!)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : actionDialog === "approve" ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {actionDialog === "approve" ? "Approuver" : "Rejeter"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}