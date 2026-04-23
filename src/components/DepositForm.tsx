import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Coins } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onAdd: (amount: number, note: string, date: string) => void;
  suggestedAmount?: number;
}

const QUICK = [50, 100, 250, 500];

const DepositForm = ({ onAdd, suggestedAmount }: Props) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount.replace(",", "."));
    if (!n || n <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    onAdd(n, note, date);
    setAmount("");
    setNote("");
    toast.success("Aporte registrado! 💰");
  };

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Coins className="w-5 h-5" />
        </div>
        <h2 className="font-display text-xl font-bold">Registrar aporte</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder={
              suggestedAmount ? `Sugerido: ${suggestedAmount.toFixed(2)}` : "0,00"
            }
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-semibold h-12"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                +R$ {v}
              </button>
            ))}
            {suggestedAmount && (
              <button
                type="button"
                onClick={() => setAmount(suggestedAmount.toFixed(2))}
                className="px-3 py-1.5 rounded-full gradient-gold text-accent-foreground text-sm font-bold hover:shadow-soft transition-smooth"
              >
                Meta semanal
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Input
              id="note"
              placeholder="Ex: salário"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full gradient-primary text-primary-foreground font-bold shadow-soft hover:shadow-glow transition-smooth">
          <Plus className="w-5 h-5 mr-1" />
          Adicionar aporte
        </Button>
      </form>
    </Card>
  );
};

export default DepositForm;
