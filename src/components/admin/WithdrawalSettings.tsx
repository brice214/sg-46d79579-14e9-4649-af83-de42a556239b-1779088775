import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withdrawalService } from "@/services/withdrawalService";
import { Settings, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WithdrawalSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [minimumAmount, setMinimumAmount] = useState(10000);
  const [feeType, setFeeType] = useState<"percentage" | "fixed">("percentage");
  const [feeValue, setFeeValue] = useState(2.5);
  const [feeMinimum, setFeeMinimum] = useState(500);
  const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(true);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const settings = await withdrawalService.getWithdrawalSettings();
    
    if (settings) {
      setMinimumAmount(settings.minimum_amount);
      setFeeType(settings.transaction_fee.type);
      setFeeValue(settings.transaction_fee.value);
      setFeeMinimum(settings.transaction_fee.minimum || 500);
      setMobileMoneyEnabled(settings.methods.mobile_money);
      setBankTransferEnabled(settings.methods.bank_transfer);
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const success = await withdrawalService.updateWithdrawalSettings({
      minimum_amount: minimumAmount,
      currency: "XOF",
      transaction_fee: {
        type: feeType,
        value: feeValue,
        minimum: feeType === "percentage" ? feeMinimum : undefined,
      },
      methods: {
        mobile_money: mobileMoneyEnabled,
        bank_transfer: bankTransferEnabled,
      },
    });

    if (success) {
      toast({
        title: "✅ Paramètres enregistrés",
        description: "Les paramètres de retrait ont été mis à jour avec succès",
      });
    } else {
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-gold/20 shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Settings className="h-6 w-6 text-gold" />
            Paramètres de retrait
          </CardTitle>
          <CardDescription>
            Configurez les conditions de retrait pour les auteurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Minimum Amount */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">💰 Montant minimum</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Montant minimum qu'un auteur doit avoir pour demander un retrait
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-amount">Montant minimum (XOF)</Label>
              <Input
                id="min-amount"
                type="number"
                min="0"
                step="1000"
                value={String(minimumAmount)}
                onChange={(e) => setMinimumAmount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Les auteurs devront avoir au moins {minimumAmount.toLocaleString()} XOF pour demander un retrait
              </p>
            </div>
          </div>

          {/* Transaction Fees */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">💳 Frais de transaction</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Frais prélevés sur chaque retrait
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fee-type">Type de frais</Label>
                <select
                  id="fee-type"
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as "percentage" | "fixed")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (XOF)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee-value">
                  {feeType === "percentage" ? "Pourcentage" : "Montant"}
                </Label>
                <Input
                  id="fee-value"
                  type="number"
                  min="0"
                  step={feeType === "percentage" ? "0.1" : "100"}
                  value={String(feeValue)}
                  onChange={(e) => setFeeValue(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {feeType === "percentage"
                    ? `${feeValue}% du montant retiré`
                    : `${feeValue.toLocaleString()} XOF par retrait`}
                </p>
              </div>
            </div>

            {feeType === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="fee-minimum">Frais minimum (XOF)</Label>
                <Input
                  id="fee-minimum"
                  type="number"
                  min="0"
                  step="100"
                  value={String(feeMinimum)}
                  onChange={(e) => setFeeMinimum(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Montant minimum de frais même si le pourcentage est inférieur
                </p>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">🔄 Méthodes de retrait</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Méthodes de paiement disponibles pour les retraits
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <p className="font-medium">Mobile Money</p>
                    <p className="text-sm text-muted-foreground">
                      MTN, Orange Money, Moov Money
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={mobileMoneyEnabled}
                  onChange={(e) => setMobileMoneyEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    🏦
                  </div>
                  <div>
                    <p className="font-medium">Virement bancaire</p>
                    <p className="text-sm text-muted-foreground">
                      Transfert vers compte bancaire
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={bankTransferEnabled}
                  onChange={(e) => setBankTransferEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les paramètres
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}