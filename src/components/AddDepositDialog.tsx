import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onAdd: (amount: number, note: string, date: string, source: DepositSource) => void;
}

const QUICK = [50, 100, 250, 500];

const AddDepositDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState<DepositSource>("salario");
  const [date, setDate] = useState(todayISO());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount.replace(",", "."));
    if (!n || n <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    onAdd(n, note, date, source);
    setAmount("");
    setNote("");
    setSource("salario");
    setOpen(false);
    toast.success("Aporte registrado! 💰");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full h-16 text-lg font-bold gradient-primary text-primary-foreground shadow-glow hover:shadow-elegant transition-smooth"
        >
          <Plus className="w-6 h-6 mr-2" />
          Adicionar valor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Novo aporte</DialogTitle>
        </DialogHeader>
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
            className="w-full gradient-primary text-primary-foreground font-bold"
          >
            Adicionar aporte
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepositDialog;
