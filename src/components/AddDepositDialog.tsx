import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepositSource, todayISO } from "@/lib/storage";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onAdd: (amount: number, note: string, date: string, source: DepositSource) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

const QUICK = [50, 100, 250, 500];

const AddDepositDialog = ({ onAdd, open: externalOpen, onOpenChange: setExternalOpen, showTrigger = true }: Props) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState<DepositSource>("salario");
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount.replace(",", "."));
    if (!n || n <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setLoading(true);
    try {
      await onAdd(n, note, date, source);
      setAmount("");
      setNote("");
      setSource("salario");
      setIsOpen(false);
      toast.success("Aporte registrado! 💰");
    } catch (error) {
      toast.error("Erro ao registrar aporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showTrigger && (
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="w-full h-16 text-lg font-bold gradient-primary text-primary-foreground shadow-glow hover:shadow-elegant transition-smooth"
        >
          <Plus className="w-6 h-6 mr-2" />
          Adicionar aporte
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md p-6 bg-background rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h2 className="font-display text-2xl font-bold mb-6">Novo aporte</h2>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-bold h-14"
                  autoFocus
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
                </div>
              </div>

              <div className="space-y-2">
                <Label>Origem</Label>
                <Select value={source} onValueChange={(v) => setSource(v as DepositSource)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salario">💼 Salário</SelectItem>
                    <SelectItem value="renda_extra">⚡ Renda extra</SelectItem>
                    <SelectItem value="venda">🏷️ Venda</SelectItem>
                    <SelectItem value="outro">✨ Outro</SelectItem>
                  </SelectContent>
                </Select>
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
                    placeholder="Ex: bônus"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground font-bold h-14"
              >
                {loading ? "Salvando..." : "Adicionar aporte"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDepositDialog;
